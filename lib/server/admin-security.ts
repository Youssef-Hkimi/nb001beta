import "server-only";

import {createCipheriv, createDecipheriv, createHash, randomBytes} from "node:crypto";
import * as OTPAuth from "otpauth";
import type {NextRequest} from "next/server";

import type {DiscordSession} from "@/lib/auth/discord-session";
import {ApiError} from "@/lib/server/auth";
import {getServerEnv} from "@/lib/server/env";
import {createOpaqueToken, getRequestFingerprint, hashSensitiveValue} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

function encryptionKey() {
  return createHash("sha256")
    .update(getServerEnv().ADMIN_MFA_ENCRYPTION_KEY)
    .digest();
}

export function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((value) => value.toString("base64url")).join(".");
}

export function decryptMfaSecret(ciphertext: string) {
  const [ivValue, tagValue, encryptedValue] = ciphertext.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new ApiError(500, "invalid_mfa_secret");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function createTotp(username: string, base32: string) {
  return new OTPAuth.TOTP({
    issuer: "Nexbiy",
    label: username,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(base32),
  });
}

export async function issueAdminChallenge(
  session: DiscordSession,
  scope: string,
  request: Request,
) {
  const token = createOpaqueToken();
  const fingerprint = getRequestFingerprint(request);
  const {error} = await getSupabaseAdmin().from("admin_action_challenges").insert({
    user_id: session.userId,
    token_hash: hashSensitiveValue(token),
    action_scope: scope,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
  await auditAdminAction(session, "mfa_challenge_issued", "staff", session.userId, scope, {
    ip_hash: fingerprint.ipHash,
  });
  return token;
}

export async function requireAdminChallenge(
  request: NextRequest,
  session: DiscordSession,
  scope: string,
) {
  const token = request.headers.get("x-admin-mfa-challenge");
  if (!token) throw new ApiError(403, "fresh_mfa_required");
  const db = getSupabaseAdmin();
  const {data: challenge} = await db
    .from("admin_action_challenges")
    .select("id,action_scope")
    .eq("user_id", session.userId)
    .eq("token_hash", hashSensitiveValue(token))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!challenge || ![scope, "*"].includes(challenge.action_scope)) {
    throw new ApiError(403, "fresh_mfa_required");
  }
  await db
    .from("admin_action_challenges")
    .update({used_at: new Date().toISOString()})
    .eq("id", challenge.id);
}

export async function auditAdminAction(
  session: DiscordSession,
  action: string,
  targetType: string,
  targetId: string | null,
  reason: string | null,
  metadata: Record<string, unknown> = {},
) {
  const {error} = await getSupabaseAdmin().from("admin_audit_log").insert({
    actor_id: session.userId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason,
    metadata,
  });
  if (error) throw error;
}
