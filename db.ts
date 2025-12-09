import { drizzle } from "drizzle-orm/node-postgres";
import { schemaAuth, role } from "@/auth-schema";
import { schema } from "@/app-schema";
export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...schemaAuth, ...schema, role },
});
