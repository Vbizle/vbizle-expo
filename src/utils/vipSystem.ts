// src/utils/vipSystem.ts

// VIP seviye aralıkları
export function getVipRank(vipScore: number = 0): number {
  if (vipScore < 100) return 0;          // Gri
  if (vipScore < 500) return 1;          // Bronz
  if (vipScore < 2000) return 2;         // Gümüş
  if (vipScore < 10000) return 3;        // Altın
  return 4;                              // Metalik Mor (Premium)
}

// VIP seviyesine göre metalik renk seç
export function getVipColor(rank: number) {
  switch (rank) {
    case 1:
      return "#CD7F32"; // Bronz
    case 2:
      return "#C0C0C0"; // Gümüş
    case 3:
      return "#FFD700"; // Altın
    case 4:
      return "#B44CFF"; // Premium Metalik Mor
    default:
      return "#9CA3AF"; // Gri (VIP 0)
  }
}

// VIP seviyesine metin formatı
export function getVipLabel(rank: number) {
  return `VIP ${rank}`;
}
