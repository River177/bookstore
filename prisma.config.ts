// prisma/prisma.config.ts
import path from "path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
