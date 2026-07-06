This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Assignment 1.1 --------------------------------------------------------------------------------------------------------------------------------------
## 1. Lifting State Up — The Architectural Argument
What breaks if JobList owns the state:  
If JobList keeps selectedId internally, the Home component cannot access it. That means the summary panel in Home cannot display the selected job’s title because the state is trapped inside JobList.

Nearest common ancestor rule:  
React’s rule: state should live in the nearest common ancestor of all components that need it. Since both JobList and the summary panel in Home need the selected job, the correct place for the state is Home. This guarantees a single source of truth and predictable data flow.

Data flow when a JobCard is clicked:

User clicks a JobCard.

The JobCard calls a prop function like onSelect(jobId).

That function updates selectedId in Home.

## 2. The Re-render Cycle
What React does after setSelectedId:  
React schedules a re-render of the component (Home) where the state lives. It does not immediately update the DOM; it first reconciles the virtual DOM.

Why JobCards may still re-render:  
Even if a JobCard’s props haven’t changed, React will still call its render function because its parent (JobList) re-rendered. However, React compares the new virtual DOM with the old one (diffing) and skips actual DOM updates if nothing changed.

Re-renders vs. DOM updates:  
A re-render means React recalculates the virtual DOM tree. A DOM update means React actually touches the browser DOM. Since DOM operations are expensive, React’s reconciliation ensures that most re-renders don’t translate into DOM updates. This distinction is crucial for performance.

## 3. Union Types vs. String
Scenario 1 — Typo in code:  
Suppose a developer writes employmentType = "Fulltime" (lowercase t).

With string, this silently passes and may break filtering logic.

With union type "FullTime" | "PartTime" | "Contract" | "Internship", TypeScript throws a compile-time error: Type '"Fulltime"' is not assignable to type 'EmploymentType'.

Bug is caught during development, before runtime.

Scenario 2 — API adds new type:  
API introduces "Freelance".

With string, frontend code continues compiling but fails at runtime when encountering "Freelance".

With union type, TypeScript immediately flags: Type '"Freelance"' is not assignable to type 'EmploymentType'.

This forces developers to update the union type and handle the new case, catching the bug at build time instead of runtime.

## 4. The && Rendering Trap
Why 0 renders:  
In JavaScript, 0 && <p>…</p> evaluates to 0 because && returns the left-hand operand if it is falsy. React then renders that 0 directly into the DOM. Unlike null or undefined, React treats numbers as valid children, so you see 0.

React’s behavior:  
React doesn’t coerce non-boolean falsy values to false. It simply renders them if they’re not null or undefined.

Correct solutions:

Explicit comparison:

jsx
{job.applicantCount > 0 && <p>{job.applicantCount} applicants</p>}
Use ternary:

jsx
{job.applicantCount ? <p>{job.applicantCount} applicants</p> : null}
Preferred solution:  
I prefer the explicit comparison (> 0) because it makes the intent clear: only render when count is positive. It avoids accidental rendering of 0 and is more readable than a ternary for this case.

## Assignment1.2------------------------------------------------------------------------------------------------------------------------
# Part 1 – Written Decisions

## 1. The shadcn/ui ownership model

This problem cannot happen with shadcn/ui because the component code is copied into my project when I install it. The source code is stored in my project, so I own and maintain it. If shadcn/ui releases a new version, it does not automatically change my components. I can choose to update the component myself by comparing the new version and making the changes I want.

---

## 2. Why the `cn` utility exists

The `cn` utility uses tailwind-merge to remove conflicting Tailwind classes. For example, if my JobCard has both `bg-white` and `bg-gray-100`, both classes affect the background color. With normal string concatenation, both classes stay, and the result depends on the CSS order. With `cn`, `tailwind-merge` keeps only the last background class, giving the correct result.

---

## 3. Event handler vs `useEffect`

Using `useEffect` is better because it runs whenever `selectedId` changes, no matter what caused the change. If `selectedId` changes from another part of the app, the event handler will not update `sessionStorage`. This is important because users expect their selected job to stay correct even when the state changes in different ways.

---

## 4. The source of truth for dark mode

The `isDark` state is only used to update the button and show the current theme in React. The real source of truth is the `dark` class on the `<html>` element. If `ThemeToggle` is removed and added again, it should read the current class from `<html>`. This means dark mode will still be on because the `<html>` class controls the theme, not the React state.


# CareerHub Frontend

## Overview
CareerHub is a job listing app built with Next.js and Tailwind CSS.

It supports:
- Viewing jobs
- Job status badges
- Saving selected job in session storage
- Dark mode toggle

---

## 1. Component Extraction: JobStatusBadge

We created a separate component called `JobStatusBadge`.

### Why we did this
We follow the **Single Responsibility Principle**.

- `JobCard` only shows job data
- `JobStatusBadge` only shows job status

### Why this is better

If we change how job types look (example: FullTime color changes):

**Without JobStatusBadge**
- We must change every `JobCard`
- Easy to miss some places
- Code is repeated in many files

**With JobStatusBadge**
- We change only one file
- All job cards update automatically
- Code is cleaner and easier to manage

---

## 2. cn Utility (clsx + tailwind-merge)

We use a helper called `cn`.

It combines:
- `clsx`
- `tailwind-merge`

## clsx
- Joins class names
- Can add classes only when needed



## 3. What breaks if we merge them

If we put both in one effect:

