/**
 * EJEMPLOS DE USO - Sistema de Precios de Canchas
 *
 * Este archivo contiene ejemplos prácticos de cómo usar
 * el módulo de precios en diferentes contextos de la aplicación
 */

import {
  FIELD_BASE_PRICES,
  calculatePrice,
  getBasePrice,
  getFinalPrice,
  formatPrice,
  getPriceRange,
} from "@/lib/pricing";

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 1: Obtener Precio Simple
// ═══════════════════════════════════════════════════════════════════════════

function ejemplo1_getPriceSimple() {
  // Obtener precio para Fútbol 6 a las 10 AM
  const price = getFinalPrice("futbol-6", 10);
  console.log(`Precio a las 10 AM: $${price}`); // $100.000

  // Obtener precio para Pádel a las 6 PM (con recargo)
  const priceWithSurcharge = getFinalPrice("padel", 18);
  console.log(`Precio a las 6 PM: $${priceWithSurcharge}`); // $122.400
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 2: Formatear Precios para UI
// ═══════════════════════════════════════════════════════════════════════════

function ejemplo2_formatPrice() {
  const price = getFinalPrice("futbol-6", 17);
  const formatted = formatPrice(price);

  console.log(`Precio formateado: ${formatted}`); // "$102.000"

  // Útil para mostrar en componentes React:
  return <div className="text-2xl font-bold">{formatted}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 3: Mostrar Tabla de Precios por Rango Horario
// ═══════════════════════════════════════════════════════════════════════════

function ejemplo3_priceRange() {
  // Obtener precios para Pádel desde 8 AM hasta 9 PM
  const priceRange = getPriceRange("padel", 8, 21);

  console.log("Tabla de Precios - Pádel:");
  console.log("─────────────────────────────");

  priceRange.forEach((slot) => {
    const surchargeLabel = slot.hasSurcharge ? " ⚠️ RECARGO" : "";
    console.log(
      `${slot.displayHour} - ${formatPrice(slot.finalPrice)}${surchargeLabel}`,
    );
  });

  // Salida esperada:
  // 08:00 - $120.000
  // 09:00 - $120.000
  // ...
  // 17:00 - $122.400 ⚠️ RECARGO
  // 18:00 - $122.400 ⚠️ RECARGO
  // ...
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 4: Componente React para Mostrar Disponibilidad
// ═══════════════════════════════════════════════════════════════════════════

interface TimeSlotUI {
  hour: number;
  price: number;
  isSurcharge: boolean;
  isAvailable: boolean;
}

function exemplo4_TimeSlotComponent({
  fieldType = "futbol-6",
}: {
  fieldType: string;
}) {
  const slots: TimeSlotUI[] = getPriceRange(fieldType, 8, 21).map((slot) => ({
    hour: slot.hour,
    price: slot.finalPrice,
    isSurcharge: slot.hasSurcharge,
    isAvailable: true, // Obtenido de la BD en un caso real
  }));

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => (
        <div
          key={slot.hour}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            slot.isAvailable
              ? `border-emerald-500/30 hover:border-emerald-500 ${
                  slot.isSurcharge ? "bg-amber-500/10" : "bg-emerald-500/10"
                }`
              : "border-slate-400/30 bg-slate-800/30 opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="text-sm font-semibold">
            {slot.hour.toString().padStart(2, "0")}:00
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {formatPrice(slot.price)}
          </div>
          {slot.isSurcharge && (
            <div className="text-xs text-amber-400 mt-1">+2% Recargo</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 5: Validar y Calcular Precio de Reserva
// ═══════════════════════════════════════════════════════════════════════════

interface BookingRequest {
  fieldType: "futbol-6" | "padel";
  hour: number;
  duration: number; // en horas
}

function ejemplo5_calculateBookingPrice(booking: BookingRequest): {
  hourlyPrice: number;
  totalPrice: number;
  formattedTotal: string;
  breakdown: Array<{ hour: number; price: number }>;
} {
  const breakdown: Array<{ hour: number; price: number }> = [];
  let totalPrice = 0;

  // Calcular precio para cada hora de la reserva
  for (let i = 0; i < booking.duration; i++) {
    const hour = booking.hour + i;
    const hourlyPrice = getFinalPrice(booking.fieldType, hour);
    breakdown.push({ hour, price: hourlyPrice });
    totalPrice += hourlyPrice;
  }

  const hourlyPrice = breakdown[0].price;

  return {
    hourlyPrice,
    totalPrice,
    formattedTotal: formatPrice(totalPrice),
    breakdown,
  };
}

// Uso:
function useExample5() {
  const booking: BookingRequest = {
    fieldType: "futbol-6",
    hour: 17, // 5 PM (hora con recargo)
    duration: 2, // 2 horas
  };

  const result = ejemplo5_calculateBookingPrice(booking);

  console.log(`Reserva: ${booking.fieldType} - ${booking.duration} horas`);
  console.log(`Hora inicio: ${booking.hour}:00`);
  console.log("Desglose:");
  result.breakdown.forEach((item) => {
    console.log(`  ${item.hour}:00 - ${formatPrice(item.price)}`);
  });
  console.log(`Total: ${result.formattedTotal}`);
  // Salida:
  // Total: $204.000 (102.000 × 2)
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 6: Comparar Precios por Tipo de Cancha
// ═══════════════════════════════════════════════════════════════════════════

function ejemplo6_comparePrices() {
  console.log("Comparativa de Precios - Mismo Horario");
  console.log("=====================================");

  const hours = [10, 14, 17, 20];

  hours.forEach((hour) => {
    const futbol6 = getFinalPrice("futbol-6", hour);
    const padel = getFinalPrice("padel", hour);
    const difference = padel - futbol6;

    console.log(`
${hour}:00
  Fútbol 6:  ${formatPrice(futbol6)}
  Pádel:     ${formatPrice(padel)}
  Diferencia: ${formatPrice(difference)} (${((difference / futbol6) * 100).toFixed(1)}%)
`);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 7: Obtener Info de Base de Precios
// ═══════════════════════════════════════════════════════════════════════════

function ejemplo7_basePricesInfo() {
  console.log("Precios Base Disponibles:");
  console.log("─────────────────────────");

  Object.entries(FIELD_BASE_PRICES).forEach(([fieldType, basePrice]) => {
    console.log(`${fieldType}: ${formatPrice(basePrice)}`);
  });

  // También obtener precio base individualmente:
  const futbol6Base = getBasePrice("futbol-6");
  console.log(`\nPrecio base Fútbol 6: ${formatPrice(futbol6Base)}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 8: Detectar Horario con Recargo
// ═══════════════════════════════════════════════════════════════════════════

function ejemplo8_detectSurchargeHour(hour: number): {
  hasSurcharge: boolean;
  label: string;
  percentage: number;
} {
  const hasSurcharge = hour >= 17;

  return {
    hasSurcharge,
    label: hasSurcharge ? "Horario con Recargo" : "Horario Normal",
    percentage: hasSurcharge ? 2 : 0,
  };
}

// Uso:
function useExample8() {
  const info1 = ejemplo8_detectSurchargeHour(14);
  console.log(info1); // { hasSurcharge: false, label: "Horario Normal", percentage: 0 }

  const info2 = ejemplo8_detectSurchargeHour(18);
  console.log(info2); // { hasSurcharge: true, label: "Horario con Recargo", percentage: 2 }
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 9: Usar en Función de Servidor (Server Action)
// ═══════════════════════════════════════════════════════════════════════════

("use server");

async function ejemplo9_getAvailableSlots(fieldType: string) {
  // En un caso real, esto vendría de la base de datos
  const slots = getPriceRange(fieldType, 8, 21);

  return slots.map((slot) => ({
    hour: slot.hour,
    displayTime: slot.displayHour,
    price: slot.finalPrice,
    formattedPrice: formatPrice(slot.finalPrice),
    hasSurcharge: slot.hasSurcharge,
    available: true, // Consultar BD real aquí
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO 10: Mostrar Información de Precios en UI
// ═══════════════════════════════════════════════════════════════════════════

export function PriceInfoComponent() {
  const futbol6Morning = getFinalPrice("futbol-6", 10);
  const futbol6Evening = getFinalPrice("futbol-6", 18);
  const padelMorning = getFinalPrice("padel", 10);
  const padelEvening = getFinalPrice("padel", 18);

  return (
    <div className="p-6 bg-slate-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Información de Precios</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Fútbol 6 */}
        <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/30">
          <h3 className="font-semibold mb-2">Fútbol 6</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400">10:00 AM:</span>
              <span className="ml-2 font-bold text-emerald-400">
                {formatPrice(futbol6Morning)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">6:00 PM:</span>
              <span className="ml-2 font-bold text-amber-400">
                {formatPrice(futbol6Evening)}
              </span>
              <span className="text-xs text-amber-400 ml-2">(+2%)</span>
            </div>
          </div>
        </div>

        {/* Pádel */}
        <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/30">
          <h3 className="font-semibold mb-2">Pádel</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400">10:00 AM:</span>
              <span className="ml-2 font-bold text-emerald-400">
                {formatPrice(padelMorning)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">6:00 PM:</span>
              <span className="ml-2 font-bold text-amber-400">
                {formatPrice(padelEvening)}
              </span>
              <span className="text-xs text-amber-400 ml-2">(+2%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Exportar para uso en la aplicación
// ═══════════════════════════════════════════════════════════════════════════

export {
  ejemplo1_getPriceSimple,
  ejemplo2_formatPrice,
  ejemplo3_priceRange,
  exemplo4_TimeSlotComponent,
  ejemplo5_calculateBookingPrice,
  ejemplo6_comparePrices,
  ejemplo7_basePricesInfo,
  ejemplo8_detectSurchargeHour,
};
