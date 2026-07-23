"use client";

import { Button, Checkbox, Modal } from "@heroui/react";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
};

export function BotReviewModal({ isOpen, onOpenChange, onAgree }: Props) {
  const [seconds, setSeconds] = useState(5);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSeconds(5);
    setAgreed(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [isOpen, seconds]);

  const ready = seconds <= 0 && agreed;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Bot listing review</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <ShieldAlert className="size-5" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Your Discord bot will be reviewed by Nexbiy to make sure it meets our criteria and
              follows Discord’s Terms of Service. If the bot violates our rules, the listing may be
              taken down and your account may be flagged. Your bot can still appear live while it is
              pending review.
            </p>

            <Checkbox isSelected={agreed} onChange={setAgreed}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <span className="text-sm text-foreground">
                  I understand and agree to the bot listing rules.
                </span>
              </Checkbox.Content>
            </Checkbox>

            {seconds > 0 ? (
              <p className="text-sm font-medium text-muted">
                You can continue in {seconds}s
              </p>
            ) : (
              <p className="text-sm font-medium text-accent">You can continue now</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
            <Button
              isDisabled={!ready}
              onPress={() => {
                onAgree();
                onOpenChange(false);
              }}
            >
              Agree and publish
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
