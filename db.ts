import { drizzle } from "drizzle-orm/node-postgres";
import { schemaAuth } from "@/auth-schema";
import { schema } from "@/app-schema";
import pool from "pg";
const { Pool } = pool;

export const poolClient = new Pool({
  connectionString: process.env.DATABASE_URL!,
})
  .on("connect", async () => {
    console.log("Successfully connect to PostgreSQL");
  })
  .on("error", (err, client) => {
    if (err) return err.message;
    return client.connect();
  });

export const db = drizzle(poolClient, {
  schema: {
    ...schemaAuth,
    ...schema,
  },
});
