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

## Suvarnabhumi requests

The Suvarnabhumi menu opens `/dashboard/suvarnabhumi`. Requests come from `public.suvarnabhumi_clearance_requests`, with newest-first pagination, text search, carrier filtering, Bangkok timestamps, and mobile cards. Details include both contact fields, goods, tracking/AWB, the courier message, and attached documents. Refresh reloads current server data.

Access uses the existing Supabase sign-in and a read-only admin membership check. Only `admin@clearpost.co.th` is currently authorized in `private.clearpost_admin_members`. New Auth accounts receive no access automatically. Membership is managed by project administrators, never from a public form. No service-role credential is needed.

Files stay in the private `suvarnabhumi-notices` bucket. The authenticated attachment route checks membership, loads the stored path from an accessible request, then returns a five-minute signed URL. It supports original-name downloads and disables response caching.

Database setup snapshots are in `database/suvarnabhumi-admin-read.sql`; the remote migrations `suvarnabhumi_admin_read` and `suvarnabhumi_admin_access_check` have already been applied. Do not rerun the snapshots.

Run the focused access and attachment tests with `node --test tests/suvarnabhumi.test.cjs`, and validate the app with `npm run build`.
