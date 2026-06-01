import { getApiEnv } from './env'
import { getSupabaseClient } from './supabase'

// Prevents repeated sign-outs while one is already in flight, which would
// otherwise loop when several API calls return 401 at the same time.
let signingOut = false

/**
 * Clears the Supabase session (and its persisted token) once. Called whenever
 * the backend rejects a token with 401. Signing out flips the session to null,
 * which the protected-route guard in app.tsx uses to redirect to sign-in.
 */
export async function handleUnauthorized() {
  if (signingOut) return
  signingOut = true
  try {
    await getSupabaseClient().auth.signOut()
  } catch {
    // Ignore: token is already gone or the client is unavailable.
  } finally {
    signingOut = false
  }
}

let guardInstalled = false

/**
 * Wraps window.fetch once so that any 401 from the backend API automatically
 * triggers a sign-out. Scoped to the API base URL so Supabase's own auth
 * requests (refresh, sign-out) are never intercepted, avoiding recursion.
 */
export function installUnauthorizedGuard() {
  if (guardInstalled || typeof window === 'undefined') return
  guardInstalled = true

  let apiBaseUrl: string
  try {
    apiBaseUrl = getApiEnv().apiBaseUrl
  } catch {
    return
  }

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init)
    try {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url
      if (response.status === 401 && url.startsWith(apiBaseUrl)) {
        void handleUnauthorized()
      }
    } catch {
      // Never let guard bookkeeping break the original request.
    }
    return response
  }
}
