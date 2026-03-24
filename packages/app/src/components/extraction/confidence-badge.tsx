"use client";

import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number; // 0-100
  className?: string;
}

function getConfidenceStyle(score: number) {
  if (score >= 80)
    return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
  if (score >= 60)
    return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  const style = getConfidenceStyle(score);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {Math.round(score)}%
    </span>
  );
}
