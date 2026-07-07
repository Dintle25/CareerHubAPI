"use client";

// New listing page at /dashboard/listings/new — employer only.
// Fetches companies on mount and lets the employer select one.
// Sends CompanyId (Guid) to the API as required by CreateJobRequest.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
}

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120, "Title cannot exceed 120 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  companyId: z.string().min(1, "Please select a company"),
  type: z.enum(["FullTime", "PartTime", "Contract", "Internship"]),
  closingDate: z.string().min(1, "Closing date is required"),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function NewListingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Fetch companies on mount so employer can select one
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/companies`)
      .then((r) => r.json())
      .then((data) => {
        // API returns { value: [...] }
        const list = Array.isArray(data) ? data : data.value ?? [];
        setCompanies(list);
      })
      .catch(() => toast.error("Failed to load companies."))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: { type: "FullTime" },
  });

  async function onSubmit(data: ListingFormData) {
    setError(null);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        location: data.location,
        companyId: data.companyId,
        type: data.type,
        closingDate: new Date(data.closingDate).toISOString(),
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
      }),
    });

    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      setError(problem.detail ?? problem.title ?? "Failed to create listing.");
      return;
    }

    toast.success("Listing created successfully.");
    router.push("/dashboard/listings");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/dashboard/listings" className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Back to listings
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Listing</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input id="title" type="text" {...register("title")}
            className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.title ? "border-red-500" : "border-gray-300")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        {/* Company dropdown — populated from the API */}
        <div>
          <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company <span className="text-red-500">*</span>
          </label>
          <select id="companyId" {...register("companyId")} disabled={loadingCompanies}
            className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50", errors.companyId ? "border-red-500" : "border-gray-300")}>
            <option value="">{loadingCompanies ? "Loading companies…" : "Select a company…"}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.companyId && <p className="mt-1 text-xs text-red-600">{errors.companyId.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea id="description" rows={5} {...register("description")}
            className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.description ? "border-red-500" : "border-gray-300")} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location <span className="text-red-500">*</span>
          </label>
          <input id="location" type="text" {...register("location")}
            className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.location ? "border-red-500" : "border-gray-300")} />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
        </div>

        {/* Employment type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select id="type" {...register("type")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            <option value="FullTime">Full Time</option>
            <option value="PartTime">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Closing date */}
        <div>
          <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Closing Date <span className="text-red-500">*</span>
          </label>
          <input id="closingDate" type="date" {...register("closingDate")}
            className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.closingDate ? "border-red-500" : "border-gray-300")} />
          {errors.closingDate && <p className="mt-1 text-xs text-red-600">{errors.closingDate.message}</p>}
        </div>

        {/* Salary range */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Min Salary <span className="text-gray-400">(optional)</span>
            </label>
            <input id="salaryMin" type="number" {...register("salaryMin", { valueAsNumber: true })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <div className="flex-1">
            <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Salary <span className="text-gray-400">(optional)</span>
            </label>
            <input id="salaryMax" type="number" {...register("salaryMax", { valueAsNumber: true })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting || loadingCompanies}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Creating…" : "Create Listing"}
        </button>
      </form>
    </main>
  );
}