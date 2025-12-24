export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km)) return "";

  // 1 km altı sabit
  if (km < 1) {
    return "1 km";
  }

  // km → metreye çevir
  const meters = Math.floor(km * 1000);

  // tekrar km formatı (1.200 km gibi)
  const kmFormatted = (meters / 1000).toFixed(3);

  // Türkçe binlik ayırıcı
  const [intPart, decimalPart] = kmFormatted.split(".");
  const intFormatted = Number(intPart).toLocaleString("tr-TR");

  return `${intFormatted}.${decimalPart} km`;
}
