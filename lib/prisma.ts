import { PrismaClient } from "@prisma/client";

// Global singleton to avoid multiple clients in dev hot reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Return a proxy that throws informative error if used without DB URL
    const handler: ProxyHandler<object> = {
      get(_, prop) {
        throw new Error(
          "PrismaClient accessed during build without DATABASE_URL. " +
          `Attempted to read property "${String(prop)}".`
        );
      },
    };
    return new Proxy({}, handler) as unknown as PrismaClient;
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
