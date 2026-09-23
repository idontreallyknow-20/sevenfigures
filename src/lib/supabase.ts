import { createClient } from '@supabase/supabase-js'

// Placeholder fallbacks keep `createClient` from throwing when env vars aren't
// present. They never connect: `hasSupabase` says whether real credentials exist,
// and forms check it so a missing database shows a clear message instead of a
// silent failure.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const NO_DB_MESSAGE = 'Saving is off in this demo: no database is connected.'

// Without credentials, answer every query instantly with an error instead of
// waiting on the placeholder host. It's a 400 because supabase-js retries 503s
// with backoff. Pages then fall back to seed data or empty states straight away.
const offlineFetch: typeof fetch = async () =>
  new Response(JSON.stringify({ message: NO_DB_MESSAGE }), { status: 400, headers: { 'content-type': 'application/json' } })

const options = hasSupabase ? undefined : { global: { fetch: offlineFetch } }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options)

export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  return createClient(supabaseUrl, serviceKey, options)
}
