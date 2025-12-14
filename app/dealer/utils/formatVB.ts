// =======================
// VB FORMATTER (BIN / MILYON AYRIMI)
// =======================
export function formatVB(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(value);
}
