import { db, sql } from "../db";
import { role } from "../auth-schema";

const main = async () => {
  await db.transaction(async (tx) => {
    await tx.insert(role).values({ name: "client" });
    await tx.insert(role).values({ name: "instructor" });
    await tx.insert(role).values({ name: "admin" });
  });

  // IMPORTANTE → cerrar conexión
  await sql.end({ timeout: 5 });
};

main().then(() => {
  console.log("Roles insertados correctamente");
}).catch((err) => {
  console.error("Error en seed:", err);
  sql.end({ timeout: 5 });
});
