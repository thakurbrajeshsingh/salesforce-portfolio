import type { Accent } from "@/types/content";

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function accentClass(accent: Accent): string {
  return `accent-${accent}`;
}
