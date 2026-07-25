import "server-only";

import {createHmac, randomBytes, timingSafeEqual} from "node:crypto";

import {getServerEnv} from "@/lib/server/env";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export function createOpaqueToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashSensitiveValue(value: string) {
  return createHmac("sha256", getServerEnv().SESSION_HASH_SECRET)
    .update(value)
    .digest("hex");
}

export function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function getRequestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return {
    ipHash: hashSensitiveValue(`ip:${ip}`),
    userAgentHash: hashSensitiveValue(`ua:${userAgent}`),
  };
}

export function assertSameOrigin(request: Request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method.toUpperCase())) return;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new Error("cross_site_request_blocked");

  const origin = request.headers.get("origin");
  if (!origin) return;
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const expectedOrigin = forwardedHost
    ? `${forwardedProto || requestUrl.protocol.replace(":", "")}://${forwardedHost}`
    : requestUrl.origin;
  if (origin !== expectedOrigin) throw new Error("origin_mismatch");
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
  identity?: string,
) {
  const fingerprint = getRequestFingerprint(request);
  const rateKey = `${scope}:${identity || fingerprint.ipHash}`;
  const {data, error} = await getSupabaseAdmin().rpc("consume_api_rate_limit", {
    p_key: rateKey,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw error;
  if (!data) throw new Error("rate_limit_exceeded");
}