Data may be overwritten
Saved job may be lost
Page may flicker
Behavior becomes hard to debug

Keeping them separate makes the app stable.

## frontend 1.3 --------------------------------------------------------------------------------------------------------------------
## -----------------------------------------------------------------------------------------------------------------
## Part 1 — Written Decisions
## 1. Server state vs client state

useQuery gives you these features:

Caching – It saves data, so pages load faster. Without it, users wait every time.
Automatic refetching – It gets new data when needed. Without it, users may see old jobs.
Loading and error states – It manages loading and errors for you. Without it, you must write extra code.
Background updates – It updates data without removing it from the screen. Without it, users may see the page flash or become empty while loading.
## 2. The queryKey contract

The queryKey tells TanStack Query how to save, find, and share cached data.

Wrong shared key: Two different queries use the same key. Users may see the wrong data because both components share one cache.
Wrong unique key: Two components use different keys for the same data. Users may see extra loading because the data is fetched more than once.
## 3. Why fetch does not throw on HTTP errors

fetch() only throws an error if there is a network problem. If the server returns 404 or 500, fetch() still succeeds, but res.ok is false.

If you do not check res.ok and throw an error, TanStack Query thinks the request was successful. The user may see empty or incorrect data instead of an error message.

## 4. Stale-while-revalidate

The default staleTime is 0, so the data becomes stale immediately.

When the user returns to the browser tab, TanStack Query keeps the old data on the screen while it fetches new data in the background. When the new data is ready, it updates the page.

With useEffect([]), the data is only fetched once when the page loads. When the user returns to the tab later, they will still see the old data because no new request is made automatically.

## Updates

## 1. What TanStack Query manages

`useQuery` manages these automatically:

* **Data** – Stores the fetched data. Without it, you need a `useState` for the data.
* **Loading** – Tracks if data is loading. Without it, you need a loading state.
* **Error** – Tracks request errors. Without it, you need an error state.
* **Success** – Tracks if the request was successful. Without it, you need to check it yourself.
* **Refetching** – Updates data automatically. Without it, you need `useEffect` and extra code to fetch again.

---

## 2. The queryKey design decision

`["jobs"]` is the key used to store and find the jobs data in the cache.

If jobs are filtered by location, use a key like:

```text
["jobs", "Auckland"]
["jobs", "Wellington"]
```

The location must be part of the key so each location has its own cached data.

---

## 3. Skeleton design rationale

`JobCardSkeleton` looks the same as `JobCard` so the page keeps the same layout while loading.

Layout shift is when the page moves because new content changes the size or position of items.

A matching skeleton keeps everything in the same place, so the page looks smooth.

---

## 4. Gate

Run:

```bash
npm run build
```

The build must finish with:

* **0 TypeScript errors**
* **0 ESLint errors**

## 1.4------------------------------------------------------------------------------------------------------------------------
# Part 1 – Written Decisions

## 1. Why `@hookform/resolvers` is a separate package

React Hook Form and Zod are separate libraries because they can be used on their own. This makes them easier to maintain and update. The `@hookform/resolvers` package connects React Hook Form to Zod.

`zodResolver` receives the form values from React Hook Form. It passes the values to the Zod schema to check if they are valid. It then returns the validated data if everything is correct, or returns the validation errors if there are any.

---

## 2. The number input problem

HTML number inputs return the value as a **string**, even if the user types a number.

**Solution A (`valueAsNumber: true`)** changes the value from a string to a number before React Hook Form sends it to Zod.

**Solution B (`z.coerce.number()`)** lets Zod change the string into a number while it is validating the data.

Both solutions produce the same TypeScript type because the final value is still a **number**. The only difference is **where** the conversion happens.

---

## 3. `mutate` vs `mutateAsync`

When the form is submitted, `handleSubmit()` calls your submit function.

`mutate()` starts the API request but does not wait for it to finish. Because of this, `isSubmitting` becomes `false` before the request is complete, so the submit button can be clicked again too early.

`mutateAsync()` returns a Promise. `handleSubmit()` waits for that Promise to finish before setting `isSubmitting` to `false`. This keeps the submit button disabled until the request is complete.

---

## 4. `onSuccess` placement

`onSuccess` can be placed inside `useMutation()` or inside `mutation.mutate()`.

If it is inside `useMutation()`, it runs every time the mutation is successful.

If it is inside `mutation.mutate()`, it only runs for that specific mutation call.


## 2.1-----------------------------------------------------------------------------------------------------------------
1. cache: "no-store" vs the default

cache: "no-store" tells Next.js not to use its server-side fetch cache. Every request gets fresh data from the API.

The default cache is useful when the data does not change often, like a list of categories or company information. It makes the website load faster because Next.js can reuse the saved response.

This is different from TanStack Query. Next.js stores the cache on the server, while TanStack Query stores the cache in the browser. TanStack Query also has staleTime and can automatically refetch data, but Next.js fetch caching does not.

## 2. The "use client" boundary

"use client" marks a file (module) as a Client Component.

The Server Component loads the data and sends the page HTML to the browser. The Client Component adds interactivity, such as forms, buttons, and event handlers.

When the browser opens /jobs/some-id, it first receives the HTML from the Server Component. Then it downloads the JavaScript for the Client Component, which is hydrated so the interactive features start working.

## 3. Why params.id is always a string

Next.js always treats route parameters as strings because they come from the URL. It does not know if the value is a number, GUID, or slug.

