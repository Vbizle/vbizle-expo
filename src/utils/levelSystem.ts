// src/utils/levelSystem.ts

// Level hesaplamada kullanacağımız tip
export type LevelInfo = {
  level: number;
  name: string;
};

// LEVEL hesaplama (hiç değişmedi)
export function getLevelInfo(vbTotalSent: number | undefined | null): LevelInfo {
  const score = vbTotalSent ?? 0;

  if (score < 50) return { level: 1, name: "Bronz" };
  if (score < 200) return { level: 2, name: "Gümüş" };
  if (score < 500) return { level: 3, name: "Altın" };
  if (score < 1000) return { level: 4, name: "Platin" };
  if (score < 2500) return { level: 5, name: "Elmas" };

  return { level: 6, name: "Efsane" };
}

// ⭐ LEVEL METALİK RENKLER
export function getLevelColor(level: number): string {
  switch (level) {
    case 1:
      return "#8e8e8e"; // mat gri
    case 2:
      return "#c0c0c0"; // gümüş metalik
    case 3:
      return "#f4c542"; // altın
    case 4:
      return "#b4d0f9"; // platin
    case 5:
      return "#7df1ff"; // elmas (ışıklı)
    case 6:
      return "#9b4dff"; // premium mor-turuncu uyumlu
    default:
      return "#8e8e8e";
  }
}
