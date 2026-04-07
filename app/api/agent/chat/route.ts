import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(messages: object[], tools: object[], toolChoice: string | object = "auto") {
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 2000,
    temperature: 0.3,
    messages,
  };
  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = toolChoice;
  }
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`);
  return res.json();
}

const TOOLS = [
  // ── READ ──────────────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "list_clients",
      description: "List all clients (vessel owners, brokers, charter operators). Use when asked about clients, who is active, revenue.",
      parameters: {
        type: "object",
        properties: {
          stage: { type: "string", description: "Filter: LEAD, ACTIVE, REPEAT, INACTIVE. Omit for all." },
          clientType: { type: "string", description: "Filter: VESSEL_OWNER, BROKER, CHARTER_OP. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_leads",
      description: "List all leads/enquiries. Use when asked about new enquiries, pipeline, prospects.",
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
      name: "list_vessels",
      description: "List vessels, optionally filtered by client or listing status.",
      parameters: {
        type: "object",
        properties: {
          clientId: { type: "string", description: "Filter by client ID." },
          listingStatus: { type: "string", description: "Filter: FOR_SALE, CHARTER, PRIVATE, SOLD. Omit for all." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_shoots",
      description: "List shoots/bookings, optionally filtered by status.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: ENQUIRY, BOOKED, COMPLETED, DELIVERED. Omit for all." },
          vesselId: { type: "string", description: "Filter by vessel ID." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_expenses",
      description: "List expenses, optionally filtered by month.",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string", description: "Filter by month string e.g. '2026-04'." },
        },
      },
    },
  },
  // ── CREATE ────────────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "create_client",
      description: "Add a new client (vessel owner, broker, or charter operator).",
      parameters: {
        type: "object",
        properties: {
          companyName: { type: "string" },
          contactName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          clientType: { type: "string", description: "VESSEL_OWNER, BROKER, CHARTER_OP" },
          stage: { type: "string", description: "LEAD, ACTIVE, REPEAT, INACTIVE" },
          location: { type: "string" },
          notes: { type: "string" },
          monthlyValue: { type: "number" },
        },
        required: ["companyName", "contactName", "email"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_client",
      description: "Update an existing client. Only include fields to change.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          companyName: { type: "string" },
          contactName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          clientType: { type: "string" },
          stage: { type: "string" },
          location: { type: "string" },
          notes: { type: "string" },
          monthlyValue: { type: "number" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_client",
      description: "Delete a client by ID.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_vessel",
      description: "Add a new vessel for a client.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          clientId: { type: "string" },
          vesselType: { type: "string", description: "MOTOR_YACHT, SAILING, CATAMARAN, SUPERYACHT, SPORTFISH" },
          lengthM: { type: "number", description: "Length in meters" },
          listingPrice: { type: "number" },
          marina: { type: "string" },
          listingStatus: { type: "string", description: "FOR_SALE, CHARTER, PRIVATE, SOLD" },
        },
        required: ["name", "clientId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_vessel",
      description: "Update a vessel's details or listing status.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          vesselType: { type: "string" },
          lengthM: { type: "number" },
          listingPrice: { type: "number" },
          marina: { type: "string" },
          listingStatus: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_shoot",
      description: "Book a new shoot for a vessel.",
      parameters: {
        type: "object",
        properties: {
          vesselId: { type: "string" },
          shootDate: { type: "string", description: "ISO date string e.g. 2026-05-01" },
          location: { type: "string" },
          services: { type: "string", description: "Comma-separated: PHOTO,VIDEO,REEL,VIRTUAL_TOUR" },
          status: { type: "string", description: "ENQUIRY, BOOKED, COMPLETED, DELIVERED" },
          budget: { type: "number" },
          notes: { type: "string" },
          weatherNotes: { type: "string" },
        },
        required: ["vesselId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_shoot",
      description: "Update a shoot's status, date, or notes.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          shootDate: { type: "string" },
          location: { type: "string" },
          services: { type: "string" },
          status: { type: "string" },
          budget: { type: "number" },
          notes: { type: "string" },
          weatherNotes: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_lead",
      description: "Add a new lead/enquiry.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          vesselName: { type: "string" },
          vesselType: { type: "string" },
          location: { type: "string" },
          servicesInterested: { type: "string" },
          budget: { type: "string" },
          timeline: { type: "string" },
          stage: { type: "string", description: "NEW, CONTACTED, QUOTED, BOOKED, LOST" },
          notes: { type: "string" },
          source: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead",
      description: "Update a lead's stage, notes, or other info.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          vesselName: { type: "string" },
          location: { type: "string" },
          servicesInterested: { type: "string" },
          budget: { type: "string" },
          timeline: { type: "string" },
          stage: { type: "string" },
          notes: { type: "string" },
          source: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_lead",
      description: "Delete a lead by ID.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_expense",
      description: "Log a new expense.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          amount: { type: "number" },
          purpose: { type: "string" },
          month: { type: "string", description: "YYYY-MM format e.g. 2026-04" },
        },
        required: ["title", "amount", "month"],
      },
    },
  },
  // ── MEMORY ────────────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Save a fact to persistent memory for future conversations.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string" },
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
        const where: Record<string, unknown> = {};
        if (args.stage) where.stage = args.stage;
        if (args.clientType) where.clientType = args.clientType;
        const clients = await prisma.client.findMany({ where, include: { vessels: true }, orderBy: { createdAt: "desc" } });
        return JSON.stringify(clients);
      }
      case "list_leads": {
        const where = args.stage ? { stage: args.stage as string } : {};
        const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
        return JSON.stringify(leads);
      }
      case "list_vessels": {
        const where: Record<string, unknown> = {};
        if (args.clientId) where.clientId = args.clientId;
        if (args.listingStatus) where.listingStatus = args.listingStatus;
        const vessels = await prisma.vessel.findMany({ where, include: { client: true, shoots: true }, orderBy: { createdAt: "desc" } });
        return JSON.stringify(vessels);
      }
      case "list_shoots": {
        const where: Record<string, unknown> = {};
        if (args.status) where.status = args.status;
        if (args.vesselId) where.vesselId = args.vesselId;
        const shoots = await prisma.shoot.findMany({ where, include: { vessel: { include: { client: true } } }, orderBy: { createdAt: "desc" } });
        return JSON.stringify(shoots);
      }
      case "list_expenses": {
        const where = args.month ? { month: args.month as string } : {};
        const expenses = await prisma.expense.findMany({ where, orderBy: { createdAt: "desc" } });
        return JSON.stringify(expenses);
      }

      case "create_client": {
        const client = await prisma.client.create({
          data: {
            companyName: args.companyName as string,
            contactName: args.contactName as string,
            email: args.email as string,
            phone: args.phone as string | undefined,
            clientType: (args.clientType as string) ?? "VESSEL_OWNER",
            stage: (args.stage as string) ?? "LEAD",
            location: args.location as string | undefined,
            notes: args.notes as string | undefined,
            monthlyValue: args.monthlyValue ? Number(args.monthlyValue) : undefined,
          },
        });
        return `Client created: ${client.companyName} (ID: ${client.id})`;
      }
      case "update_client": {
        const { id, monthlyValue, ...fields } = args;
        const client = await prisma.client.update({
          where: { id: id as string },
          data: { ...fields as Record<string, unknown>, ...(monthlyValue !== undefined ? { monthlyValue: Number(monthlyValue) } : {}) },
        });
        return `Client updated: ${client.companyName}`;
      }
      case "delete_client": {
        await prisma.client.delete({ where: { id: args.id as string } });
        return `Client deleted (ID: ${args.id})`;
      }

      case "create_vessel": {
        const vessel = await prisma.vessel.create({
          data: {
            name: args.name as string,
            clientId: args.clientId as string,
            vesselType: (args.vesselType as string) ?? "MOTOR_YACHT",
            lengthM: args.lengthM ? Number(args.lengthM) : undefined,
            listingPrice: args.listingPrice ? Number(args.listingPrice) : undefined,
            marina: args.marina as string | undefined,
            listingStatus: (args.listingStatus as string) ?? "PRIVATE",
          },
        });
        return `Vessel created: ${vessel.name} (ID: ${vessel.id})`;
      }
      case "update_vessel": {
        const { id, lengthM, listingPrice, ...fields } = args;
        const vessel = await prisma.vessel.update({
          where: { id: id as string },
          data: {
            ...fields as Record<string, unknown>,
            ...(lengthM !== undefined ? { lengthM: Number(lengthM) } : {}),
            ...(listingPrice !== undefined ? { listingPrice: Number(listingPrice) } : {}),
          },
        });
        return `Vessel updated: ${vessel.name}`;
      }

      case "create_shoot": {
        const shoot = await prisma.shoot.create({
          data: {
            vesselId: args.vesselId as string,
            shootDate: args.shootDate ? new Date(args.shootDate as string) : undefined,
            location: args.location as string | undefined,
            services: (args.services as string) ?? "PHOTO",
            status: (args.status as string) ?? "ENQUIRY",
            budget: args.budget ? Number(args.budget) : undefined,
            notes: args.notes as string | undefined,
            weatherNotes: args.weatherNotes as string | undefined,
          },
        });
        return `Shoot created (ID: ${shoot.id})`;
      }
      case "update_shoot": {
        const { id, shootDate, budget, ...fields } = args;
        const shoot = await prisma.shoot.update({
          where: { id: id as string },
          data: {
            ...fields as Record<string, unknown>,
            ...(shootDate ? { shootDate: new Date(shootDate as string) } : {}),
            ...(budget !== undefined ? { budget: Number(budget) } : {}),
          },
        });
        return `Shoot updated (ID: ${shoot.id})`;
      }

      case "create_lead": {
        const lead = await prisma.lead.create({
          data: {
            name: args.name as string,
            email: args.email as string | undefined,
            phone: args.phone as string | undefined,
            vesselName: args.vesselName as string | undefined,
            vesselType: args.vesselType as string | undefined,
            location: args.location as string | undefined,
            servicesInterested: args.servicesInterested as string | undefined,
            budget: args.budget as string | undefined,
            timeline: args.timeline as string | undefined,
            stage: (args.stage as string) ?? "NEW",
            notes: args.notes as string | undefined,
            source: args.source as string | undefined,
          },
        });
        return `Lead created: ${lead.name} (ID: ${lead.id})`;
      }
      case "update_lead": {
        const { id, ...fields } = args;
        const lead = await prisma.lead.update({ where: { id: id as string }, data: fields as Record<string, unknown> });
        return `Lead updated: ${lead.name}`;
      }
      case "delete_lead": {
        await prisma.lead.delete({ where: { id: args.id as string } });
        return `Lead deleted (ID: ${args.id})`;
      }

      case "create_expense": {
        const expense = await prisma.expense.create({
          data: {
            title: args.title as string,
            amount: Number(args.amount),
            purpose: args.purpose as string | undefined,
            month: args.month as string,
          },
        });
        return `Expense logged: ${expense.title} — $${expense.amount}`;
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
    if (!message || !sessionId) {
      return NextResponse.json({ error: "message and sessionId required" }, { status: 400 });
    }

    const [memoryRows, historyRows] = await Promise.all([
      prisma.agentMemory.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.agentConversation.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
    ]);

    const memorySection = memoryRows.length > 0
      ? `\n\n[PERSISTENT MEMORY]\n${memoryRows.map((m) => `• ${m.key}: ${m.value}`).join("\n")}\n`
      : "";

    const systemPrompt = `You are an AI assistant for Vela Marine, a marine photography and videography company.

