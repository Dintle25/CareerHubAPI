"use client";

// Three-step application wizard with draft auto-save and discard draft AlertDialog.
// Step 1: Your Details (name, email, phone)
// Step 2: Your Application (cover letter, LinkedIn, how did you hear)
// Step 3: Review & Submit (read-only summary)

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitApplication } from "@/lib/api";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── Zod Schema ────────────────────────────────────────────────────────────────

const wizardSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must be at most 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    coverLetter: z.string().optional(),
    linkedInUrl: z.string().optional(),
    hearAboutRole: z.string().min(1, "Please select an option"),
  })
  // Cross-step rule: LinkedIn URL must start with the correct domain if provided
  .refine(
    (data) => {
      if (!data.linkedInUrl || data.linkedInUrl === "") return true;
      return (
        data.linkedInUrl.startsWith("https://linkedin.com/") ||
        data.linkedInUrl.startsWith("https://www.linkedin.com/")
      );
    },
    { message: "LinkedIn URL must start with https://linkedin.com/ or https://www.linkedin.com/", path: ["linkedInUrl"] }
  );

type WizardFormData = z.infer<typeof wizardSchema>;

// Fields validated per step — step 3 has none (review only)
const STEP_FIELDS: Record<number, (keyof WizardFormData)[]> = {
  1: ["fullName", "email", "phone"],
  2: ["coverLetter", "linkedInUrl", "hearAboutRole"],
  3: [],
};

const EMPTY_DEFAULTS: WizardFormData = {
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
  linkedInUrl: "",
  hearAboutRole: "",
};

interface ApplicationWizardProps {
  jobId: string;
  jobTitle: string;
}