If the API accepts a string GUID, no conversion is needed. You can pass params.id directly to the fetch request because it is already a string.

## 4. What "layout persists" means

When a layout persists, React keeps the same layout component while moving between pages. The layout is not destroyed or recreated, and its state is not reset.

If the layout needs updated data, such as the number of active job listings, the data can be fetched again on the server. For example, you can fetch the latest count in the layout or use revalidate so Next.js updates the cached data without making the layout a Client Component.

## 2.2-------------------------------------------------------------------------------------------------------------------
## 1. Choosing a cache strategy per data source
Jobs list: Use next: { tags: ["jobs"] } because jobs do not change often. The cache is cleared when a job is added, updated, or closed.
Single job detail: Use next: { tags: ["jobs"] } because the job details only change when the job is edited or closed.
Application statistics: Use cache: "no-store" because the numbers change often when people apply for jobs. The data should always be fresh.

Application statistics use a different strategy because they change much more often than job listings.

Both /jobs/page.tsx and /dashboard/listings/page.tsx use the same "jobs" tag because they both show the same job data. When a job changes, both pages should update together.

## 2. Why revalidateTag works across routes

The tag cache is stored on the Next.js server, not in the browser or a CDN.

The "jobs" tag is shared by the whole application. This means revalidateTag("jobs") can clear cached data from any route that uses the same tag, even if the files are in different folders.

After revalidation, the first request to /jobs is not served from the cache. Next.js fetches fresh data, stores it in the cache again, and then sends it to the user.

## 3. What Promise.all failure means for your page

With the current implementation, if getApplicationStats() fails, Promise.all() also fails. The page shows an error instead of loading the dashboard.

Two ways to show partial data are:

Fetch the jobs and statistics separately, so if the statistics fail, the jobs table still loads.
Use separate Suspense or Error Boundaries, so the jobs table loads while the statistics show an error message or fallback.

For a production employer dashboard, I would choose separate Suspense and Error Boundaries because users can still see and use the jobs table even if the statistics are unavailable.

## 4. The two-boundary vs one-boundary trade-off

With two Suspense boundaries:

T = 0 ms: The page loads with loading placeholders for both sections.
T = 120 ms: The Applications Summary appears because it finished loading.
T = 450 ms: The Listings Table appears after its data finishes loading.
T = 451 ms: The whole page is complete.

With one Suspense boundary:

T = 120 ms: The user still sees the loading placeholder because both components must finish before anything is shown.
The page only appears after the slower Listings Table is ready. This makes the page feel slower because users wait longer to see any content.


## --------------------------------------------------------------------------------------------------------------------
# Part 1 – Written Decisions

## Question 1. Mapping CareerHub roles to route protection rules

| Route                 | Who can access | If not allowed                                 | Where handled |
| --------------------- | -------------- | ---------------------------------------------- | ------------- |
| `/jobs`               | Everyone       | No redirect                                    | Page          |
| `/jobs/[id]`          | Everyone       | No redirect                                    | Page          |
| `/login`              | Everyone       | Logged-in users go to dashboard or jobs        | Page          |
| `/dashboard`          | Employers only | Not logged in → `/login`. Candidates → `/jobs` | Middleware    |
| `/dashboard/listings` | Employers only | Not logged in → `/login`. Candidates → `/jobs` | Middleware    |

**Why are these different?**

* An unauthenticated employer goes to **`/login`** because they need to sign in first.
* An authenticated candidate is already signed in, but has the wrong role. They should go to **`/jobs`**, not `/login`.

---

## Question 2. The session object design

**What is on the session?**

* id
* name
* email
* role

**What is left off?**

* Password
* Extra data not needed

**Cost of putting too much on the session**

* Bigger session.
* Slower requests.
* More data exposed.

**What breaks if role is not added to the session?**

* `auth()` cannot see the user's role.
* Route protection will not work.

**Three-step relay**

1. `authorize()` returns the user with the role.
2. `jwt()` saves the role in the token.
3. `session()` copies the role to the session.

---

## Question 3. Choosing the state tool for job filters

**Keyword search**

* Use **nuqs**.
* It stays after refresh.
* It is shared in the URL.

**Location**

* Use **nuqs**.
* It stays after refresh.
* Other people see the same filter from the URL.

**Status (Open / All)**

* Use **nuqs**.
* It stays after refresh.
* It is shared in the URL.

**Why not use useState?**

* useState resets after refresh.
* It is not saved in the URL.

**Does the employer dashboard need these filters?**

* No. They are only for the jobs page.

---

## Question 4. What the nav bar knows

**Why is await auth() in layout.tsx okay?**

* It runs on the server.
* It is fast and lets the nav show the correct links.

**What if a deep Client Component needs the session?**

* Use useSession().

**Why do both auth() and useSession() exist?**

* auth() is for Server Components.
* useSession() is for Client Components that need session data.

## =========================================================================================
# README Updates

## The role redirect decision

After login, users go to different pages based on their role. Employers go to **/dashboard** and candidates go to **/jobs**. The role is not available when `signIn()` is first called, so the role is added in `authorize()`, saved in `jwt()`, copied to the `session()`, and then used for the redirect.

---

## Middleware vs page-level guards

**Middleware:** The employer dashboard is protected in middleware because users should be stopped before the page loads.

**Page:** The login page is handled in the page because it checks if the user is already logged in and sends them to the correct page.

