const ROOT_UIDS = [
  "xdFSsoukc6Ste6qidoMskk4fsDM2",
];

// 🔓 UCU AÇIK KURAL SETİ
const ROLE_RULES = {
  root: (user, uid) => ROOT_UIDS.includes(uid),

  // 🔕 DEALER OTOMATİK KAPALI
  // SADECE MANUEL SET EDİLECEK
  dealer: (user) => user.isDealer === true,

  // ❌ svip ARTIK ROLE DEĞİL

  // 🔮 GELECEK
  // dailyTop1: (user) => false,
  // weeklyTop1: (user) => false,
  // monthlyTop1: (user) => false,
};

module.exports = {
  ROLE_RULES,
};
