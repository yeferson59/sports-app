import { db, poolClient } from "../db";
import { role } from "../auth-schema";
import { field, timeslot, price } from "../app-schema";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Crear franjas horarias de 8 AM a 9 PM en intervalos de 1 hora
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 21; hour++) {
    const startHour = hour.toString().padStart(2, "0");
    const endHour = (hour + 1).toString().padStart(2, "0");
    slots.push({
      start: `${startHour}:00`,
      end: `${endHour}:00`,
      hour,
    });
  }
  return slots;
};



const main = async () => {
  await db.transaction(async (tx) => {
    // Insertar roles
    console.log("📋 Insertando roles...");
    await tx.insert(role).values({ name: "client" });
    await tx.insert(role).values({ name: "instructor" });
    await tx.insert(role).values({ name: "admin" });
    console.log("✅ Roles insertados correctamente");

    // Insertar canchas (2 fútbol 6 y 2 pádel)
    console.log("⚽ Creando canchas...");
    const fieldsData = [
      { name: "Cancha Fútbol 6 - 1", type: "futbol-6" as const },
      { name: "Cancha Fútbol 6 - 2", type: "futbol-6" as const },
      { name: "Cancha Pádel - 1", type: "padel" as const },
      { name: "Cancha Pádel - 2", type: "padel" as const },
    ];

    const fieldIds: string[] = [];

    for (const fieldData of fieldsData) {
      const [insertedField] = await tx
        .insert(field)
        .values({
          name: fieldData.name,
          typeField: fieldData.type,
          isActive: true,
        })
        .returning({ id: field.id });

      fieldIds.push(insertedField.id);
      console.log(`  ✓ ${fieldData.name} creada`);
    }

    // Crear franjas horarias genéricas (sin asignar a canchas)
    console.log("🕐 Creando franjas horarias genéricas...");
    const timeSlots = generateTimeSlots();
    let timeslotCount = 0;

    // Crear franjas para cada día de la semana
    for (const day of DAYS_OF_WEEK) {
      for (const slot of timeSlots) {
        // Crear timeslot usando Date.UTC para evitar conversión de zona horaria
        const startDate = new Date(Date.UTC(2024, 0, 1, slot.hour, 0, 0));
        const endDate = new Date(Date.UTC(2024, 0, 1, slot.hour + 1, 0, 0));
        
        // Sobrecargo del 2% después de las 5 PM (17:00)
        const surcharge = slot.hour >= 17 ? "2" : "0";
        
        await tx
          .insert(timeslot)
          .values({
            dayOfWeek: day,
            startTime: startDate,
            endTime: endDate,
            surchargePercent: surcharge,
            isActive: true,
          });

        timeslotCount++;
      }
    }

    console.log(`✅ Total de ${timeslotCount} franjas horarias genéricas creadas`);
  });

  await poolClient.end();
};

main()
  .then(() => {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   ✅ DATOS DE SEMILLA INSERTADOS      ║");
    console.log("╠════════════════════════════════════════╣");
    console.log("║ Roles: 3                               ║");
    console.log("║ Canchas: 4 (2 Fútbol 6, 2 Pádel)      ║");
    console.log("║ Franjas horarias: 8 AM - 9 PM         ║");
    console.log("║ (Sin asignar a canchas - Admin lo    ║");
    console.log("║  asignará después)                     ║");
    console.log("╚════════════════════════════════════════╝\n");
  })
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    poolClient.end();
  });
