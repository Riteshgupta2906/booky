// Prisma v7: connection URLs moved here from schema.prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the DIRECT URL (port 5432) for migrations — PgBouncer (pooled) doesn't support them
    url: process.env["DIRECT_URL"],
  },
});
