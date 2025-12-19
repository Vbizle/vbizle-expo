const { ROLE_RULES } = require("./roleRules");

function computeRoles(user, uid) {
  const roles = {};

  for (const [role, ruleFn] of Object.entries(ROLE_RULES)) {
    roles[role] = Boolean(ruleFn(user, uid));
  }

  return roles;
}

function rolesEqual(a = {}, b = {}) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

module.exports = {
  computeRoles,
  rolesEqual,
};
