// lib/prisma.ts - Prisma Client Instance
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Create connection pool
const connectionString = process.env.DATABASE_URL;

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // In development, use a global variable to preserve the connection
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };
  
  if (!globalForPrisma.prisma) {
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma;
