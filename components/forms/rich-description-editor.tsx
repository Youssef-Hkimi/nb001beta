"use client";

import { Button, Label, TextArea, TextField } from "@heroui/react";
import {
  Bold as BoldIcon,
  Heading2,
  Italic,
  Link2,
  List as ListIcon,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRef, useState } from "react";

type RichDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export function RichDescriptionEditor({
  value,
  onChange,
  placeholder = "Describe the listing, its features, and what makes it special.",
  expanded,
  onExpandedChange,
}: RichDescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expanded ?? internalExpanded;

  function setExpanded(next: boolean) {
    if (onExpandedChange) onExpandedChange(next);
    else setInternalExpanded(next);
  }

  function replaceSelection(before: string, after: string, fallback: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || fallback;
    onChange(`${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function makeBulletList() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || "List item";
    const formatted = selected
      .split("\n")
      .map((line) => `- ${line.replace(/^-\s*/, "")}`)
      .join("\n");
    onChange(`${value.slice(0, start)}${formatted}${value.slice(end)}`);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  return (
    <div className={isExpanded ? "space-y-5" : "block"}>
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-segment p-2">
          <Button isIconOnly size="sm" variant="ghost" aria-label="Bold" onPress={() => replaceSelection("**", "**", "bold text")}><BoldIcon className="size-4" /></Button>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Italic" onPress={() => replaceSelection("*", "*", "italic text")}><Italic className="size-4" /></Button>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Heading" onPress={() => replaceSelection("## ", "", "Heading")}><Heading2 className="size-4" /></Button>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Bulleted list" onPress={makeBulletList}><ListIcon className="size-4" /></Button>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Link" onPress={() => replaceSelection("[", "](https://example.com)", "link text")}><Link2 className="size-4" /></Button>
          <span className="mx-1 h-5 w-px bg-border" />
          <Button isIconOnly size="sm" variant={isExpanded ? "primary" : "ghost"} aria-label={isExpanded ? "Collapse editor and hide preview" : "Expand editor and show preview"} onPress={() => setExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
          <span className="ml-auto pr-2 text-xs text-muted">{value.length} characters</span>
        </div>
        <TextField value={value} onChange={onChange} className="gap-0">
          <Label className="sr-only">Full description</Label>
          <TextArea ref={textareaRef} rows={isExpanded ? 16 : 6} className={`${isExpanded ? "min-h-80" : "min-h-36"} resize-y rounded-none border-0`} placeholder={placeholder} />
        </TextField>
      </div>
      {isExpanded ? (
        <div className="min-h-64 rounded-2xl border border-border bg-surface p-5">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted">Live formatted preview</p>
          <FormattedDescription value={value} />
        </div>
      ) : null}
    </div>
  );
}

export function FormattedDescription({ value }: { value: string }) {
  if (!value.trim()) return <p className="text-sm text-muted">Your formatted description will appear here.</p>;
  return (
    <div className="space-y-2 text-sm leading-relaxed text-foreground">
      {value.split("\n").map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;
        if (line.startsWith("## ")) return <h4 key={index} className="text-lg font-bold">{renderInline(line.slice(3))}</h4>;
        if (line.startsWith("- ")) return <div key={index} className="flex gap-2"><span className="text-accent">•</span><span>{renderInline(line.slice(2))}</span></div>;
        return <p key={index}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(value: string) {
  return value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = /^https?:\/\//i.test(link[2]) ? link[2] : "#";
      return <a key={index} href={href} target="_blank" rel="noreferrer" className="font-medium text-accent underline underline-offset-2">{link[1]}</a>;
    }
    return <span key={index}>{part}</span>;
  });
}
