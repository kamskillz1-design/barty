import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function requireEnv(value, label) {
  if (!value) {
    throw new Error(`Missing ${label} environment variable.`);
  }

  return value;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function getServiceRoleClient() {
  return createClient(
    requireEnv(supabaseUrl, "SUPABASE_URL or VITE_SUPABASE_URL"),
    requireEnv(supabaseServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY")
  );
}

export function getRequestClient(accessToken) {
  return createClient(
    requireEnv(supabaseUrl, "SUPABASE_URL or VITE_SUPABASE_URL"),
    requireEnv(
      supabasePublishableKey,
      "SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or VITE_SUPABASE_ANON_KEY"
    ),
    accessToken
      ? {
          global: {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          },
        }
      : undefined
  );
}

export async function getRequestUser(req) {
  const authHeader = req.headers.get("authorization") || "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!accessToken) {
    return null;
  }

  const requestClient = getRequestClient(accessToken);
  const {
    data: { user },
    error,
  } = await requestClient.auth.getUser(accessToken);

  if (error) {
    throw error;
  }

  return user ?? null;
}
