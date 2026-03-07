import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema.ts";

const client = createClient({
  url: Deno.env.get("DB_URL") ?? "file:sqlite.db",
});

export const db = drizzle(client, { schema });
