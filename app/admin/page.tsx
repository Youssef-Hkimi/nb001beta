import {cookies} from "next/headers";
import {redirect} from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {DISCORD_SESSION_COOKIE, getDiscordSession} from "@/lib/auth/discord-session";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await getDiscordSession(cookieStore.get(DISCORD_SESSION_COOKIE)?.value);
  if (!session) redirect("/login?next=/admin");
  if (!["moderator", "admin", "super_admin"].includes(session.role)) redirect("/dashboard");
  return <AdminDashboard />;
}
