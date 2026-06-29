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