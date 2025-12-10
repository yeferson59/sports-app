import { role } from "../auth-schema";
import { db } from "../db";

const main = async () => {
  await db.transaction(async (tx) => {
    await tx.insert(role).values({ name: "client" });
    await tx.insert(role).values({ name: "instructor" });
    await tx.insert(role).values({ name: "admin" });
  });
};

await main();
