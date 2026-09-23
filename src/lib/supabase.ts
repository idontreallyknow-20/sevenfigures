import { createClient } from '@supabase/supabase-js'

// Placeholder fallbacks keep `createClient` from throwing at build time when
// env vars aren't present. They will never connect — `hasSupabase` reflects
// whether real credentials are configured, and we warn loudly when they're not
// so a misconfiguration is visible instead of silently returning no data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (!hasSupabase) {
  console.warn(
    '[sevenfigures] Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in your env. The app will load but show no data.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[sevenfigures] SUPABASE_SERVICE_ROLE_KEY is not set — server-side writes ' +
        '(e.g. the daily cron snapshot) will fail.'
    )
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  return createClient(supabaseUrl, serviceKey)
}
