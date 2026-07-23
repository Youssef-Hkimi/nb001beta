"use client";

import {
  Button,
  Chip,
  Dropdown,
  Modal,
  Table,
  toast,
} from "@heroui/react";
import {
  ExternalLink,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DASHBOARD_LISTINGS } from "@/lib/data/dashboard";
import { formatCount } from "@/lib/format";
import { mergeListingStatuses } from "@/lib/listing-status";
import { ListingStatusChip } from "@/components/listing/listing-safety";
import type { DashboardListing, ListingStatus } from "@/lib/types";

const statusColor: Record<
  ListingStatus,
  "success" | "warning" | "accent" | "default" | "danger"
> = {
  Live: "success",
  Draft: "default",
  Paused: "default",
  "Under Review": "warning",
  "Live · Pending Review": "warning",
  Suspended: "danger",
  Rejected: "danger",
};

export function ListingsTable() {
  const [rows, setRows] = useState(DASHBOARD_LISTINGS);
  const [preview, setPreview] = useState<DashboardListing | null>(null);
  const [toDelete, setToDelete] = useState<DashboardListing | null>(null);

  useEffect(() => {
    setRows(mergeListingStatuses(DASHBOARD_LISTINGS));
  }, []);

  const servers = useMemo(() => rows.filter((r) => r.type === "server"), [rows]);
  const bots = useMemo(() => rows.filter((r) => r.type === "bot"), [rows]);

  return (
    <>
      <div id="servers" className="scroll-mt-28 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">My Listings</h2>
            <p className="text-sm text-muted">
              {servers.length} servers · {bots.length} bots
            </p>
          </div>
        </div>

        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="My listings" className="min-w-[900px]">
              <Table.Header>
                <Table.Column isRowHeader>Listing</Table.Column>
                <Table.Column>Type</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Views</Table.Column>
                <Table.Column>Interactions</Table.Column>
                <Table.Column>Updated</Table.Column>
                <Table.Column className="text-end">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.id} id={row.id}>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-medium">{row.name}</span>
                        <span className="text-xs text-muted">{row.category}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={row.type === "bot" ? "accent" : "default"}
                      >
                        <Chip.Label>{row.type === "bot" ? "Bot" : "Server"}</Chip.Label>
                      </Chip>
                    </Table.Cell>
                    <Table.Cell><ListingStatusChip status={row.safetyStatus} livePrefix /></Table.Cell>
                    <Table.Cell>{formatCount(row.views)}</Table.Cell>
                    <Table.Cell>{formatCount(row.clicks)}</Table.Cell>
                    <Table.Cell className="text-muted">{row.updated}</Table.Cell>
                    <Table.Cell>
                      <div className="flex min-w-[7.5rem] shrink-0 items-center justify-end gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Edit"
                          onPress={() => toast.success("Opened editor", { description: row.name })}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Preview"
                          onPress={() => setPreview(row)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Dropdown>
                          <Dropdown.Trigger
                            aria-label="More actions"
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-default focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <MoreHorizontal className="size-4 shrink-0" />
                          </Dropdown.Trigger>
                          <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu
                              onAction={(key) => {
                                if (key === "delete") setToDelete(row);
                                if (key === "public") {
                                  window.location.assign(`/${row.type === "bot" ? "bots" : "server"}/${row.id}`);
                                }
                                if (key === "edit") {
                                  toast.success("Edit mode ready");
                                }
                                if (key === "toggle") {
                                  const status = row.status === "Paused" ? "Live" : "Paused";
                                  setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item));
                                  toast.success(status === "Live" ? "Listing resumed" : "Listing paused");
                                }
                              }}
                            >
                              <Dropdown.Item id="edit" textValue="Edit">
                                <Pencil className="size-4" />
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Item id="public" textValue="Open public page">
                                <ExternalLink className="size-4" />
                                Open public page
                              </Dropdown.Item>
                              <Dropdown.Item
                                id="toggle"
                                textValue={row.status === "Paused" ? "Resume" : "Pause"}
                              >
                                <Eye className="size-4" />
                                {row.status === "Paused" ? "Resume" : "Pause"}
                              </Dropdown.Item>
                              <Dropdown.Item id="delete" textValue="Delete" variant="danger">
                                <Trash2 className="size-4" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      <Modal.Backdrop isOpen={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Preview · {preview?.name}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-3">
              <p className="text-sm text-muted">{preview?.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-default p-3">
                  <p className="text-xs text-muted">Type</p>
                  <p className="font-medium capitalize">{preview?.type}</p>
                </div>
                <div className="rounded-xl bg-default p-3">
                  <p className="text-xs text-muted">Status</p>
                  {preview ? <ListingStatusChip status={preview.safetyStatus} livePrefix /> : null}
                </div>
                <div className="rounded-xl bg-default p-3">
                  <p className="text-xs text-muted">Views</p>
                  <p className="font-medium">{formatCount(preview?.views ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-default p-3">
                  <p className="text-xs text-muted">Clicks</p>
                  <p className="font-medium">{formatCount(preview?.clicks ?? 0)}</p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Close
              </Button>
              <Button
                onPress={() => {
                  toast.success("Saved listing changes");
                  setPreview(null);
                }}
              >
                Save
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop isOpen={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Delete listing?</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-muted">
                This will remove <span className="font-medium text-foreground">{toDelete?.name}</span>{" "}
                from your dashboard. This demo action is reversible by refreshing.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={() => {
                  if (toDelete) {
                    setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
                    toast.danger("Listing deleted", { description: toDelete.name });
                  }
                  setToDelete(null);
                }}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
