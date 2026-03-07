import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./source/database/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:sqlite.db",
  },
});
