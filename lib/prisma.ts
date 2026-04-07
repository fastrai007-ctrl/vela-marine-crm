import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

// Cache in ALL environments — critical for warm Lambda reuse on Netlify
globalForPrisma.prisma = prisma;
