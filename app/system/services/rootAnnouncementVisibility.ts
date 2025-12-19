import { isRootUser } from "./rootPermission";

/**
 * Root duyuru özelliği görünür mü?
 * Şimdilik sadece Root kontrolü yapar
 * (ileride feature flag, tarih, config eklenebilir)
 */
export function canShowRootAnnouncement() {
  return isRootUser();
}
