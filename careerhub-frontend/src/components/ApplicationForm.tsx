"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { submitApplication } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const applicationSchema = z
  .object({
    // Must be between 2 and 100 characters
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be at most 100 characters"),

    // Must be a valid email format
    email: z.string().email("Please enter a valid email address"),

    // Optional string — if left blank stays as empty string in the form,
    // but we validate it only when it has content
    phone: z
      .string()
      .refine(
        (val) => val === "" || /^\+?[\d\s\-()\d]{8,15}$/.test(val),
        "Please enter a valid phone number"
      )
      .optional(),

    // valueAsNumber in register() converts the HTML string to a number before Zod sees it
    yearsOfExperience: z
      .number()
      .int("Must be a whole number")
      .min(0, "Cannot be negative")
      .max(50, "Must be 50 or less"),

    // Must be between 50 and 2000 characters
    coverLetter: z
      .string()
      .min(50, "Cover letter must be at least 50 characters — tell us why you're a strong fit")
      .max(2000, "Cover letter must be at most 2000 characters"),

    // Optional string — validated only when it has content
    linkedInUrl: z
      .string()
      .refine(
        (val) => {
          if (val === "") return true; // empty is fine
          try { return new URL(val).hostname.includes("linkedin.com"); } catch { return false; }
        },
        "Please enter a valid LinkedIn URL (must contain linkedin.com)"
      )
      .optional(),

    // RHF reads checkbox values as booleans automatically
    availableImmediately: z.boolean(),

    // Same valueAsNumber pattern as yearsOfExperience
    noticePeriodWeeks: z
      .number()
      .int("Must be a whole number")
      .min(0, "Cannot be negative"),
  })
  // Cross-field rule: if not available immediately, notice period must be > 0.
  // path places the error on the noticePeriodWeeks field, not the whole form.
  .refine(
    (data) => data.availableImmediately || data.noticePeriodWeeks > 0,
    {
      message: "Please enter your notice period in weeks",
      path: ["noticePeriodWeeks"],
    }
  );

// z.input gives us the raw form shape (before any transforms).
// We use this for useForm so RHF and Zod agree on the field types.
type ApplicationFormData = z.input<typeof applicationSchema>;

// z.output gives us the validated/transformed shape we pass to the API.
type ApplicationOutput = z.output<typeof applicationSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      availableImmediately: true, // Assume available immediately by default
      noticePeriodWeeks: 0,       // No notice period by default
      yearsOfExperience: 0,       // Start at zero years
      phone: "",                  // Empty string so the field is controlled from the start
      linkedInUrl: "",            // Same
    },
  });

  // Watch this so we can show/hide the notice period field
  const availableImmediately = watch("availableImmediately");

  const mutation = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      // Refresh jobs so applicant counts stay accurate
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // Clear the form back to defaults
      reset();
    },
  });

  // True while RHF is submitting OR the API call is in flight — prevents double-submits
  const isBusy = isSubmitting || mutation.isPending;

  // Only called by RHF when ALL Zod validations pass
  const onValid = async (data: ApplicationFormData) => {
    console.log("SUBMITTING:", data);
    // Cast to output type and clean up empty optional strings before sending to API
    const output = data as unknown as ApplicationOutput;
    await mutation.mutateAsync({
      ...output,
      jobId,
      // Convert empty strings to undefined so the API never receives ""
      phone: output.phone === "" ? undefined : output.phone,
      linkedInUrl: output.linkedInUrl === "" ? undefined : output.linkedInUrl,
    });
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (mutation.isSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
          Application Submitted!
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          Thank you for applying for <strong>{jobTitle}</strong>. We'll be in touch soon.
        </p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Apply for {jobTitle}
      </h2>

      {/* Server error panel — shown when the API call fails.
          Zod field errors appear inline under each input instead. */}
      {mutation.isError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {mutation.error?.message ?? "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {/* noValidate — stops the browser showing its own validation popups before Zod runs.
          Without it the user sees two different error systems at the same time. */}
      {/* <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5"> */}
      <form onSubmit={handleSubmit(onValid, (errors) => console.log("VALIDATION ERRORS:", errors))} noValidate className="space-y-5">

        {/* Full Name */}
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
              "bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-blue-500",
              errors.fullName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
            )}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={cn(
              "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
              "bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-blue-500",
              errors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
            )}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Phone (optional) — empty string passes validation, non-empty must match regex */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone <span className="text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            className={cn(
              "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
              "bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-blue-500",
              errors.phone ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone.message}</p>
          )}
        </div>

        {/* Years of Experience — valueAsNumber converts the HTML string to a number for Zod */}
        <div>
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <input
            id="yearsOfExperience"
            type="number"
            min={0}
            max={50}
            {...register("yearsOfExperience", { valueAsNumber: true })}
            className={cn(
              "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
              "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
              "focus:ring-2 focus:ring-blue-500",
              errors.yearsOfExperience ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
            )}
          />
          {errors.yearsOfExperience && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.yearsOfExperience.message}</p>
          )}
        </div>

        {/* Cover Letter */}
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cover Letter <span className="text-red-500">*</span>
          </label>
          <textarea
            id="coverLetter"
            rows={6}
            {...register("coverLetter")}
            placeholder="Tell us why you're a strong fit for this role…"
            className={cn(
              "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none resize-y",
              "bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-blue-500",
              errors.coverLetter ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
            )}
          />
          {errors.coverLetter && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.coverLetter.message}</p>
          )}
        </div>

        {/* LinkedIn URL (optional) — empty string passes, non-empty must be a linkedin.com URL */}
        <div>
          <label htmlFor="linkedInUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            LinkedIn URL <span className="text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <input
            id="linkedInUrl"
            type="url"
            {...register("linkedInUrl")}
            placeholder="https://linkedin.com/in/yourprofile"
            className={cn(
              "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
              "bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-blue-500",
              errors.linkedInUrl ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
            )}
          />
          {errors.linkedInUrl && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.linkedInUrl.message}</p>
          )}
        </div>

        {/* Available Immediately — RHF handles checkbox → boolean automatically */}
        <div className="flex items-center gap-3">
          <input
            id="availableImmediately"
            type="checkbox"
            {...register("availableImmediately")}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          <label htmlFor="availableImmediately" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            I am available to start immediately
          </label>
        </div>

        {/* Notice Period — hidden when available immediately.
            The .refine() fires if this is 0 and availableImmediately is false. */}
        {!availableImmediately && (
          <div>
            <label htmlFor="noticePeriodWeeks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notice Period (weeks) <span className="text-red-500">*</span>
            </label>
            <input
              id="noticePeriodWeeks"
              type="number"
              min={0}
              {...register("noticePeriodWeeks", { valueAsNumber: true })}
              className={cn(
                "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none",
                "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                "focus:ring-2 focus:ring-blue-500",
                errors.noticePeriodWeeks ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.noticePeriodWeeks && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.noticePeriodWeeks.message}</p>
            )}
          </div>
        )}

        {/* Submit — disabled while busy, grey background (not just opacity) when disabled */}
        <button
          type="submit"
          disabled={isBusy}
          className={cn(
            "w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors",
            isBusy
              ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          )}
        >
          {isBusy ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
