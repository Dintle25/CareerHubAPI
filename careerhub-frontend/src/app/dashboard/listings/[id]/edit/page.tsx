"use client";

// Edit listing page at /dashboard/listings/[id]/edit — employer only.
// Pre-fills the form with the current job data and submits a PATCH request.

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const editSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["FullTime", "PartTime", "Contract", "Internship"]),
  closingDate: z.string().min(1, "Closing date is required"),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  // Load existing job data into the form
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`)
      .then((r) => r.json())
      .then((job) => {
        reset({
          title: job.title,
          description: job.description,
          location: job.location,
          type: job.type,
          closingDate: job.closingDate?.slice(0, 10),
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
        });
      })
      .catch(() => toast.error("Failed to load job."))
      .finally(() => setLoading(false));
  }, [id, reset]);

  async function onSubmit(data: EditFormData) {
    setError(null);
    const token = localStorage.getItem("ch_token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...data,
        closingDate: new Date(data.closingDate).toISOString(),
      }),
    });

    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      setError(problem.detail ?? "Failed to update listing.");
      return;
    }

    toast.success("Listing updated successfully.");
    router.push(`/jobs/${id}`);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/jobs/${id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Back to listing
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Listing</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title <span className="text-red-500">*</span></label>
          <input id="title" type="text" {...register("title")} className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.title ? "border-red-500" : "border-gray-300")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="text-red-500">*</span></label>
          <textarea id="description" rows={5} {...register("description")} className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.description ? "border-red-500" : "border-gray-300")} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location <span className="text-red-500">*</span></label>
          <input id="location" type="text" {...register("location")} className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.location ? "border-red-500" : "border-gray-300")} />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type <span className="text-red-500">*</span></label>
          <select id="type" {...register("type")} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            <option value="FullTime">Full Time</option>
            <option value="PartTime">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div>
          <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Closing Date <span className="text-red-500">*</span></label>
          <input id="closingDate" type="date" {...register("closingDate")} className={cn("mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.closingDate ? "border-red-500" : "border-gray-300")} />
          {errors.closingDate && <p className="mt-1 text-xs text-red-600">{errors.closingDate.message}</p>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Salary <span className="text-gray-400">(optional)</span></label>
            <input id="salaryMin" type="number" {...register("salaryMin", { valueAsNumber: true })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <div className="flex-1">
            <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Salary <span className="text-gray-400">(optional)</span></label>
            <input id="salaryMax" type="number" {...register("salaryMax", { valueAsNumber: true })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </main>
  );
}