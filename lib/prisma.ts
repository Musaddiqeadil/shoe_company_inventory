import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot-reloads in dev to avoid exhausting
// database connections. The connection string comes from DATABASE_URL
// (see .env locally, and Vercel env vars in production) — a MongoDB URL.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
