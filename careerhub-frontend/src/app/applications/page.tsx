// Applications page at /applications — candidate only.
// Shows a message directing users to check their email since
// the real API requires a JWT we can't access server-side.
// The actual applications are fetched client-side via the ApplicationsList component.

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ApplicationsList from "@/components/ApplicationsList";

export default async function ApplicationsPage() {
  const session = await auth();

  // Only candidates can view this page
  if (!session) redirect("/login");
  if (session.user.role !== "employer") redirect("/dashboard/listings");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My Applications</h1>
      {/* Client Component reads JWT from localStorage to fetch applications */}
      <ApplicationsList />
    </main>
  );
}