"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { speakTagalog } from "@/lib/speak";
import { cn } from "@/lib/utils";
import type { MasteryLevel, Word } from "@/lib/types";

const MASTERY_ORDER: Record<MasteryLevel, number> = {
  new: 0,
  learning: 1,
  familiar: 2,
  mastered: 3,
};

const MASTERY_STYLE: Record<MasteryLevel, string> = {
  new: "border-transparent bg-muted text-muted-foreground",
  learning: "border-transparent bg-amber-500/15 text-amber-700",
  familiar: "border-transparent bg-sky-500/15 text-sky-700",
  mastered: "border-transparent bg-primary/15 text-primary",
};

export function MasteryBadge({ level }: { level: MasteryLevel }) {
  return (
    <Badge className={cn("capitalize", MASTERY_STYLE[level])}>{level}</Badge>
  );
}

function formatDue(date: string | null): string {
  if (!date) return "New";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 data-[state=open]:bg-accent"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="size-3.5 opacity-60" />
    </Button>
  );
}

export const columns: ColumnDef<Word>[] = [
  {
    accessorKey: "tagalog",
    header: ({ column }) => (
      <SortHeader
        label="Tagalog"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.tagalog}</span>
    ),
  },
  {
    accessorKey: "english",
    header: ({ column }) => (
      <SortHeader
        label="English"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.english}</span>
    ),
  },
  {
    accessorKey: "partOfSpeech",
    header: "Part of speech",
    filterFn: "equals",
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">
        {row.original.partOfSpeech}
      </span>
    ),
  },
  {
    accessorKey: "mastery",
    header: ({ column }) => (
      <SortHeader
        label="Mastery"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    filterFn: "equals",
    sortingFn: (a, b) =>
      MASTERY_ORDER[a.original.mastery] - MASTERY_ORDER[b.original.mastery],
    cell: ({ row }) => <MasteryBadge level={row.original.mastery} />,
  },
  {
    accessorKey: "nextReview",
    header: ({ column }) => (
      <SortHeader
        label="Next review"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    sortingFn: (a, b) =>
      (a.original.nextReview ?? "9999").localeCompare(
        b.original.nextReview ?? "9999",
      ),
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDue(row.original.nextReview)}
      </span>
    ),
  },
  {
    id: "audio",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={`Play pronunciation of ${row.original.tagalog}`}
        onClick={(e) => {
          e.stopPropagation();
          speakTagalog(row.original.tagalog);
        }}
      >
        <Volume2 className="size-4" />
      </Button>
    ),
  },
];
