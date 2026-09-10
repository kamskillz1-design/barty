# Barty

This repository contains the React + Vite frontend for Barty, deployed on
Vercel and backed by Supabase.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Create a `.env.local` file when working locally.

## Run Locally

Run the frontend locally from the project root:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Local Environment

Create or update `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

If you use the Vercel moderation API routes locally or in production, also set:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Publish Your Changes

Deploy the app through Vercel after your Git changes are pushed.

## Docs & Support

Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)

Vercel docs: [https://vercel.com/docs](https://vercel.com/docs)
