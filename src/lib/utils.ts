import type { Accent } from "@/types/content";

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function accentClass(accent: Accent): string {
  return `accent-${accent}`;
}

export function handleCardMouseMove(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
  e.currentTarget.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
}
