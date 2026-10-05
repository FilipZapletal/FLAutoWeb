/** Veřejně zobrazený VIN: první 3 a poslední 4 znaky, např. WBA********0001. */
export function maskVin(vin: string | null | undefined) {
  if (!vin) return null;
  if (vin.length <= 7) return "*".repeat(vin.length);
  return vin.slice(0, 3) + "*".repeat(vin.length - 7) + vin.slice(-4);
}
