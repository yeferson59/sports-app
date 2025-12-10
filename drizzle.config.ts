import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config(); 

export default defineConfig({
  out: "./drizzle",
  schema: ["./auth-schema.ts", "./app-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
