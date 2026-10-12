"use client";

import { useMemo, useState } from "react";
import {
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MasteryLevel, PartOfSpeech, Word } from "@/lib/types";

import { AddWordDialog } from "./add-word-dialog";
import { columns } from "./columns";
import { WordSheet } from "./word-sheet";

const MASTERY_FILTERS: (MasteryLevel | "all")[] = [
  "all",
  "new",
  "learning",
  "familiar",
  "mastered",
];
const POS_FILTERS: (PartOfSpeech | "all")[] = [
  "all",
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "particle",
  "phrase",
];

// Match the search box against Tagalog or English.
const globalFilterFn: FilterFn<Word> = (row, _id, value) => {
  const q = String(value).toLowerCase();
  return (
    row.original.tagalog.toLowerCase().includes(q) ||
    row.original.english.toLowerCase().includes(q)
  );
};

export function VocabTable({ initialWords }: { initialWords: Word[] }) {
  const [words, setWords] = useState<Word[]>(initialWords);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [mastery, setMastery] = useState<MasteryLevel | "all">("all");
  const [pos, setPos] = useState<PartOfSpeech | "all">("all");

  const [selected, setSelected] = useState<Word | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (mastery !== "all") filters.push({ id: "mastery", value: mastery });
    if (pos !== "all") filters.push({ id: "partOfSpeech", value: pos });
    return filters;
  }, [mastery, pos]);

  // TanStack Table returns non-memoizable functions, so the React Compiler skips
  // this component — expected and safe for a table of this size.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: words,
    columns,
    state: { sorting, columnFilters, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;

  function openWord(word: Word) {
    setSelected(word);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Tagalog or English…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={mastery} onValueChange={(v) => setMastery(v as MasteryLevel | "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Mastery" />
          </SelectTrigger>
          <SelectContent>
            {MASTERY_FILTERS.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {m === "all" ? "All mastery" : m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={pos} onValueChange={(v) => setPos(v as PartOfSpeech | "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Part of speech" />
          </SelectTrigger>
          <SelectContent>
            {POS_FILTERS.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p === "all" ? "All types" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AddWordDialog onAdded={(word) => setWords((prev) => [word, ...prev])} />
      </div>

      {/* Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No words match your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => openWord(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {rows.length} {rows.length === 1 ? "word" : "words"}
      </p>

      <WordSheet word={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
