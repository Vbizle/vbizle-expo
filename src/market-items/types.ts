export type MarketItemType = "frame" | "svga";

export type MarketItem = {
  id: string;
  type: MarketItemType;

  title: string;
  description?: string;

  priceVb: number;
  durationDays: number;
  stackable: boolean;
  priority?: number;

  imageUrl?: string;     // frame
  svgaUrl?: string;      // enter effect
  previewUrl?: string;

  active: boolean;
};
