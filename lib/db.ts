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

// Calcular precio base según si es después de las 5 PM
const calculatePrice = (hour: number, basePrice: number) => {
  // Después de las 5 PM (17:00) hay recargo de 2%
  if (hour >= 17) {
    return (basePrice * 1.02).toString();
  }
  return basePrice.toString();
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

    // Precios base por tipo de cancha
    const basePrices = {
      "futbol-6": 100000, // $100.000 COP
      padel: 120000, // $120.000 COP
    };

    // Crear franjas horarias para cada cancha
    console.log("🕐 Creando franjas horarias...");
    const timeSlots = generateTimeSlots();
    let timeslotCount = 0;

    for (let fieldIndex = 0; fieldIndex < fieldIds.length; fieldIndex++) {
      const fieldId = fieldIds[fieldIndex];
      const fieldType = fieldsData[fieldIndex].type;
      const basePrice = basePrices[fieldType];

      // Crear franjas para cada día de la semana
      for (const day of DAYS_OF_WEEK) {
        for (const slot of timeSlots) {
          // Crear timeslot
          const [insertedTimeslot] = await tx
            .insert(timeslot)
            .values({
              fieldId,
              dayOfWeek: day,
              startTime: new Date(`2024-01-01T${slot.start}:00Z`),
              endTime: new Date(`2024-01-01T${slot.end}:00Z`),
              isActive: true,
            })
            .returning({ id: timeslot.id });

          // Crear precio asociado a la franja
          const slotPrice = calculatePrice(slot.hour, basePrice);

          await tx.insert(price).values({
            fieldId,
            timeslotId: insertedTimeslot.id,
            priceAmount: slotPrice,
            currency: "COP",
            isActive: true,
          });

          timeslotCount++;
        }
      }

      console.log(
        `  ✓ ${fieldsData[fieldIndex].name}: ${timeSlots.length * DAYS_OF_WEEK.length} franjas creadas`
      );
    }

    console.log(`✅ Total de ${timeslotCount} franjas horarias creadas`);
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
    console.log("║ Recargo después de 5 PM: 2%           ║");
    console.log("╚════════════════════════════════════════╝\n");
  })
  .catch((err) => {
    console.error("❌ Error en seed:", err);
    poolClient.end();
  });
