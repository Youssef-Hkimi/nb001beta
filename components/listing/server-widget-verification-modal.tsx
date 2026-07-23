"use client";

import { Alert, AlertDialog, Button, Input, Label, Modal, Spinner, TextField, toast } from "@heroui/react";
import { CheckCircle2, Copy, ExternalLink, LayoutDashboard, X } from "lucide-react";
import { useState } from "react";

import { ListingStatusChip } from "@/components/listing/listing-safety";
import { WidgetSetupGuide } from "@/components/listing/widget-setup-guide";
import { LinkButton } from "@/components/ui/link-button";

export type ServerWidgetVerificationState =
  | "verifying"
  | "widget_disabled"
  | "error"
  | "success"
  | "success_unverified"
  | null;

type Props = {
  state: ServerWidgetVerificationState;
  errorMessage?: string;
  publicPath: string;
  onRetry: () => void;
  onSkip: () => void;
  onClose: () => void;
};

export function ServerWidgetVerificationModal({
  state,
  errorMessage,
  publicPath,
  onRetry,
  onSkip,
  onClose,
}: Props) {
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);
  const publicUrl = `http://localhost:3010${publicPath}`;
  const isPublished = state === "success" || state === "success_unverified";

  return (
    <>
      <Modal.Backdrop
        isOpen={Boolean(state)}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
      <Modal.Container size="lg">
        <Modal.Dialog className="widget-verification-dialog relative sm:max-w-xl">
          {state !== "verifying" ? (
            <Button
              isIconOnly
              aria-label="Close"
              className="absolute right-4 top-4 z-10"
              size="sm"
              variant="tertiary"
              onPress={onClose}
            >
              <X className="size-4" />
            </Button>
          ) : null}
          <Modal.Header className="pr-16">
            <Modal.Heading className="flex items-center gap-3">
              {isPublished ? (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                  <CheckCircle2 className="size-5" />
                </span>
              ) : null}
              <span>
                {state === "verifying"
                  ? "Verifying your Discord server"
                  : isPublished
                    ? "Your server is live"
                    : "Discord server verification"}
              </span>
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
              <WidgetSetupGuide />
            ) : null}

            {state === "error" ? (
              <Alert status="danger" className="widget-verification-alert">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Could not verify this server</Alert.Title>
                  <Alert.Description>
                    {errorMessage || "Discord could not verify this server right now. Please try again."}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}

            {isPublished ? (
              <div className="space-y-4">
                <Alert status={state === "success" ? "success" : "warning"} className="widget-verification-alert">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>
                      {state === "success"
                        ? "Server verified and published"
                        : "Server published — widget setup pending"}
                    </Alert.Title>
                    <Alert.Description>
                      {state === "success"
                        ? "Your server is publicly listed on Nexbiy and is waiting for review."
                        : "Your listing is live. Active members will temporarily match total members until you verify the Discord widget."}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted">Listing status</p>
                  <ListingStatusChip status="PENDING_REVIEW" livePrefix />
                </div>
                <div className="rounded-xl border border-border bg-default/25 p-3">
                  <TextField isReadOnly value={publicUrl}>
                    <Label>Public link</Label>
                    <Input />
                  </TextField>
                </div>
              </div>
            ) : null}
          </Modal.Body>
          {isPublished ? (
            <Modal.Footer className="flex-wrap border-t border-border/70 pt-4">
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
              <LinkButton href={publicPath} variant="secondary">
                <ExternalLink className="size-4" />
                View page
              </LinkButton>
              <LinkButton href="/dashboard">
                <LayoutDashboard className="size-4" />
                Back to dashboard
              </LinkButton>
            </Modal.Footer>
          ) : state !== "verifying" ? (
            <Modal.Footer className="flex-wrap">
              <Button variant="secondary" onPress={onClose}>Close</Button>
              {state === "widget_disabled" ? (
                <Button variant="tertiary" onPress={() => setSkipConfirmOpen(true)}>
                  Skip for now
                </Button>
              ) : null}
              <Button onPress={onRetry}>Try Again</Button>
            </Modal.Footer>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog isOpen={skipConfirmOpen} onOpenChange={setSkipConfirmOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[430px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="warning" />
                <AlertDialog.Heading>Are you sure you want to skip?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  Widget setup is important for accurate real-time activity. Your server can still
                  be listed, but active members will temporarily show the same number as total
                  members until verification is finished.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="secondary">Continue setup</Button>
                <Button
                  slot="close"
                  variant="primary"
                  onPress={() => {
                    setSkipConfirmOpen(false);
                    onSkip();
                  }}
                >
                  Skip and publish
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}
