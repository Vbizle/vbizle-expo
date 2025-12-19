const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { computeRoles, rolesEqual } = require("./roleEngine");

exports.syncUserRoles = onDocumentWritten(
  "users/{uid}",
  async (event) => {
    const after = event.data.after?.data();
    if (!after) return;

    const uid = event.params.uid;

    const prevRoles = after.roles || {};
    const newRoles = computeRoles(after, uid) || {};

    /**
     * 🔒 GÜNCEL KURAL
     *
     * - syncUserRoles SADECE sistem rollerini yönetir
     *   (root / admin / dealer vb.)
     * - SVP (svip) BU ENGINE'İN KONUSU DEĞİLDİR
     * - SVP transactions tabanlı svpEngine tarafından yönetilir
     *
     * ⚠️ Bu nedenle:
     * - newRoles.svip yazılmaz
     * - prevRoles.svip korunur
     */

    // 👉 SVP'yi olduğu gibi KORU
    if (prevRoles.svip === true) {
      newRoles.svip = true;
    }

    // undefined olmasını önle (opsiyonel ama güvenli)
    newRoles.svip = newRoles.svip === true;

    if (rolesEqual(newRoles, prevRoles)) return;

    await event.data.after.ref.update({ roles: newRoles });
  }
);
