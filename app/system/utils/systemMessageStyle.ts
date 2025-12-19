export function getSystemMessageStyle(item: any) {
  // VB YÜKLEME
  if (item.type === "vb_load" || item.title?.includes("VB")) {
    return {
      bg: "#0f172a",
      border: "#facc15",
      title: "#fde047",
      body: "#e5e7eb",
      badge: "VB",
    };
  }

  // SVP
  if (item.type === "svp") {
    return {
      bg: "#2e1065",
      border: "#c084fc",
      title: "#e9d5ff",
      body: "#f5f3ff",
      badge: "SVP",
    };
  }

  // ADMIN
  if (item.type === "admin") {
    return {
      bg: "#450a0a",
      border: "#ef4444",
      title: "#fecaca",
      body: "#fee2e2",
      badge: "ADMIN",
    };
  }

  // ROOT / RESMİ
  if (item.type === "root") {
    return {
      bg: "#020617",
      border: "#e5e7eb",
      title: "#f8fafc",
      body: "#cbd5f5",
      badge: "RESMİ",
    };
  }

  // GENEL SİSTEM
  return {
    bg: "#1e293b",
    border: "#60a5fa",
    title: "#bfdbfe",
    body: "#e5e7eb",
    badge: "SİSTEM",
  };
}
