"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addWord } from "@/lib/data";
import type { PartOfSpeech, Word } from "@/lib/types";

const POS_OPTIONS: PartOfSpeech[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "particle",
  "phrase",
];

const schema = z.object({
  tagalog: z.string().min(1, "Tagalog word is required"),
  english: z.string().min(1, "English meaning is required"),
  partOfSpeech: z.enum([
    "noun",
    "verb",
    "adjective",
    "adverb",
    "pronoun",
    "particle",
    "phrase",
  ]),
  exampleTagalog: z.string().optional(),
  exampleEnglish: z.string().optional(),
  pronunciationHint: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddWordDialog({ onAdded }: { onAdded: (word: Word) => void }) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tagalog: "",
      english: "",
      partOfSpeech: "noun",
      exampleTagalog: "",
      exampleEnglish: "",
      pronunciationHint: "",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const word = await addWord(values);
    onAdded(word);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add word
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a word</DialogTitle>
          <DialogDescription>
            Add a new word to your vocabulary bank.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tagalog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagalog</FormLabel>
                    <FormControl>
                      <Input placeholder="kumusta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="english"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English</FormLabel>
                    <FormControl>
                      <Input placeholder="hello" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="partOfSpeech"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part of speech</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {POS_OPTIONS.map((pos) => (
                        <SelectItem key={pos} value={pos} className="capitalize">
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="exampleTagalog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Example (Tagalog)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Kumusta ka?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exampleEnglish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Example (English)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="How are you?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pronunciationHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronunciation hint</FormLabel>
                  <FormControl>
                    <Input placeholder="koo-moos-TAH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Optional notes…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add word
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
