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

## Authentication

Authentication supports email/password accounts and Google sign-in. The Google
option is available only when both OAuth credentials are configured.

Add these values to your ignored `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

Generate the secret with `openssl rand -base64 32`.
Create a Google OAuth web client in Google Cloud Console and add
`http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
For production, set `NEXTAUTH_URL`, the secret, and both Google credentials in
your hosting provider's environment settings, and add
`https://your-domain.example/api/auth/callback/google` to the Google OAuth client.
Keep all secrets out of source control. Email/password sign-in remains available
when Google OAuth credentials are not configured.

## ExerciseDB API

The exercise library proxies ExerciseDB through the server so the RapidAPI key
is never sent to the browser. Set `EXERCISEDB_API_KEY` in `.env.local` and
in your production environment. Create or rotate the RapidAPI key if the one
you shared in chat is no longer private.

The library and workout builder use ExerciseDB's body-part, target-muscle,
equipment, name-search, and individual-exercise endpoints. Workout exercises
are saved as snapshots of the selected ExerciseDB data, so existing workouts
remain readable if the provider later changes its catalog. After deploying
the updated schema, run `npx prisma db push` to add the nullable snapshot fields
while preserving existing local exercises and workouts.

Exercise demonstrations are served from `/api/exercise-image?id=<exerciseId>`.
This authenticated image proxy uses the server-side `EXERCISEDB_API_KEY`
and requests 180px media from ExerciseDB; do not place the RapidAPI key in
client-side code or a checked-in environment example.

Exercise lists request 10 results at a time by default, sorted by ID ascending,
starting at offset 0. The library lets you change page size, sort field/order,
and navigate with the API's `limit`, `sortMethod`, `sortOrder`, and `offset`
parameters. Both exercise browsing and workout creation initially select the
`assisted` equipment category when it is offered by ExerciseDB.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