**General rule:** Use middleware for protected routes. Use page-level checks for page-specific redirects.

---

## Why URL state for job filters

I used **nuqs** because the filters are saved in the URL. Users can refresh the page, use the browser back and forward buttons, and share or bookmark the filtered jobs. `useState` and Zustand do not do this by themselves.

---

## Why Zustand without persist for the dashboard view

The dashboard view is only needed while the app is open, so it does not need to be saved. If it needed to stay after closing the browser, I would use **localStorage** or a user preferences API. `localStorage` is simple but only works on one device. A user preferences API works across devices but needs a backend.

---

## The async Server Component / store boundary

`ListingsTable` is a Server Component, so it cannot use `useStore` because Zustand only works in Client Components. The Client Component reads the store and passes the view value as a prop to `ListingsTable`.


## 3.1--------------------------------------------------------------------------------------------------------
# Part 1 – Written Decisions

## Question 1 – Draft persistence strategy

**Storage key**

* Use `application-draft-{jobId}`.
* This keeps each job draft separate.
* If a candidate applies for two jobs, each draft is saved with a different key.
* On another device, the draft will not be there because `localStorage` is only on one device.

**When to clear the draft**

* After the application is submitted successfully.
* When the user chooses to discard the draft.
* When the user starts a new application for the same job.

**What is safe to store**

* Name
* Email
* Phone number
* Cover letter

**What not to store**

* Files like CVs, because they are large and not good for `localStorage`.

---

## Question 2 – The skeleton loader contract

**Matching dimensions**

* The skeleton should have the same size, spacing, and layout as the real job card.

**How many skeletons?**

* Show the same number of cards that will load.
* If there are 3 jobs, show 3 skeletons.
* This keeps the page from changing size.

**Paired component**

* The skeleton and the real card should always match.
* If one changes and the other does not, the page layout will shift.

---

## Question 3 – AlertDialog vs the alternatives

**Closing a job**

* Use **AlertDialog** because it is an important action.

**Discarding a draft**

* Use **AlertDialog** because the user could lose their work.

**Server Action problem**

* `AlertDialog` is a Client Component, but the action is on the server.
* `AlertDialogAction` is shown in a portal outside the form, so `type="submit"` will not work.
* The solution is to call the Server Action from the dialog button instead of trying to submit the form.

---

## Question 4 – Empty state taxonomy

**Why are they different?**

* If there are no jobs, tell the user there are no jobs available.
* If filters find no jobs, tell the user to change or clear the filters.

**Where is the decision made?**

* It is a server-side decision.
* The server knows if there are no jobs or if the filters returned no results.

## update=====================================================================================
## Draft storage key decision

The key is scoped to the job ID: `careerhub-application-${jobId}`.

If we used one key for all jobs, a candidate applying to two jobs at the same time would have their drafts overwrite each other. Opening a second job would erase the first draft.

If the job's requirements change while a draft is saved, it does not matter — the draft stores the candidate's own answers (name, cover letter, etc.), not the job details. The candidate should just review their answers at step 3 before submitting.

---

## Solving AlertDialog with a Server Action

**Chosen approach: `useTransition`.**

The problem: `AlertDialogContent` renders in a separate part of the DOM (a Radix portal outside the page). A `type="submit"` button only works when it is inside a `<form>`. Since `AlertDialogContent` is outside the form, clicking the button does nothing.

Fix: The confirm button calls `handleConfirm()` via `onClick`. This function builds a `FormData` manually and calls the Server Action directly as a function inside `startTransition`. No form submission needed.

`useTransition` was chosen over `useMutation` because the Server Action already handles cache invalidation with `revalidateTag("jobs")`. Converting to a client mutation would break that.

---

## The Back button and validation

The Back button does not validate. This is intentional.

The user is going back to fix something. If we validate on Back, they could get blocked by errors on a step they are trying to correct. For example: a user fills step 1, goes to step 2, then wants to go back to fix a typo. If Back validated, any field that became invalid while they were on step 2 would stop them from going back at all. Validation should only block the user from moving forward, never backward.

---

## Skeleton count justification

Six skeletons are shown while the jobs page loads.

The grid is two columns wide. Six cards fills three rows — enough to look like a real list.

Too few (e.g. 2): the page looks almost empty before data arrives, then lots of cards suddenly appear.

Too many (e.g. 20): the skeleton list looks longer than the real list, which feels like content disappeared.

Six is a neutral middle ground.

---

## Empty state taxonomy

There are two empty states and they are handled server-side in `src/app/jobs/page.tsx`.

1. `allJobs` — the full unfiltered result from the API.
2. `jobs` — `allJobs` after applying the filters.

If `jobs.length === 0`:
- `allJobs.length === 0` → database is empty → show "No jobs are currently listed." No button, nothing the user can do.
- `allJobs.length > 0` → filters removed everything → show "No jobs match your search." with a Clear button.

This is done server-side because both arrays are already available during the server render. No extra fetch or client-side check is needed.

## 3.2---------------------------------------------------------------------------------------------------------
# Assignment 3.2 – Written Decisions

## Question 1 – What is worth testing?

### Category A – High-value behaviours to test

- User can move to the next step after entering valid data.
  - This is important because the user cannot finish the application if it breaks.

- Draft is saved and restored from localStorage.
  - This is important because the user does not lose their work.

- Application is submitted successfully.
  - This is important because the user must be able to send their application.

### Category B – Things NOT worth testing

