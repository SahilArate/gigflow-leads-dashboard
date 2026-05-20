import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LeadStatus, LeadSource } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    [LeadStatus.NEW]: "bg-zinc-800 text-zinc-100 border border-zinc-700",
    [LeadStatus.CONTACTED]: "bg-zinc-700 text-zinc-100 border border-zinc-600",
    [LeadStatus.QUALIFIED]: "bg-white text-zinc-900 border border-zinc-300",
    [LeadStatus.LOST]: "bg-zinc-900 text-zinc-400 border border-zinc-800",
  };
  return colors[status] || "bg-zinc-800 text-zinc-100";
}

export function getSourceColor(source: LeadSource): string {
  const colors: Record<LeadSource, string> = {
    [LeadSource.WEBSITE]: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    [LeadSource.INSTAGRAM]: "bg-zinc-700 text-zinc-200 border border-zinc-600",
    [LeadSource.REFERRAL]: "bg-zinc-900 text-zinc-400 border border-zinc-800",
  };
  return colors[source] || "bg-zinc-800 text-zinc-300";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}