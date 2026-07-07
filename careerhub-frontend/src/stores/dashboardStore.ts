// Zustand store for employer dashboard UI preferences.
// Stores view mode (table/grid) and whether to show closed jobs.
// No persist middleware — this is session-level state that resets on refresh.
// That is correct here because view preference is not user data and does not
// need to survive a page reload.

import { create } from "zustand";

interface DashboardStore {
  // Current layout mode — table is the default
  view: "table" | "grid";
  setView: (view: "table" | "grid") => void;

  // Whether to show closed job listings — true by default (show all)
  showClosedJobs: boolean;
  toggleShowClosedJobs: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  view: "table",
  setView: (view) => set({ view }),

  showClosedJobs: true,
  toggleShowClosedJobs: () =>
    set((state) => ({ showClosedJobs: !state.showClosedJobs })),
}));