// lib/trustlock.ts
import crypto from "crypto";

const SECRET = process.env.TRUSTLOCK_SECRET || "dev-secret";

export function signTrust(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function verifyTrust(payload: string, signature: string) {
  const expected = signTrust(payload);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
