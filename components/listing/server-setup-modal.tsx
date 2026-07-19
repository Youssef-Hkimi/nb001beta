"use client";

import { Avatar, Button, Chip, Modal } from "@heroui/react";
import { Download, PenLine } from "lucide-react";

import { formatCount, initials } from "@/lib/format";
import type { DiscordServer } from "@/lib/types";

export type ServerSetupMode = "import" | "manual";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ServerSetupMode | null;
  onModeChange: (mode: ServerSetupMode) => void;
  selectedServerId: string | null;
  servers: DiscordServer[];
  onSelectServer: (server: DiscordServer) => void;
  onContinue: () => void;
  onCancel?: () => void;
};

export function ServerSetupModal({
  isOpen,
  onOpenChange,
  mode,
  onModeChange,
  selectedServerId,
  servers,
  onSelectServer,
  onContinue,
  onCancel,
}: Props) {
  const canContinue =
    mode === "manual" || (mode === "import" && Boolean(selectedServerId));

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="lg">
        <Modal.Dialog className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Add your Discord server</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onModeChange("import")}
                className={`rounded-2xl border p-4 text-left transition-colors duration-200 ${
                  mode === "import"
                    ? "border-accent bg-accent/10"
                    : "border-border bg-default/40 hover:border-accent/40"
                }`}
              >
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Download className="size-5" aria-hidden />
                </span>
                <p className="font-semibold text-foreground">Import from Discord</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Select one of the servers you own or manage. Nexus will prefill basic details to
                  save time.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onModeChange("manual")}
                className={`rounded-2xl border p-4 text-left transition-colors duration-200 ${
                  mode === "manual"
                    ? "border-accent bg-accent/10"
                    : "border-border bg-default/40 hover:border-accent/40"
                }`}
              >
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <PenLine className="size-5" aria-hidden />
                </span>
                <p className="font-semibold text-foreground">Manual setup</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Add your server manually using an invite link and custom listing details.
                </p>
              </button>
            </div>

            {mode === "import" ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Your Discord servers</p>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {servers.length ? servers.map((server) => {
                    const selected = selectedServerId === server.id;
                    return (
                      <button
                        key={server.id}
                        type="button"
                        onClick={() => onSelectServer(server)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 ${
                          selected
                            ? "border-accent bg-accent/10"
                            : "border-border hover:bg-default/60"
                        }`}
                      >
                        <Avatar className="size-10 shrink-0">
                          {server.iconUrl ? <Avatar.Image alt="" src={server.iconUrl} /> : null}
                          <Avatar.Fallback className="bg-accent/20 text-xs font-bold text-accent">
                            {initials(server.name)}
                          </Avatar.Fallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {server.name}
                          </p>
                          <p className="text-xs text-muted">
                            {formatCount(server.members)} members
                          </p>
                        </div>
                        <Chip size="sm" variant="soft" color={server.role === "Owner" ? "accent" : "default"}>
                          <Chip.Label>{server.role}</Chip.Label>
                        </Chip>
                      </button>
                    );
                  }) : (
                    <div className="rounded-xl border border-border bg-default/30 p-4 text-center">
                      <p className="text-sm font-medium text-foreground">No manageable servers found</p>
                      <p className="mt-1 text-xs leading-5 text-muted">Discord only returns servers where you are the owner or have Manage Server permission.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onPress={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button isDisabled={!canContinue} onPress={onContinue}>
              Continue
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
