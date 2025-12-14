import BronzeBadge from "./BronzeBadge";
import DiamondBadge from "./DiamondBadge";
import GoldBadge from "./GoldBadge";
import LegendBadge from "./LegendBadge";
import MasterBadge from "./MasterBadge";
import PlatinumBadge from "./PlatinumBadge";
import SilverBadge from "./SilverBadge";

export function getLevelBadge(level: number) {
  if (level >= 46) return LegendBadge;
  if (level >= 36) return MasterBadge;
  if (level >= 26) return DiamondBadge;
  if (level >= 16) return PlatinumBadge;
  if (level >= 11) return GoldBadge;
  if (level >= 6) return SilverBadge;
  if (level >= 1) return BronzeBadge;
  return null;
}
