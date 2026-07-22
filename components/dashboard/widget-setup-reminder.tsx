"use client";

import {Alert, Button, Label, ListBox, Modal, Select, Spinner, toast} from "@heroui/react";
import {RefreshCw, X} from "lucide-react";
import {useCallback, useEffect, useLayoutEffect, useState} from "react";

import {WidgetSetupGuide} from "@/components/listing/widget-setup-guide";
import {
  readWidgetSetupReminders,
  removeWidgetSetupReminder,
  resetStaleWidgetSetupListingsOnce,
  WIDGET_SETUP_REMINDERS_CHANGED,
  type WidgetSetupReminder,
} from "@/lib/widget-setup-reminders";
import {readStatusOverrides, writeStatusOverride} from "@/lib/listing-status";

export function WidgetSetupReminderAlert() {
  const [reminders, setReminders] = useState<WidgetSetupReminder[]>([]);
  const [verifyingGuildId, setVerifyingGuildId] = useState<string | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const syncReminders = useCallback(() => {
    setReminders(readWidgetSetupReminders());
  }, []);

  useLayoutEffect(() => {
    resetStaleWidgetSetupListingsOnce();
  }, []);

  useEffect(() => {
    syncReminders();
    window.addEventListener("storage", syncReminders);
    window.addEventListener(WIDGET_SETUP_REMINDERS_CHANGED, syncReminders);
    return () => {
      window.removeEventListener("storage", syncReminders);
      window.removeEventListener(WIDGET_SETUP_REMINDERS_CHANGED, syncReminders);
    };
  }, [syncReminders]);

  const reminder = reminders[0];
  if (!reminder) return null;
  const selectedReminder = reminders.find((item) => item.guildId === selectedGuildId) || reminder;

  function openVerificationGuide() {
    setSelectedGuildId(reminder.guildId);
    setVerificationError("");
    setVerifyModalOpen(true);
  }

  async function verifyWidget() {
    const guildId = selectedReminder.guildId;

    setVerifyingGuildId(guildId);
    setVerificationError("");
    try {
      const response = await fetch("/api/discord/server-widget", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({guildId, forceRefresh: true}),
      });
      const result = await response.json() as {
        error?: string;
        guild?: {presenceCount?: number};
      };
      if (!response.ok) {
        setVerificationError(
          result.error === "widget_no_channel"
            ? "The widget is enabled, but it still needs a public invite channel. Choose one in Discord and try again."
            : result.error === "guild_not_found"
              ? "Discord could not find that server. Check the Server ID and try again."
              : "The widget is still unavailable. Complete the setup shown above, then try again.",
        );
        return;
      }
      const listing = readStatusOverrides().find(
        (item) => item.guildId === selectedReminder.guildId,
      );
      if (listing) {
        writeStatusOverride({
          ...listing,
          guildId,
          online: typeof result.guild?.presenceCount === "number"
            ? result.guild.presenceCount
            : listing.online,
          widgetSetupPending: false,
        });
      }
      removeWidgetSetupReminder(selectedReminder.guildId);
      setVerifyModalOpen(false);
      toast.success("Discord widget verified", {
        description: `${selectedReminder.serverName} can now show its live online member count.`,
      });
    } catch {
      setVerificationError("Nexus could not reach Discord. Please try again.");
    } finally {
      setVerifyingGuildId(null);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1680px] px-4 pt-2 md:px-6 lg:px-7">
        <Alert status="warning" className="widget-setup-reminder-alert">
          <Alert.Indicator />
          <Alert.Content className="min-w-0">
            <Alert.Title>
              Verify Discord activity for {reminder.serverName}
              {reminders.length > 1 ? ` · ${reminders.length} listings pending` : ""}
            </Alert.Title>
          </Alert.Content>
          <Button size="sm" variant="secondary" onPress={openVerificationGuide}>
            <RefreshCw className="size-4" />
            Verify now
          </Button>
        </Alert>
      </div>

      <Modal.Backdrop isOpen={verifyModalOpen} isDismissable={false}>
        <Modal.Container size="lg">
          <Modal.Dialog className="widget-verification-dialog relative sm:max-w-xl">
            <Button
              isIconOnly
              aria-label="Close verification guide"
              className="absolute right-4 top-4 z-10"
              size="sm"
              variant="tertiary"
              onPress={() => setVerifyModalOpen(false)}
            >
              <X className="size-4" />
            </Button>
            <Modal.Header>
              <Modal.Heading>Discord server verification</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <WidgetSetupGuide />

              <Select
                selectedKey={selectedReminder.guildId}
                onSelectionChange={(key) => {
                  setSelectedGuildId(String(key));
                  setVerificationError("");
                }}
              >
                <Label>Server to verify</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {reminders.map((item) => (
                      <ListBox.Item key={item.guildId} id={item.guildId} textValue={item.serverName}>
                        <span className="flex flex-col">
                          <span className="font-medium">{item.serverName}</span>
                          <span className="text-xs text-muted">Widget setup pending</span>
                        </span>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              {verificationError ? (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Widget verification failed</Alert.Title>
                    <Alert.Description>{verificationError}</Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Button
                isDisabled={Boolean(verifyingGuildId)}
                onPress={() => void verifyWidget()}
              >
                {verifyingGuildId ? <Spinner size="sm" /> : <RefreshCw className="size-4" />}
                {verifyingGuildId ? "Verifying…" : "Verify widget"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