- Exact CSS classes or Tailwind colours.
  - They give little value. Small design changes could break the test even though the app still works.

- Number of div elements.
  - This does not test user behaviour. Changing the layout would break the test without affecting users.

### Category C – Draft persistence

I would use the real jsdom localStorage because it tests that saving and loading really work.

A mock only checks that localStorage methods were called, but it does not test the real storage behaviour.

---

## Question 2 – Mocking the session

### Approach 1 – Mock useSession

- Replaces `useSession()` with fake data.
- Everything else stays real.

### Approach 2 – SessionProvider

- Uses the real SessionProvider.
- Only the session data is fake.

I would use Approach 1 because it is simple and only tests the auth gate.

---

## Question 3 – MSW scope

| Method | URL | Happy-path response |
|--------|-----|---------------------|
| GET | `/api/jobs/:id` | Return the job details. |
| POST | `/api/applications` | Return success (201). |
| GET | Refetched queries after submit | Return updated data. |

MSW cannot test local component state, UI changes that do not make network requests, or browser features like localStorage.

---

## Question 4 – Test naming

**a)** Implementation  
Better: **moves to the Schedule step after valid Step 1 data**

**b)** Behaviour

**c)** Implementation  
Better: **saves the draft when the user changes steps**

**d)** Behaviour

**e)** Implementation  
Better: **shows three status messages to the user**

