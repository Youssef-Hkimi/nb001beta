"use client";

import {
  Button,
  Label,
  ListBox,
  Modal,
  Select,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { Flag } from "lucide-react";
import { useState } from "react";

const REPORT_CATEGORIES = [
  "Scam or fraud",
  "Dangerous permissions",
  "Harassment or harmful content",
  "Incorrect information",
  "Broken invite",
  "Other",
];

export function ReportListingDialog({
  listingName,
  isOpen,
  onOpenChange,
}: {
  listingName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");

  function submit() {
    if (!category) return toast.danger("Choose a report category");
    if (category === "Other" && context.trim().length < 8) {
      return toast.danger("Add a little more context");
    }
    toast.success("Report submitted", {
      description: "Nexbiy moderators will review this listing.",
    });
    setCategory("");
    setContext("");
    onOpenChange(false);
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header><Modal.Heading>Report {listingName}</Modal.Heading></Modal.Header>
          <Modal.Body className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
              <Flag className="mt-0.5 size-4 shrink-0 text-danger" />
              <p className="text-sm leading-6 text-muted">
                Choose the closest category and add details that help moderators investigate.
              </p>
            </div>
            <Select selectedKey={category} onSelectionChange={(key) => setCategory(String(key))}>
              <Label>Report category</Label>
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>{REPORT_CATEGORIES.map((item) => <ListBox.Item key={item} id={item}>{item}</ListBox.Item>)}</ListBox>
              </Select.Popover>
            </Select>
            <TextField value={context} onChange={setContext}>
              <Label>{category === "Other" ? "What happened?" : "Additional context (optional)"}</Label>
              <TextArea rows={4} placeholder="Share relevant details without including private information." />
            </TextField>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="danger" onPress={submit}>Submit report</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
