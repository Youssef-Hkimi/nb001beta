"use client";

import { Alert, Button, Input, Label, Modal, Spinner, TextField, toast } from "@heroui/react";
import { Copy, PanelTop, Settings, ToggleRight, TriangleAlert } from "lucide-react";

import { ListingStatusChip } from "@/components/listing/listing-safety";
import { LinkButton } from "@/components/ui/link-button";

export type ServerWidgetVerificationState =
  | "verifying"
  | "widget_disabled"
  | "error"
  | "success"
  | null;

type Props = {
  state: ServerWidgetVerificationState;
  errorMessage?: string;
  publicPath: string;
  onRetry: () => void;
  onClose: () => void;
};

const WIDGET_STEPS = [
  { icon: Settings, text: "Open Discord and go to Server Settings." },
  { icon: PanelTop, text: "Click the 'Widget' tab." },
  { icon: ToggleRight, text: "Turn on the 'Enable Server Widget' toggle switch." },
];

export function ServerWidgetVerificationModal({
  state,
  errorMessage,
  publicPath,
  onRetry,
  onClose,
}: Props) {
  const publicUrl = `http://localhost:3010${publicPath}`;

  return (
    <Modal.Backdrop
      isOpen={Boolean(state)}
      isDismissable={false}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Container size="lg">
        <Modal.Dialog className="sm:max-w-xl">
          {state !== "verifying" ? <Modal.CloseTrigger /> : null}
          <Modal.Header>
            <Modal.Heading>
              {state === "verifying"
                ? "Verifying your Discord server"
                : state === "success"
                  ? "Your server is live"
                  : "Discord server verification"}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {state === "verifying" ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Spinner size="lg" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Checking Discord&apos;s public widget</p>
                  <p className="mt-1 text-sm text-muted">Confirming the server name and live online count.</p>
                </div>
              </div>
            ) : null}

            {state === "widget_disabled" ? (
              <Alert status="warning" className="rounded-2xl">
                <Alert.Indicator><TriangleAlert className="size-4" /></Alert.Indicator>
                <Alert.Content className="w-full">
                  <Alert.Title>Enable your Discord server widget</Alert.Title>
                  <Alert.Description>
                    Discord confirmed that this server&apos;s public widget is disabled. Enable it, then try publishing again.
                  </Alert.Description>
                  <div className="mt-4 space-y-2">
                    {WIDGET_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.text} className="flex items-center gap-3 rounded-xl border border-warning/20 bg-background/55 px-3 py-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
                            <Icon className="size-4" />
                          </span>
                          <p className="text-sm text-foreground">
                            <span className="mr-1.5 font-semibold">{index + 1}.</span>{step.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Alert.Content>
              </Alert>
            ) : null}

            {state === "error" ? (
              <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Could not verify this server</Alert.Title>
                  <Alert.Description>
                    {errorMessage || "Discord could not verify this server right now. Please try again."}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}

            {state === "success" ? (
              <div className="space-y-4">
                <Alert status="success" className="rounded-2xl">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Server verified and published</Alert.Title>
                    <Alert.Description>
                      Your server is publicly listed on Nexus and is waiting for review.
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
                <ListingStatusChip status="PENDING_REVIEW" livePrefix />
                <TextField isReadOnly value={publicUrl}>
                  <Label>Public link</Label>
                  <Input />
                </TextField>
              </div>
            ) : null}
          </Modal.Body>
          {state === "success" ? (
            <Modal.Footer className="flex-wrap">
              <Button
                variant="secondary"
                onPress={() => {
                  void navigator.clipboard?.writeText(publicUrl);
                  toast.success("Public link copied");
                }}
              >
                <Copy className="size-4" />
                Copy link
              </Button>
              <LinkButton href={publicPath} variant="secondary">View page</LinkButton>
              <LinkButton href="/dashboard">Back to dashboard</LinkButton>
            </Modal.Footer>
          ) : state !== "verifying" ? (
            <Modal.Footer>
              <Button variant="secondary" onPress={onClose}>Close</Button>
              <Button onPress={onRetry}>Try Again</Button>
            </Modal.Footer>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
