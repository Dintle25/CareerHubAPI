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