You have full read and write access to the CRM. You can:
- List, create, update, and delete clients (vessel owners, brokers, charter operators)
- List, create, and update vessels and shoots
- List, create, update, and delete leads/enquiries
- Log expenses
- Save notes to persistent memory

Services: Yacht Photography, Vessel Video, Social Media Reels, Virtual Tours.

Be concise. Always fetch real data before answering questions about it. Confirm actions after completing them.${memorySection}`;

    const apiMessages: object[] = [
      ...historyRows.map((r) => ({ role: r.role, content: r.content })),
      { role: "user", content: message },
    ];

    let loopMessages = [...apiMessages];
    let finalReply = "";
    let iterations = 0;

    let data = await callGroq([{ role: "system", content: systemPrompt }, ...loopMessages], TOOLS, "auto");

    while (data.choices?.[0]?.finish_reason === "tool_calls" && iterations < 8) {
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

      loopMessages = [
        ...loopMessages,
        { role: "assistant", content: assistantMsg.content ?? null, tool_calls: toolCalls },
        ...toolResults,
      ];

      data = await callGroq([{ role: "system", content: systemPrompt }, ...loopMessages], TOOLS, "auto");
    }

    finalReply = data.choices?.[0]?.message?.content ?? "Done.";

    await prisma.agentConversation.createMany({
      data: [
        { sessionId, role: "user", content: message },
        { sessionId, role: "assistant", content: finalReply },
      ],
    });

    return NextResponse.json({ reply: finalReply });
  } catch (e: unknown) {
    console.error("Agent chat error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Agent error" }, { status: 500 });
  }
}
