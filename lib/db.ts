import { db, poolClient } from "../db";
import { role } from "../auth-schema";

const main = async () => {
  await db.transaction(async (tx) => {
    await tx.insert(role).values({ name: "client" });
    await tx.insert(role).values({ name: "instructor" });
    await tx.insert(role).values({ name: "admin" });
  });

  await poolClient.end();
};

main()
  .then(() => {
    console.log("Roles insertados correctamente");
  })
  .catch((err) => {
    console.error("Error en seed:", err);
    poolClient.end();
  });
