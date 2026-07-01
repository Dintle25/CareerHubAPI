// Tests for CloseJobButton — tests 10 and 11.
// AlertDialog renders in a Radix portal (document.body) — RTL's screen
// queries the whole document so getByRole finds portal content automatically.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./utils";
import CloseJobButton from "@/components/CloseJobButton";

describe("CloseJobButton", () => {

  // Test 10 — AlertDialog opens when the Close listing button is clicked
  it("opens the AlertDialog when the close button is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CloseJobButton jobId="job-1" isActive={true} />
    );

    await user.click(screen.getByRole("button", { name: "Close listing" }));

    // AlertDialog title visible in the Radix portal
    expect(screen.getByText("Close this listing?")).toBeInTheDocument();
  });

  // Test 11 — confirm button calls the action and shows success state
  it("shows success state after the user confirms the close action", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CloseJobButton jobId="job-1" isActive={true} />
    );

    // Open the dialog
    await user.click(screen.getByRole("button", { name: "Close listing" }));

    // Both the trigger and the AlertDialogAction share the label "Close listing".
    // getAllByRole returns both — the last one is the confirm button inside the portal.
    const allCloseButtons = screen.getAllByRole("button", { name: /close listing/i });
    const actionButton = allCloseButtons[allCloseButtons.length - 1];
    await user.click(actionButton);

    // Wait for success indicator — "✓ Closed" replaces the button
    expect(await screen.findByText(/✓ Closed/i)).toBeInTheDocument();
  });
});