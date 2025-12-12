// core/request.js
const admin = require("firebase-admin");

/* ============================================================
   BODY PARSE (LOG EKLENDİ)
============================================================ */
function parseBody(req) {
  console.log("PARSE_BODY_START");

  let body = req.body;

  // Eğer body bir object değilse JSON parse etmeyi dene
  if (!body || typeof body !== "object") {
    try {
      console.log("PARSE_BODY_RAW", req.rawBody?.toString());
      body = JSON.parse(req.rawBody.toString());
      console.log("PARSE_BODY_JSON_SUCCESS", body);
    } catch (e) {
      console.error("PARSE_BODY_JSON_ERROR", e);
      return null;
    }
  } else {
    console.log("PARSE_BODY_OBJECT", body);
  }

  return body;
}

/* ============================================================
   AUTH – Bearer Token doğrulama (LOG EKLENDİ)
============================================================ */
async function requireAuth(req, res) {
  console.log("AUTH_START");

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.error("AUTH_MISSING_HEADER");
      res.status(401).json({ error: "unauthenticated" });
      throw new Error("STOP");
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.error("AUTH_INVALID_HEADER", authHeader);
      res.status(401).json({ error: "unauthenticated" });
      throw new Error("STOP");
    }

    const token = authHeader.split("Bearer ")[1].trim();
    console.log("AUTH_TOKEN_RECEIVED", token.substring(0, 8) + "...");

    const decoded = await admin.auth().verifyIdToken(token);

    console.log("AUTH_SUCCESS", decoded.uid);
    return decoded.uid;

  } catch (err) {
    console.error("AUTH_ERROR", err);

    if (err.message !== "STOP") {
      res.status(401).json({ error: "unauthenticated" });
    }

    throw new Error("STOP");
  }
}

module.exports = {
  parseBody,
  requireAuth,
};
