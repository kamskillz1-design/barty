# AGENTS.md

## Project Context

This is a React and Vite application using Supabase for authentication, database access, storage, and realtime features.

Treat this as user-owned application code. Keep changes focused on the requested task, preserve existing conventions, and avoid changing unrelated files.

Start with `README.md` and `package.json` to understand the project structure, available scripts, build process, and deployment workflow.

## Supabase Client

The frontend Supabase client is located at:

```text
src/api/supabaseClient.js
```

Use this exact import in frontend files:

```js
import { supabase } from '@/api/supabaseClient';
```

Do not use or add Base44 imports, Base44 SDK calls, or Base44 configuration.

```text
Do not use: @/api/base44Client
Do not use: base44.functions
Do not use: base44.entities
Do not use: base44.auth
```

## Supabase Patterns

Use Supabase authentication for user sessions:

```js
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
```

Use Supabase queries for database access:

```js
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

Use Supabase inserts, updates, and deletes for authenticated user actions:

```js
const { data, error } = await supabase
  .from('table_name')
  .insert({ column_name: 'value' });
```

Always handle Supabase `error` values. Do not assume database operations succeed.

## Environment Variables

Supabase environment variables are saved in Vercel Project Settings → Environment Variables, not committed to GitHub.

The client uses:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

The legacy fallback name may also be used:

```text
VITE_SUPABASE_ANON_KEY
```

Never expose a Supabase `service_role` key in frontend code. Never use a `service_role` key in a variable starting with `VITE_`.

## Security Rules

Use Supabase Row Level Security for all browser-accessible tables.

- Authenticated users may only read, create, update, or delete records they are authorized to access
- Use `auth.uid()` in Supabase RLS policies to restrict user-owned data
- Do not bypass RLS from frontend code
- Do not add privileged keys to React components
- Use server-side Vercel routes only for secret-dependent actions, such as payment webhooks, email-provider calls, admin actions, or third-party API secrets

## Key Files

- `src/`: React frontend source code
- `src/api/supabaseClient.js`: Supabase browser client
- `src/lib/AuthContext.jsx`: authentication and session state
- `src/components/`: reusable UI components
- `src/pages/`: route-level application pages
- `vite.config.js`: Vite configuration
- `package.json`: dependencies and scripts
- `vercel.json`: Vercel configuration, if present

## Working Notes

- GitHub commits deploy through Vercel
- Vercel injects `VITE_*` variables during the frontend build
- A new Vercel deployment is required after changing Vercel environment variables
- Use `npm run build` to check that the frontend compiles when a build workflow is available
- Keep imports consistent with `@/api/supabaseClient`
- Do not create frontend requests to endpoints that do not exist, such as `/api/submitFlag`
- Before finishing a change, check `package.json` for relevant lint, test, and build commands
