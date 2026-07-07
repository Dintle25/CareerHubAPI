"use client";


// Client Component that holds the theme toggle in the header.
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function HeaderClient() {
  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
    </div>
  );
}