export default function ApplicationWizard({ jobId, jobTitle }: ApplicationWizardProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const storageKey = `careerhub-application-${jobId}`;

  const [step, setStep] = useState(1);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [hasDraft, setHasDraft] = useState(false); // tracks if draft exists for discard button
  const [showSignInMessage, setShowSignInMessage] = useState(false);

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: EMPTY_DEFAULTS,
    mode: "onTouched",
  });

  const { register, handleSubmit, trigger, watch, reset, formState: { errors } } = form;

  // On mount — restore draft from localStorage if one exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        reset(parsed);
        setShowDraftBanner(true);
        setHasDraft(true);
      }
    } catch {
      // Ignore corrupted drafts
    }
  }, [storageKey, reset]);

  // Auto-save on every field change using watch() as a subscription with cleanup
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
        setHasDraft(true);
      } catch {
        // Ignore storage errors
      }
    });
    // Cleanup — unsubscribe when component unmounts to avoid memory leaks
    return () => subscription.unsubscribe();
  }, [watch, storageKey]);

  const mutation = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      toast.success(`Application for "${jobTitle}" submitted! We'll be in touch soon.`);
      // Clear draft on successful submit
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setShowDraftBanner(false);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      reset(EMPTY_DEFAULTS);
      setStep(1);
    },
    onError: (error) => {
      toast.error(error?.message ?? "Something went wrong. Please try again.");
    },
  });

  async function handleNext() {
    if (step === 1) {
      const valid = await trigger(STEP_FIELDS[1]);
      if (!valid) return;

      // Check sign-in at step 1 → step 2 transition
      if (!session || session.user.role !== "candidate") {
        setShowSignInMessage(true);
        return;
      }

      setShowSignInMessage(false);
      setStep(2);
      return;
    }

    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setStep((s) => s + 1);
  }

  // Back — no re-validation, just move back
  function handleBack() {
    setStep((s) => s - 1);
  }

  // Discard draft — clears localStorage, resets form, goes back to step 1
  function handleDiscardDraft() {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setShowDraftBanner(false);
    reset(EMPTY_DEFAULTS);
    setStep(1);
  }

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync({
      jobId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || undefined,
      yearsOfExperience: 0,
      coverLetter: data.coverLetter || "",
      linkedInUrl: data.linkedInUrl || undefined,
      availableImmediately: true,
      noticePeriodWeeks: 0,
    });
  });

  const values = watch();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Apply for {jobTitle}
        </h2>

        {/* Discard draft button — only shown when a draft exists */}
        {hasDraft && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-xs text-red-600 hover:underline dark:text-red-400">
                Discard draft
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard your draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your saved application progress will be permanently deleted.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep draft</AlertDialogCancel>
                {/* Confirm — pure client-side state manipulation, no Server Action */}
                <AlertDialogAction
                  onClick={handleDiscardDraft}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Discard draft
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              step === n ? "bg-blue-600 text-white" : step > n ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            )}>
              {step > n ? "✓" : n}
            </div>
            <span className={cn(
              "text-xs font-medium",
              step === n ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
            )}>
              {n === 1 ? "Your Details" : n === 2 ? "Your Application" : "Review & Submit"}
            </span>
            {n < 3 && <div className="h-px w-6 bg-gray-200 dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      {/* Draft restored banner */}
      {showDraftBanner && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You have a saved draft for this application. Restored automatically.
          </p>
          <button
            onClick={() => setShowDraftBanner(false)}
            className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>

        {/* ── Step 1: Your Details ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                className={cn(
                  "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
                  "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                  "focus:ring-2 focus:ring-blue-500",
                  errors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={cn(
                  "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
                  "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                  "focus:ring-2 focus:ring-blue-500",
                  errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Sign-in message — shown when user tries to advance without being a candidate */}
            {showSignInMessage && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-950">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You need to be signed in as a candidate to apply.{" "}
                  <Link href="/login" className="font-semibold underline">Sign in here</Link>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Your Application ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Letter <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="coverLetter"
                rows={6}
                {...register("coverLetter")}
                placeholder="Tell us why you're a strong fit for this role…"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none resize-y focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="linkedInUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                LinkedIn Profile URL <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="linkedInUrl"
                type="url"
                {...register("linkedInUrl")}
                placeholder="https://linkedin.com/in/yourprofile"
                className={cn(
                  "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
                  "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                  "focus:ring-2 focus:ring-blue-500",
                  errors.linkedInUrl ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.linkedInUrl && <p className="mt-1 text-xs text-red-600">{errors.linkedInUrl.message}</p>}
            </div>

            <div>
              <label htmlFor="hearAboutRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                How did you hear about this role? <span className="text-red-500">*</span>
              </label>
              <select
                id="hearAboutRole"
                {...register("hearAboutRole")}
                className={cn(
                  "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
                  "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                  "focus:ring-2 focus:ring-blue-500",
                  errors.hearAboutRole ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
              >
                <option value="">Select an option…</option>
                <option value="linkedin">LinkedIn</option>
                <option value="careerhub">CareerHub</option>
                <option value="referral">Employee Referral</option>
                <option value="jobboard">Job Board</option>
                <option value="other">Other</option>
              </select>
              {errors.hearAboutRole && <p className="mt-1 text-xs text-red-600">{errors.hearAboutRole.message}</p>}
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Submit ───────────────────────────────────── */}
        {step === 3 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Your Details
            </h3>
            <dl className="space-y-2 text-sm">
              <ReviewRow label="Full Name" value={values.fullName} />
              <ReviewRow label="Email" value={values.email} />
              <ReviewRow label="Phone" value={values.phone} />
            </dl>

            <h3 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Your Application
            </h3>
            <dl className="space-y-2 text-sm">
              <ReviewRow label="Cover Letter" value={values.coverLetter} />
              <ReviewRow label="LinkedIn URL" value={values.linkedInUrl} />
              <ReviewRow label="How did you hear about this role?" value={values.hearAboutRole} />
            </dl>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={mutation.isPending}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold text-white",
                mutation.isPending ? "cursor-not-allowed bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {mutation.isPending ? "Submitting…" : "Submit Application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Read-only review row — shows "Not provided" for empty optional fields
function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-48 shrink-0 font-medium text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className={cn("text-gray-900 dark:text-gray-100", !value && "italic text-gray-400 dark:text-gray-500")}>
        {value || "Not provided"}
      </dd>
    </div>
  );
}