## CI status badge
[![CI](https://github.com/Dintle25/CareerHubAPI/actions/workflows/test.yml/badge.svg)](https://github.com/Dintle25/CareerHubAPI/actions/workflows/test.yml)

## 3.3------------------------------------------------------------------------------------------------------------

## Question 1 — Image Audit

CareerHub currently has no images. There are no company logos, hero banners, employer profile pictures, or illustrations anywhere in the app. All job cards show text only.

Since there are no images, there is no candidate for `next/image` and no image to assign the `priority` prop to.

**Future note:** If company logos are added from the API, the first visible logo on the `/jobs` page would be the highest-priority candidate for the `priority` prop. It would likely be the LCP element — the largest thing painted on screen on first load.

---

## Question 2 — ApplicationWizard Loading Decision

### a. Does `ssr: false` make sense?

Yes. ApplicationWizard uses `localStorage`, `useSession`, and React Hook Form — all browser-only APIs. Setting `ssr: true` would crash or cause a hydration mismatch because the server cannot access `localStorage` or read the session cookie at render time. `ssr: false` skips server rendering and loads the wizard in the browser only.

### b. Does loading the wizard JavaScript eagerly harm a signed-out user?

Yes, slightly. A signed-out user only sees job details — they cannot use the wizard at all. Loading the wizard's JavaScript bundle (which includes Zod, React Hook Form, TanStack Query, and AlertDialog) wastes bandwidth for that user. It increases **Time to Interactive** and **Total Blocking Time**. Dynamic import delays that download until the wizard is actually needed.

### c. Why are the Assignment 3.2 tests unaffected by dynamic import?

Tests import `ApplicationWizard` directly from its source file using a normal `import` statement. Dynamic imports are a Next.js runtime feature — Vitest ignores them and loads the module directly from disk. Adding `dynamic(() => import(...))` in the page component has no effect on the test file which still does:

```ts
import ApplicationWizard from "@/components/ApplicationWizard";
```

---

## Question 3 — Static vs Dynamic Metadata

### Home page (`/`)
**Static export.** The content never changes and does not depend on API data.

```ts
export const metadata = {
  title: "CareerHub — Find Your Next Role",
  description: "Browse open roles and apply directly on CareerHub.",
};
```

### Jobs listing page (`/jobs`)
**Static export.** The page title and description do not need to reflect the current filters or job count. A fixed description is correct here.

```ts
export const metadata = {
  title: "Job Listings — CareerHub",
  description: "Browse all open roles on CareerHub.",
};
```

### Job detail page (`/jobs/[id]`)
**`generateMetadata`.** The title and description must include the specific job title and company name, which come from the API. A static export cannot know the job title at build time.

```ts
export async function generateMetadata({ params }) {
  const job = await getJob(params.id);
  return {
    title: `${job.title} at ${job.company} — CareerHub`,
    description: job.description,
  };
}
```

### Will `generateMetadata` and the page cause two network requests?

No. Next.js deduplicates `fetch` calls that share the same URL and cache options within the same request. Both `generateMetadata` and the page component call `getJob(id)`, which fetches the same URL. Next.js serves the second call from its internal per-request cache — no extra network call is made.

**The condition that must be true:** both fetches must use identical URL and cache options. If one uses `cache: "no-store"` and the other uses `next: { tags: ["jobs"] }`, deduplication does not apply.

---

## Question 4 — Lighthouse Scores

> Run Lighthouse in Chrome DevTools with these settings:
> Mode: Navigation | Device: Desktop | Categories: Performance, SEO, Best Practices

| Page                     | Performance | LCP | LCP Rating | CLS  | CLS Rating | INP | INP Rating | SEO |
|--------------------------|-------------|-----|------------|------|------------|-----|------------|-----|
| Home (`/`)               |    72       | 0.7 |   good     | 0    |  good      | N/A |            | 100 |
| Job detail (`/jobs/[id]`)|    67       | 0.9 |   good     |0.083 |  good      | N/A |            |  90 |

**SEO flags raised by Lighthouse:**
- 

> Fill in the numbers above before writing any code for Parts 2–4. The before/after comparison is a required deliverable.

## Image Optimisation

- **hero.svg (home page)** — `next/image` with `priority`. Targets LCP — this is the largest element on first paint so preloading it reduces the time the browser spends waiting for it.
- **company-logo.svg (job cards)** — `next/image` without `priority`. Targets CLS — explicit `width` and `height` props reserve space in the layout before the image loads, preventing content from shifting when images arrive.

## Bundle Analysis

The ApplicationWizard dependencies (Zod v4, React Hook Form) are isolated in 
chunk `804.caa6af2b8dabe348.js` (57 KB parsed), separate from the main bundle. 
This chunk only downloads when a candidate navigates to a job detail page.

![Bundle analyzer screenshot showing ApplicationWizard chunk](./screenshots/bundle-chunk.png)


## 3.4--------------------------------------------------------------------------------------------------------------------
# Assignment 3.4 — Written Decisions

## Question 1 — Error State Mapping

### Route: `/` (Home page — Public)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Page fails to render | 500 server error | Next.js default error page | Home page has no data fetching so this is rare. Default error page is acceptable. |

### Route: `/jobs` (Job listings — Public)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| API returns non-200 | 500/503 | Error boundary with retry button | User came to browse jobs — show a clear message and let them try again. |
| API returns empty array | 200 but no data | Empty state message | Not an error — show "No jobs listed" message. |
| Filters return no results | 200 but filtered to zero | "No jobs match your search" with Clear button | User action caused it — give them a way out. |

### Route: `/jobs/[id]` (Job detail — Public)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Job not found | 404 | `notFound()` — renders not-found.tsx | Standard Next.js pattern. Returns HTTP 404 to the browser. |
| API down | 500 | Throws — surfaces error boundary | Unexpected — let the error boundary handle it. |
| Job is closed | 200 but isActive=false | Inline "Applications Closed" banner | Not an error — informational message is correct. |

### Route: `/login` (Auth form — Public)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Wrong credentials | 401 | Inline error panel on the form | The error is about what the user typed — it belongs next to the form, not as a toast. |
| Auth server down | 500 | Inline error message | Same reasoning — keep feedback near the action that caused it. |

### Route: `/register` (Registration — Public)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Email already exists | 409 | Inline error on the email field | The user needs to know which field to fix. |
| Validation failure | 400 | Inline field errors via Zod | Field-level errors belong next to their fields. |
| Server error | 500 | Toast | The user filled the form correctly — the error is on our side. A toast is appropriate. |

### Route: `/apply/[jobId]` (Application wizard — JobSeeker only)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Not authenticated | No session | Middleware redirects to /login | Must be handled before the page loads. |
| Duplicate application | 409 | Toast error | The user already applied — they don't need to fix the form, just be informed. |
| Submit fails | 500 | Toast error | API error after valid submission — toast is correct, form stays intact for retry. |
| Job closed during wizard | 410/400 | Toast + disable submit | Race condition — inform user gracefully without losing their draft. |

### Route: `/applications` (JobSeeker only)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Not authenticated | No session | Middleware redirects to /login | Access control handled at the middleware level. |
| API returns error | 500 | Error boundary | Page cannot render without data — error boundary is correct. |
| No applications yet | 200 empty array | Empty state message | Expected state for new users — show a helpful message. |

### Route: `/dashboard` (Employer only)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Not authenticated | No session | Middleware redirects to /login | Access control at middleware level. |
| Wrong role (candidate) | Session but wrong role | Middleware redirects to /jobs | Candidate should never see this page. |

### Route: `/dashboard/listings/[id]/applicants` (Employer only)
| Error | HTTP / Cause | UI Response | Justification |
|-------|-------------|-------------|---------------|
| Listing not found | 404 | notFound() | Standard pattern. |
| Not the owner | 403 | Redirect to /dashboard | Employer tried to access another employer's listing. Redirect silently. |
| API error | 500 | Error boundary | Page cannot render without applicant data. |

### Most damaging error state
The most damaging error is a **duplicate application submission with no clear feedback**. A candidate who fills in the full multi-step wizard, submits, and receives either a silent failure or a confusing generic error will lose trust in the platform entirely. They cannot tell if their application was received or not. Unlike a 404 or a login redirect — which are clear and recoverable — an ambiguous submission error leaves the user with no next step. They may re-submit and get confused by a duplicate rejection, or they may walk away believing they applied when they did not. This directly harms the core purpose of the product.

---

## Question 2 — Business Rules: Server vs Client

| # | Rule | Enforced | Risk if client-only |
|---|------|----------|-------------------|
| 1 | Apply button hidden for employers and repeat applicants | Both | API must reject duplicate — hiding the button is not enough |
| 2 | Closed/Draft listings show status banner, Apply hidden | Both | Backend auto-closes listings — frontend must re-check on load |
| 3 | Only the owning employer sees Edit/Close controls | Both | A direct API call would succeed if only hidden on the client |
| 4 | Application status updates restricted to listing's employer | Server only | Business-critical — must be enforced at the API level |
| 5 | Expired listings auto-close on backend | Server (auto) + Client (display) | Frontend must handle the transition gracefully on next load |

### Is hiding the Apply button enough for duplicate applications?

No. Hiding the button is a UX convenience, not a security control. A user who knows the API endpoint can bypass the UI and submit directly with a tool like Postman. The API must reject duplicate applications.

The API should return **409 Conflict** for a duplicate application. The frontend should surface this as a **toast notification** — not inline on the form and not as a page-level message. The reasoning: the form data is valid, the user filled it in correctly, and the error is a business rule violation rather than a validation error. A toast tells the user what happened without implying they did something wrong, and allows them to navigate away cleanly.

---

## Question 3 — Type Risk Audit

### `JobListing` interface
**a.** Mirrors the backend `JobResponse` DTO.
**b.** Last verified by running the app and inspecting API responses in Postman during development.
**c.** Most likely to drift: `type` field (was `jobType` originally), `applicationCount` vs `applicantCount`, any new fields added to `JobResponse` (e.g. `tags`, `remote`, `experienceLevel`).

### `ApplicationRequest` interface
**a.** Mirrors the backend `CreateApplicationRequest` DTO.
**b.** Last verified by reading the C# DTO file during implementation.
**c.** Most likely to drift: optional fields like `phone` and `linkedInUrl` — the backend may have added validation rules or changed them to required.

### `ApplicationResponse` interface
**a.** Mirrors the backend application response shape.
**b.** Last verified by inspecting API responses in the browser.
**c.** Most likely to drift: `submittedAt` format — date/time serialization can change between .NET versions.

### `JobType` enum
**a.** Mirrors the backend `JobType` enum.
**b.** Last verified by reading the C# enum during implementation.
**c.** Most likely to drift: new enum values (e.g. `"Remote"`, `"Hybrid"`) added to the backend without updating the frontend union type.

### Highest risk type
**`JobListing`** carries the highest risk of drift. It has the most fields, has already drifted once (jobType → type, applicantCount → applicationCount), and is used in every major component in the app. Any backend change to `JobResponse` breaks the jobs listing, job detail, dashboard, and all filters simultaneously.

---

## Question 4 — The Five-Minute Clone Test

### Exact commands to run the full stack

```bash
# 1. Clone the repository
git clone https://github.com/Dintle25/CareerHubAPI.git
cd CareerHubAPI
```
git switch -b assignment_front_3.4 

```bash
# 2. Start Docker Desktop first (open the app and wait for it to say "Engine running")
# Then start the PostgreSQL database container
# This pulls the PostgreSQL image and creates a container automatically
docker-compose up -d

# Verify the container is running
docker ps
# You should see a container named "careerhub-db" or similar running on port 5432
```

```bash
# 3. Set up and start the backend
cd API

# Install .NET EF tools if not already installed
dotnet tool install --global dotnet-ef

# Restore NuGet packages
dotnet restore

# Create the database tables from migrations
dotnet ef database update

# Start the API
dotnet run
# Expected output: Now listening on: http://localhost:5076
```

```bash
# 4. In a NEW terminal, set up the frontend
cd careerhub-frontend

# Install Node packages
npm install

# Create the environment file
# On Mac/Linux:
cp .env.example .env.local

# On Windows PowerShell:
Copy-Item .env.example .env.local
```

Open `.env.local` and fill in these values:
```
NEXT_PUBLIC_API_URL=http://localhost:5076
AUTH_SECRET=any-random-string-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
```

```bash
# Start the frontend
npm run dev
# Expected output: Ready - http://localhost:3000
```

Open `http://localhost:3000` in your browser.

### If you are on a new/different computer

Run these extra steps before `npm run dev`:

```powershell
# If AUTH_SECRET error appears — add it directly
Add-Content .env.local "`nAUTH_SECRET=careerhub-secret-key-2026"
Add-Content .env.local "`nNEXTAUTH_URL=http://localhost:3000"

# If EF tools version mismatch warning appears
dotnet tool update --global dotnet-ef

# If database column errors appear (snake_case issue)
# Drop and recreate the database
dotnet ef database drop --force
dotnet ef database update
```

### Docker troubleshooting

```bash
# Check if Docker is running
docker info

# If the container already exists but is stopped
docker-compose start

# If you need to reset the database completely
docker-compose down -v
docker-compose up -d
dotnet ef database update
```

### Dependencies not captured by `npm install` or `dotnet restore`

| Dependency                     | Where documented                                         |
|--------------------------------|----------------------------------------------------------|
| **Docker Desktop**             | Install from docker.com — needed to run PostgreSQL       |
| **PostgreSQL container**       | `docker-compose.yml` — run `docker-compose up -d`        |
| **`NEXT_PUBLIC_API_URL`**      | `.env.local` — set to `http://localhost:5076`            |
| **`AUTH_SECRET`**              | `.env.local` — any random string                         |
| **`NEXTAUTH_URL`**             | `.env.local` — set to `http://localhost:3000`            |
| **Database connection string** | `appsettings.Development.json` — set `DefaultConnection` |
| **JWT secret**                 | `appsettings.Development.json` — set `Jwt:Key`           |
| **Database seed data**         | Run `dotnet ef database update` — migrations include seed|

### Getting started

**Register a new account:**
1. Go to `http://localhost:3000/register`
2. Fill in your first name, last name, email and password
3. Click "Create account" — you are redirected to the login page
4. On the login page, select your role (Job Seeker or Employer)
5. Enter your email and password and click "Sign in"
6. Employers are redirected to `/dashboard/listings`
7. Candidates are redirected to `/jobs`

**Note:** Register separately for each role you want to test. Use different email addresses for the employer and job seeker accounts.


## Part 4 — End-to-End Demo Screenshots

### Employer Journey

**Milestone 1 — Registration**
![Employer Registration](./screenshots/Screenshot%20(179).png)

**Milestone 2 — Create a listing**
![Create Listing](./screenshots/Screenshot%20(180).png)

**Milestone 3 — Ownership controls**
![Ownership Controls](./screenshots/Screenshot%20(181).png)

**Milestone 4 — view job details**
![Close Listing](./screenshots/Screenshot%20(182).png)

**Milestone 5 — close listong/job**
![View Applicants](./screenshots/Screenshot%20(183).png)

**Milestone 6 — closed**
![Update Status](./screenshots/Screenshot%20(184).png)


**Milestone 7 — listings**
![JobSeeker Registration](./screenshots/Screenshot%20(185).png)

**Milestone 8 — applicants**
![Browse Jobs](./screenshots/Screenshot%20(186).png)

### JobSeeker Journey

**Milestone 1 — register**
![Job Detail](./screenshots/Screenshot%20(187).png)

**Milestone 2 — jobs**
![Apply](./screenshots/Screenshot%20(188).png)

**Milestone 3 — filter by search**
![Duplicate Blocked](./screenshots/Screenshot%20(189).png)

**Milestone 4 — apply**
![Closed Listing](./screenshots/Screenshot%20(190).png)

**Milestone 5 — submit application**
![Closed Listing](./screenshots/Screenshot%20(191).png)

**Milestone 6 — duplicate application**
![Closed Listing](./screenshots/Screenshot%20(192).png)

**Milestone 7 — Closed job**
![Closed Listing](./screenshots/Screenshot%20(193).png)


## update===============================================================================================
# Assignment 3.4 — README Additions

---

## Five-Minute Setup Guide

### 1. Clone the repository
```bash
git clone https://github.com/Dintle25/CareerHubAPI.git
cd CareerHubAPI
```

### 2. Start the database
```bash
docker-compose up -d
```

### 3. Start the backend
```bash
cd API
dotnet restore
dotnet ef database update
dotnet run
```
Expected: `Now listening on: http://localhost:5076`

### 4. Set up the frontend
Open a new terminal:
```bash
cd careerhub-frontend
npm install
```

Create `.env.local` and fill in these values:
```
NEXT_PUBLIC_API_URL=http://localhost:5076
AUTH_SECRET=any-random-string
NEXTAUTH_URL=http://localhost:3000
SENTRY_DSN=your-sentry-dsn
```

### 5. Run the frontend
```bash
npm run dev
```
Expected: `http://localhost:3000` loads the home page.

### 6. Test accounts (no registration needed)
| Username  | Password    | Role      |
|-----------|-------------|-----------|
| employer1 | password123 | employer  |
| alice     | password123 | candidate |

---

## Error State Documentation

### 1. Duplicate application (409)
**What triggers it:** A candidate applies to a job they already applied to.

**What the user sees:** A toast with the API's message. The wizard stays open with their data intact.

**Why:** The form is valid — the error is a business rule, not a form mistake. A toast is correct here. Keeping the form data means they don't lose their work.

### 2. Candidate tries to access the dashboard (403)
**What triggers it:** A candidate types `/dashboard` directly in the URL.

**What the user sees:** "Access Denied — Employer Access Required" with a link back to jobs. No retry button.

**Why:** Retrying won't help — their role hasn't changed. A retry button would be misleading. The message tells them exactly why they can't access the page.

### 3. Session expires during application (401)
**What triggers it:** The candidate's login session expires while they are filling in the wizard.

**What the user sees:** An error toast. The wizard stays open and the localStorage draft is preserved.

**Why:** The candidate spent time filling in the form. Losing their data would be a bad experience. They can sign in again and return to find their draft restored automatically.

---

## Type Generation Findings

After running `npm run generate:types` and replacing hand-written types, three breaks appeared:

### Break 1 — Fields marked as optional
The generated `JobResponse` marks most fields as `string | undefined`. The hand-written type assumed they were always present. Fix: kept the stricter hand-written interface since the API always returns these fields.

### Break 2 — `ApplicationResponse` not in the generated file
The backend exposes this type under a different name in the OpenAPI spec. Fix: kept the hand-written interface.

### Break 3 — `JobType` is a number in the generated type but a string in the API
The OpenAPI spec says number (0, 1, 2, 3) but the API actually sends strings ("FullTime", "PartTime" etc.). This is a real inconsistency in the spec. Fix: kept `JobType` as a string union and used `as unknown as JobType` where needed.

---

## End-to-End Demo Writeup

### Employer
Registration and login worked first try. Creating a listing failed at first because the form was sending a company name string but the API requires a company ID (GUID). Fixed by adding a company dropdown that fetches from the API. Closing a job worked but the listing disappeared from the dashboard immediately — because the API filters out closed jobs. Fixed by removing the `isActive` filter so employers can see all listings. Viewing applicants and updating status worked after fixing the response shape from `{ value: [...] }`.

### Job Seeker
Registration, login, and browsing worked first try. URL filters persisted correctly. The wizard was the biggest problem — it was submitting on step 2 instead of going to the review step. The fix was to remove the `<form>` element and use a plain button with `onClick` to call the mutation directly. After that, all three steps worked and the success toast fired correctly. The most surprising issue was that mock users (alice, bob) don't have real JWT tokens so applying returned 401. Fixed by storing the real API token in localStorage during login.