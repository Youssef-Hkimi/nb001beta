import {randomUUID} from "node:crypto";
import {mkdir, readFile, rm, writeFile} from "node:fs/promises";
import path from "node:path";

import type {AuthUser, DiscordServer} from "@/lib/types";

export const DISCORD_SESSION_COOKIE = "nexus_discord_test_session_v2";
export const DISCORD_SESSION_MAX_AGE = 60 * 60 * 12;

type DiscordSession = {
  user: AuthUser;
  guilds: DiscordServer[];
  expiresAt: number;
};

const sessionDirectory = path.join(process.cwd(), ".next", "nexus-oauth-sessions");

function sessionPath(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return path.join(sessionDirectory, `${id}.json`);
}

export async function createDiscordSession(user: AuthUser, guilds: DiscordServer[]) {
  const id = randomUUID();
  await mkdir(sessionDirectory, {recursive: true});
  await writeFile(
    path.join(sessionDirectory, `${id}.json`),
    JSON.stringify({
      user,
      guilds,
      expiresAt: Date.now() + DISCORD_SESSION_MAX_AGE * 1000,
    } satisfies DiscordSession),
    {encoding: "utf8", mode: 0o600},
  );
  return id;
}

export async function getDiscordSession(id: string | undefined) {
  if (!id) return null;
  const file = sessionPath(id);
  if (!file) return null;
  try {
    const session = JSON.parse(await readFile(file, "utf8")) as DiscordSession;
    if (session.expiresAt <= Date.now()) {
      await rm(file, {force: true});
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function deleteDiscordSession(id: string | undefined) {
  if (!id) return;
  const file = sessionPath(id);
  if (file) await rm(file, {force: true});
}
