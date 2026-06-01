import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './env'

let client: SupabaseClient | null = null

export function getSupabaseClient() {
  if (client) return client
  const env = getSupabaseEnv()
  const anonKey = env.anonKey
  client = createClient(env.url, env.anonKey, {
    auth: {
      // Password recovery is handled manually: the email link lands with the
      // recovery token in the URL hash, which app.tsx reads to route the user
      // to the update-password page. Disable auto-detection so Supabase neither
      // strips the token from the URL nor silently signs the user in with it.
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    },
  })
  return client
}
