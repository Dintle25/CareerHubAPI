import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./utils";
import ApplicationWizard from "@/components/ApplicationWizard";
import type { Session } from "next-auth";

const CANDIDATE_SESSION: Session = {
  user: { name: "alice", email: "alice@test.com", role: "candidate" },
  expires: "2099-01-01",
};

//  Step navigation ------------------------------------------------------------------------------------------------

describe("Step navigation", () => {

  // Test 1 — wizard renders and shows the step 1 heading
  it("renders the step 1 heading on mount", () => {
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />
    );
    expect(
      screen.getByRole("heading", { name: /apply for frontend developer/i })
    ).toBeInTheDocument();
  });

  // Test 2 — clicking Next without filling required fields shows errors and stays on step 1
  it("blocks advancement when required step 1 fields are empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Full name must be at least 2 characters")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /apply for frontend developer/i })
    ).toBeInTheDocument();
  });

  // Test 3 — filling required fields and clicking Next moves to step 2
  it("advances to step 2 when step 1 required fields are filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />
    );

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email address/i), "alice@test.com");
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Cover letter input only exists on step 2
    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
  });

  // Test 4 — going back from step 2 still shows the values typed in step 1
  it("back button preserves step 1 values", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />
    );

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email address/i), "alice@test.com");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByDisplayValue("Alice Smith")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@test.com")).toBeInTheDocument();
  });
});

//  Auth gate -----------------------------------------------------------------------------------------------------------

describe("Auth gate", () => {

  // Test 5 — signed-out user sees sign-in message and does not advance to step 2
  it("shows sign-in message when Next is clicked and user is not authenticated", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />,
      { session: null }
    );

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email address/i), "alice@test.com");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText(/you need to be signed in as a candidate/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cover letter/i)).not.toBeInTheDocument();
  });

  // Test 6 — authenticated candidate advances to step 2 normally
  it("advances normally when the user is authenticated as a candidate", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />,
      { session: CANDIDATE_SESSION }
    );

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email address/i), "alice@test.com");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
  });
});

//  Review step ------------------------------------------------------------------------------------------------------

describe("Review step", () => {

  // Test 7 — review screen shows filled values and "Not provided" for empty optional fields
  it("shows all entered values and Not provided for empty optional fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />,
      { session: CANDIDATE_SESSION }
    );

    // Step 1
    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/email address/i), "alice@test.com");
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 2 — select how they heard, leave cover letter and LinkedIn empty
    await user.selectOptions(
      screen.getByLabelText(/how did you hear about this role/i),
      "linkedin"
    );
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Review screen — filled values are visible
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("linkedin")).toBeInTheDocument();

    // Empty optional fields show "Not provided"
    const notProvided = screen.getAllByText("Not provided");
    expect(notProvided.length).toBeGreaterThan(0);
  });
});

//  Submit tests (MSW) -------------------------------------------------------------------------------------------

import { http, HttpResponse } from "msw";
import { server } from "./msw/server";

// Helper — fills all required fields across all steps and reaches the submit button.
// Reused by tests 8 and 9 to avoid duplicating the fill logic.
async function fillAllSteps(user: ReturnType<typeof userEvent.setup>) {
  // Step 1
  await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
  await user.type(screen.getByLabelText(/email address/i), "alice@test.com");
  await user.click(screen.getByRole("button", { name: "Next" }));

  // Step 2
  await user.selectOptions(
    screen.getByLabelText(/how did you hear about this role/i),
    "linkedin"
  );
  await user.click(screen.getByRole("button", { name: "Next" }));

  // Now on step 3 — submit button is visible
}

const CANDIDATE = (): Session => ({
  user: { name: "alice", email: "alice@test.com", role: "candidate" },
  expires: "2099-01-01",
});

describe("Submit flow (MSW)", () => {

  // Test 8 — happy path: form resets after successful submission
  it("resets the wizard to step 1 after successful submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />,
      { session: CANDIDATE() }
    );

    await fillAllSteps(user);

    // Submit
    await user.click(screen.getByRole("button", { name: "Submit Application" }));

    // Wait for the button to return to idle — means the mutation completed
    await screen.findByRole("heading", { name: /apply for frontend developer/i });

    // Wizard reset to step 1 — name field is empty
    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
  });

  // Test 9 — error path: form retains values when the API returns 500
  it("retains form values when the API returns an error", async () => {
    // Override the POST handler to return 500 for this test only
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications`, () => {
        // Return a JSON body so api.ts can parse it without crashing
        return HttpResponse.json(
          { detail: "Internal server error" },
          { status: 500 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithProviders(
      <ApplicationWizard jobId="job-1" jobTitle="Frontend Developer" />,
      { session: CANDIDATE() }
    );

    await fillAllSteps(user);

    // Suppress the expected error from the 500 response
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: "Submit Application" }));

    // Wait for button to stop showing "Submitting…"
    await screen.findByRole("button", { name: "Submit Application" });
    consoleSpy.mockRestore();

    // Go back to step 1 and check values are still there
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByDisplayValue("Alice Smith")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@test.com")).toBeInTheDocument();
  });
});