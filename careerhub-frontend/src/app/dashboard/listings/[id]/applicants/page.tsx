// Applicants page at /dashboard/listings/[id]/applicants — employer only.
// Shows all applications for a specific job listing.

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ApplicantStatusForm from "@/components/ApplicantStatusForm";

interface Applicant {
  id: string;
  jobId: string;
  email: string;
  submittedAt: string;
  status: number;
  fullName?: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Reviewing",
  2: "Accepted",
  3: "Rejected",
};

async function getApplicants(jobId: string): Promise<Applicant[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications?jobId=${jobId}`,
    { cache: "no-store" }
  );
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to fetch applicants: ${res.status}`);
  return res.json();
}

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "employer") redirect("/jobs");

  const { id } = await params;
  const applicants = await getApplicants(id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard/listings" className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Back to listings
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Applicants — {applicants.length} {applicants.length === 1 ? "application" : "applications"}
      </h1>

      {applicants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No applications yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Applicant</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Submitted</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {applicants.map((app) => (
                <tr key={app.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{app.fullName ?? app.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(app.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                      {STATUS_LABELS[app.status] ?? "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ApplicantStatusForm applicationId={app.id} currentStatus={app.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}