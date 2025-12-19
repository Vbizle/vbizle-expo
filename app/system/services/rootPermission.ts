import { auth } from "@/firebase/firebaseConfig";

/**
 * Root kullanıcı kontrolü
 * Şimdilik sabit UID / VB-ID mantığı
 * (ileride badge/role ile genişletilebilir)
 */
export function isRootUser() {
  const user = auth.currentUser;
  if (!user) return false;

  // 🔒 Platform Root UID (mevcut sistemine göre)
  const PLATFORM_ROOT_UID = "9G9jqVmQSdZXVD6B6ah8w8nJwDw2";

  return user.uid === PLATFORM_ROOT_UID;
}
