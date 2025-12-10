import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { schemaAuth } from "@/auth-schema";
import { schema } from "@/app-schema";

export const sql = postgres(process.env.DATABASE_URL!, {
  ssl: false,
});

export const db = drizzle(sql, {
  schema: {
    ...schemaAuth,
    ...schema,
  },
});
