/**
 * Módulo de Precios y Cálculos
 * 
 * Define la lógica de precios para canchas incluyendo:
 * - Precios base por tipo de cancha
 * - Recargos por horario (después de las 5 PM)
 * - Cálculos de precios finales
 */

export const FIELD_BASE_PRICES = {
  "futbol-6": 100000, // $100.000 COP
  padel: 120000, // $120.000 COP
} as const;

// Horario de recargo: después de las 5 PM (17:00)
const SURCHARGE_START_HOUR = 17;
const SURCHARGE_PERCENTAGE = 2; // 2% de recargo

/**
 * Calcula el precio con recargo según la hora
 * @param basePrice - Precio base de la cancha
 * @param hour - Hora en formato 24h (0-23)
 * @returns Precio final con recargo si aplica
 */
export const calculatePrice = (basePrice: number, hour: number): number => {
  if (hour >= SURCHARGE_START_HOUR) {
    return Math.round(basePrice * (1 + SURCHARGE_PERCENTAGE / 100));
  }
  return basePrice;
};

/**
 * Obtiene el precio base para un tipo de cancha
 * @param fieldType - Tipo de cancha: 'futbol-6' o 'padel'
 * @returns Precio base en COP
 */
export const getBasePrice = (fieldType: string): number => {
  const price = FIELD_BASE_PRICES[fieldType as keyof typeof FIELD_BASE_PRICES];
  return price || FIELD_BASE_PRICES["futbol-6"];
};

/**
 * Calcula el precio final incluyendo recargo por horario
 * @param fieldType - Tipo de cancha
 * @param hour - Hora en formato 24h
 * @returns Precio final en COP
 */
export const getFinalPrice = (fieldType: string, hour: number): number => {
  const basePrice = getBasePrice(fieldType);
  return calculatePrice(basePrice, hour);
};

/**
 * Obtiene información de precios para un rango horario
 * @param fieldType - Tipo de cancha
 * @param startHour - Hora de inicio
 * @param endHour - Hora de fin
 * @returns Array con información de precios por hora
 */
export const getPriceRange = (
  fieldType: string,
  startHour: number,
  endHour: number
) => {
  const basePrice = getBasePrice(fieldType);
  const prices = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const finalPrice = calculatePrice(basePrice, hour);
    const hasSurcharge = hour >= SURCHARGE_START_HOUR;

    prices.push({
      hour,
      displayHour: `${hour.toString().padStart(2, "0")}:00`,
      basePrice,
      finalPrice,
      hasSurcharge,
      surchargeAmount: hasSurcharge
        ? finalPrice - basePrice
        : 0,
    });
  }

  return prices;
};

/**
 * Formatea precio en COP
 * @param price - Precio en COP
 * @returns Precio formateado como string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};
