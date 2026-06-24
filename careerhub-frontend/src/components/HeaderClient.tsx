"use client";

import { AuthNav } from "@/components/AuthNav";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function HeaderClient() {
  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <AuthNav />
    </div>
  );
}