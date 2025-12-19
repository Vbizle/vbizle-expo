const ROOT_UIDS = [
  "xdFSsoukc6Ste6qidoMskk4fsDM2",
];

// 🔓 UCU AÇIK KURAL SETİ
const ROLE_RULES = {
  root: (user, uid) => ROOT_UIDS.includes(uid),

  dealer: (user) => (user.dealerWallet ?? 0) > 0,

  // ❌ svip ARTIK ROLE DEĞİL

  // 🔮 GELECEK
  // dailyTop1: (user) => false,
  // weeklyTop1: (user) => false,
  // monthlyTop1: (user) => false,
};

module.exports = {
  ROLE_RULES,
};
