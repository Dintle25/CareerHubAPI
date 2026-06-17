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
Lifting State Up — The Architectural Argument
What breaks if JobList owns the state:  
If JobList keeps selectedId internally, the Home component cannot access it. That means the summary panel in Home cannot display the selected job’s title because the state is trapped inside JobList.

Nearest common ancestor rule:  
React’s rule: state should live in the nearest common ancestor of all components that need it. Since both JobList and the summary panel in Home need the selected job, the correct place for the state is Home. This guarantees a single source of truth and predictable data flow.

Data flow when a JobCard is clicked:

User clicks a JobCard.

The JobCard calls a prop function like onSelect(jobId).

That function updates selectedId in Home.

2. The Re-render Cycle
What React does after setSelectedId:  
React schedules a re-render of the component (Home) where the state lives. It does not immediately update the DOM; it first reconciles the virtual DOM.

Why JobCards may still re-render:  
Even if a JobCard’s props haven’t changed, React will still call its render function because its parent (JobList) re-rendered. However, React compares the new virtual DOM with the old one (diffing) and skips actual DOM updates if nothing changed.

Re-renders vs. DOM updates:  
A re-render means React recalculates the virtual DOM tree. A DOM update means React actually touches the browser DOM. Since DOM operations are expensive, React’s reconciliation ensures that most re-renders don’t translate into DOM updates. This distinction is crucial for performance.

3. Union Types vs. String
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

4. The && Rendering Trap
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