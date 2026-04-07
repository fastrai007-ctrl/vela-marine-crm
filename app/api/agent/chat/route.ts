import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(messages: object[], tools: object[], forceToolUse: boolean) {
  const body: Record<string, unknown> = { model: MODEL, max_tokens: 2000, messages, tools };
  if (forceToolUse && tools.length > 0) body.tool_choice = "required";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`);
  return res.json();
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_clients",
      description: "List all clients/vessel owners. Use when asked about clients, who's active, etc.",
      parameters: {
        type: "object",
        properties: {
          stage: { type: "string", description: "Filter by stage: LEAD, ACTIVE, REPEAT, INACTIVE. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_vessels",
      description: "List all vessels, optionally for a specific client.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "Filter by client company name (partial match). Omit for all." },
          listingStatus: { type: "string", description: "Filter: FOR_SALE, CHARTER, PRIVATE, SOLD. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_shoots",
      description: "List shoot bookings, optionally filtered by status or vessel.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: ENQUIRY, BOOKED, COMPLETED, DELIVERED. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_leads",
      description: "List enquiry leads in the pipeline.",
      parameters: {
        type: "object",
        properties: {
          stage: { type: "string", description: "Filter: NEW, CONTACTED, QUOTED, BOOKED, LOST. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upcoming_shoots",
      description: "Get shoots scheduled in the next 30 days.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Save a fact to persistent memory for future conversations.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "Short unique key e.g. 'pricing_note', 'preferred_location'" },
          value: { type: "string", description: "The fact to remember" },
        },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_memory",
      description: "Delete a fact from persistent memory.",
      parameters: {
        type: "object",
        properties: { key: { type: "string" } },
        required: ["key"],
      },
    },
  },
];

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "list_clients": {
        const where = args.stage ? { stage: args.stage as string } : {};
        const clients = await prisma.client.findMany({
          where,
          orderBy: { companyName: "asc" },
          include: { vessels: { select: { name: true, vesselType: true, listingStatus: true } } },
        });
        return JSON.stringify(clients);
      }
      case "list_vessels": {
        const where: Record<string, unknown> = {};
        if (args.listingStatus) where.listingStatus = args.listingStatus as string;
        if (args.clientName) where.client = { companyName: { contains: args.clientName as string, mode: "insensitive" } };
        const vessels = await prisma.vessel.findMany({
          where,
          include: { client: { select: { companyName: true } } },
          orderBy: { createdAt: "desc" },
        });
        return JSON.stringify(vessels);
      }
      case "list_shoots": {
        const where = args.status ? { status: args.status as string } : {};
        const shoots = await prisma.shoot.findMany({
          where,
          orderBy: { shootDate: "asc" },
          include: { vessel: { select: { name: true, client: { select: { companyName: true } } } } },
          take: 30,
        });
        return JSON.stringify(shoots);
      }
      case "list_leads": {
        const where = args.stage ? { stage: args.stage as string } : {};
        const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 30 });
        return JSON.stringify(leads);
      }
      case "get_upcoming_shoots": {
        const now = new Date();
        const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const shoots = await prisma.shoot.findMany({
          where: { shootDate: { gte: now, lte: in30 }, status: { in: ["BOOKED", "ENQUIRY"] } },
          orderBy: { shootDate: "asc" },
          include: { vessel: { select: { name: true, client: { select: { companyName: true } } } } },
        });
        return JSON.stringify(shoots);
      }
      case "save_memory": {
        await prisma.agentMemory.upsert({
          where: { key: args.key as string },
          create: { key: args.key as string, value: args.value as string },
          update: { value: args.value as string },
        });
        return `Remembered: ${args.key} = ${args.value}`;
      }
      case "delete_memory": {
        await prisma.agentMemory.delete({ where: { key: args.key as string } }).catch(() => {});
        return `Deleted memory: ${args.key}`;
      }
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (e: unknown) {
    return `Tool error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    if (!message || !sessionId) return NextResponse.json({ error: "message and sessionId required" }, { status: 400 });

    const [memoryRows, historyRows] = await Promise.all([
      prisma.agentMemory.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.agentConversation.findMany({ where: { sessionId }, orderBy: { createdAt: "asc" }, take: 40 }),
    ]);

    const memorySection = memoryRows.length > 0
      ? `\n\n[PERSISTENT MEMORY]\n${memoryRows.map(m => `• ${m.key}: ${m.value}`).join("\n")}\n`
      : "";

    const systemPrompt = `You are an AI assistant for Vela Marine Group — a marine media company based in SE Queensland, Australia. You help manage vessel photography/videography clients, shoot bookings, leads, and business operations.

You have tools to read the CRM database. ALWAYS use tools — never tell the user to do something manually.

RULES:
- ALWAYS call a tool for every data request
- For upcoming shoots: call get_upcoming_shoots
- For client/vessel info: call list_clients or list_vessels
- For pipeline: call list_leads
- save_memory for important facts shared (pricing preferences, notes, goals)${memorySection}`;

    const apiMessages: object[] = [
      ...historyRows.map(r => ({ role: r.role, content: r.content })),
      { role: "user", content: message },
    ];
    while (apiMessages.length > 1 && (apiMessages[0] as { role: string }).role !== "user") {
      apiMessages.shift();
    }

    let data = await callGroq([{ role: "system", content: systemPrompt }, ...apiMessages], TOOLS, true);

    if (data.choices?.[0]?.finish_reason === "stop") {
      const reply = data.choices[0].message?.content ?? "";
      await saveConversation(sessionId, message, reply);
      return NextResponse.json({ reply });
    }

    let iterations = 0;
    const loopMessages: object[] = [...apiMessages];

    while (data.choices?.[0]?.finish_reason === "tool_calls" && iterations < 6) {
      iterations++;
      const assistantMsg = data.choices[0].message;
      const toolCalls = assistantMsg.tool_calls ?? [];

      const toolResults = await Promise.all(
        toolCalls.map(async (tc: { id: string; function: { name: string; arguments: string } }) => ({
          role: "tool" as const,
          tool_call_id: tc.id,
          content: await executeTool(tc.function.name, JSON.parse(tc.function.arguments || "{}")),
        }))
      );

      loopMessages.push({ role: "assistant", content: assistantMsg.content, tool_calls: toolCalls });
      loopMessages.push(...toolResults);
      data = await callGroq([{ role: "system", content: systemPrompt }, ...loopMessages], TOOLS, false);
    }

    const reply = data.choices?.[0]?.message?.content ?? "Done.";
    await saveConversation(sessionId, message, reply);
    return NextResponse.json({ reply });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Agent error" }, { status: 500 });
  }
}

async function saveConversation(sessionId: string, userMsg: string, assistantMsg: string) {
  await prisma.agentConversation.createMany({
    data: [
      { sessionId, role: "user", content: userMsg },
      { sessionId, role: "assistant", content: assistantMsg },
    ],
  });
}
