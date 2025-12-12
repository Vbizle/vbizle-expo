import { ADMIN_VBIDS } from "./adminList";

export function isAdmin(vbId?: string) {
  if (!vbId) return false;
  return ADMIN_VBIDS.includes(vbId);
}
