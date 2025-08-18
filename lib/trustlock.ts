// lib/trustlock.ts
import crypto from "crypto";

const SECRET = process.env.TRUSTLOCK_SECRET!;

if (!SECRET) {
  throw new Error("TRUSTLOCK_SECRET environment variable is required");
}

export function signTrust(orderId: string): string {
  return crypto.createHmac("sha256", SECRET).update(orderId).digest("hex");
}

export function verifyTrust(orderId: string, sig: string): boolean {
  return signTrust(orderId) === sig;
}

export function createTrustLock(orderId: string): { sig: string } {
  return { sig: signTrust(orderId) };
}
