const STORAGE_KEY = "nexus_widget_setup_reminders";
const LISTING_OVERRIDES_KEY = "nexus_listing_status_overrides";
const STALE_LISTINGS_RESET_KEY = "nexus_widget_setup_stale_listings_reset_v1";

export const WIDGET_SETUP_REMINDERS_CHANGED = "nexus:widget-setup-reminders-changed";

export type WidgetSetupReminder = {
  guildId: string;
  serverName: string;
  memberCount: number;
  createdAt: number;
};

export function readWidgetSetupReminders(): WidgetSetupReminder[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as unknown;
    if (!Array.isArray(stored)) return [];
    return stored.filter((item): item is WidgetSetupReminder =>
      typeof item === "object" &&
      item !== null &&
      "guildId" in item &&
      typeof item.guildId === "string" &&
      "serverName" in item &&
      typeof item.serverName === "string" &&
      "memberCount" in item &&
      typeof item.memberCount === "number" &&
      "createdAt" in item &&
      typeof item.createdAt === "number",
    );
  } catch {
    return [];
  }
}

function writeWidgetSetupReminders(reminders: WidgetSetupReminder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new Event(WIDGET_SETUP_REMINDERS_CHANGED));
}

export function addWidgetSetupReminder(reminder: WidgetSetupReminder) {
  const current = readWidgetSetupReminders().filter((item) => item.guildId !== reminder.guildId);
  writeWidgetSetupReminders([reminder, ...current].slice(0, 20));
}

export function removeWidgetSetupReminder(guildId: string) {
  writeWidgetSetupReminders(
    readWidgetSetupReminders().filter((item) => item.guildId !== guildId),
  );
}

export function resetStaleWidgetSetupListingsOnce() {
  if (typeof window === "undefined" || localStorage.getItem(STALE_LISTINGS_RESET_KEY)) return;

  const pendingGuildIds = new Set(readWidgetSetupReminders().map((item) => item.guildId));
  if (pendingGuildIds.size > 0) {
    try {
      const stored = JSON.parse(localStorage.getItem(LISTING_OVERRIDES_KEY) || "[]") as unknown;
      if (Array.isArray(stored)) {
        const activeOverrides = stored.filter((item) => {
          if (typeof item !== "object" || item === null) return true;
          const guildId = "guildId" in item ? item.guildId : undefined;
          return typeof guildId !== "string" || !pendingGuildIds.has(guildId);
        });
        localStorage.setItem(LISTING_OVERRIDES_KEY, JSON.stringify(activeOverrides));
      }
    } catch {
      // Keep unrelated listing data if the saved demo state is malformed.
    }
  }

  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STALE_LISTINGS_RESET_KEY, "1");
  window.dispatchEvent(new Event(WIDGET_SETUP_REMINDERS_CHANGED));
}
