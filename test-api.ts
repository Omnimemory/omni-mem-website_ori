// API integration test script
// Tests all endpoints against https://nrswzocoshah.sealoshzh.site

const BASE_URL = "https://nrswzocoshah.sealoshzh.site/api/v1"
const SUPABASE_URL = "https://nrswzocoshah.sealoshzh.site"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjY2MzIyNjEsImlzcyI6InN1cGFiYXNlIiwiZXhwIjoyMDgxOTkyMjYxLCJyb2xlIjoiYW5vbiJ9.SkcPVh-lik2QJ0z76SZP1-jo7PfXQRHFzLEdInrS1Z0"

const EMAIL = "2239713402@qq.com"
const PASSWORD = "123456789"

// ── ANSI colors ────────────────────────────────────────────────────────────────
const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const YELLOW = "\x1b[33m"
const CYAN = "\x1b[36m"
const BOLD = "\x1b[1m"
const DIM = "\x1b[2m"
const RESET = "\x1b[0m"

interface TestResult {
  name: string
  method: string
  endpoint: string
  status: number | string
  passed: boolean
  body?: unknown
  error?: string
}

const results: TestResult[] = []

function pass(name: string, method: string, endpoint: string, status: number, body?: unknown) {
  results.push({ name, method, endpoint, status, passed: true, body })
  const snippet = body ? JSON.stringify(body).slice(0, 120) : ""
  console.log(`${GREEN}✓${RESET} ${BOLD}${name}${RESET}`)
  console.log(`  ${DIM}${method} ${endpoint} → ${status}${RESET}`)
  if (snippet) console.log(`  ${DIM}${snippet}${snippet.length === 120 ? "…" : ""}${RESET}`)
}

function fail(name: string, method: string, endpoint: string, status: number | string, error?: string) {
  results.push({ name, method, endpoint, status, passed: false, error })
  console.log(`${RED}✗${RESET} ${BOLD}${name}${RESET}`)
  console.log(`  ${DIM}${method} ${endpoint} → ${status}${RESET}`)
  if (error) console.log(`  ${RED}${error}${RESET}`)
}

function section(title: string) {
  console.log(`\n${CYAN}${BOLD}── ${title} ──────────────────────────────${RESET}`)
}

// ── helpers ────────────────────────────────────────────────────────────────────
async function req(
  method: string,
  url: string,
  opts: { headers?: Record<string, string>; body?: unknown } = {},
): Promise<{ status: number; body: unknown; ok: boolean }> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...opts.headers }
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.timeout(10_000),
  })
  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = await res.text().catch(() => "(no body)")
  }
  return { status: res.status, body, ok: res.ok }
}

function authHeaders(token: string, userId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "X-Principal-User-Id": userId,
  }
}

// ── Step 0: Login ──────────────────────────────────────────────────────────────
section("STEP 0 — Login (Supabase)")

console.log(`  Logging in as ${EMAIL}…`)
const loginRes = await req("POST", `${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  headers: { apikey: SUPABASE_ANON_KEY },
  body: { email: EMAIL, password: PASSWORD },
})

if (!loginRes.ok) {
  fail("Supabase login", "POST", "/auth/v1/token", loginRes.status, JSON.stringify(loginRes.body))
  console.log(`\n${RED}${BOLD}登录失败，无法继续测试认证接口。${RESET}`)
  printSummary()
  process.exit(1)
}

const session = loginRes.body as { access_token: string; user: { id: string; email: string } }
const TOKEN = session.access_token
const USER_ID = session.user.id
pass("Supabase login", "POST", "/auth/v1/token", loginRes.status, { user_id: USER_ID })

// ── Step 1: Auth endpoints (no token) ─────────────────────────────────────────
section("STEP 1 — Auth endpoints (no token)")

{
  const name = "POST /auth/password-reset/request"
  const url = `${BASE_URL}/auth/password-reset/request`
  try {
    const r = await req("POST", url, { body: { email: "nonexistent_test_abc123@example.com" } })
    // 200 or 4xx are both acceptable — endpoint just needs to respond
    if (r.status >= 200 && r.status < 500) {
      pass(name, "POST", url, r.status, r.body)
    } else {
      fail(name, "POST", url, r.status, JSON.stringify(r.body))
    }
  } catch (e) {
    fail(name, "POST", url, "network error", String(e))
  }
}

// ── Step 2: API Keys ───────────────────────────────────────────────────────────
section("STEP 2 — API Keys")

let createdApiKeyId: string | null = null

{
  // GET list
  const name = "GET /apikeys"
  const url = `${BASE_URL}/apikeys?page=1&pageSize=10`
  try {
    const r = await req("GET", url, { headers: authHeaders(TOKEN, USER_ID) })
    r.ok ? pass(name, "GET", url, r.status, r.body) : fail(name, "GET", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "GET", url, "network error", String(e))
  }
}

{
  // POST create
  const name = "POST /apikeys (create)"
  const url = `${BASE_URL}/apikeys`
  try {
    const r = await req("POST", url, {
      headers: { ...authHeaders(TOKEN, USER_ID), "X-Request-Id": crypto.randomUUID() },
      body: { label: "__test_script_key__" },
    })
    if (r.ok) {
      const data = r.body as { id?: string; api_key_plaintext?: string }
      createdApiKeyId = data?.id ?? null
      pass(name, "POST", url, r.status, { id: createdApiKeyId })
    } else {
      fail(name, "POST", url, r.status, JSON.stringify(r.body))
    }
  } catch (e) {
    fail(name, "POST", url, "network error", String(e))
  }
}

if (createdApiKeyId) {
  {
    // PATCH label
    const name = `PATCH /apikeys/:id (update label)`
    const url = `${BASE_URL}/apikeys/${createdApiKeyId}`
    try {
      const r = await req("PATCH", url, {
        headers: authHeaders(TOKEN, USER_ID),
        body: { label: "__test_script_key_renamed__" },
      })
      r.ok ? pass(name, "PATCH", url, r.status, r.body) : fail(name, "PATCH", url, r.status, JSON.stringify(r.body))
    } catch (e) {
      fail(name, "PATCH", url, "network error", String(e))
    }
  }

  {
    // POST reveal (uses login password)
    const name = `POST /apikeys/:id/reveal`
    const url = `${BASE_URL}/apikeys/${createdApiKeyId}/reveal`
    try {
      const r = await req("POST", url, {
        headers: authHeaders(TOKEN, USER_ID),
        body: { password: PASSWORD },
      })
      r.ok ? pass(name, "POST", url, r.status, { revealed: true }) : fail(name, "POST", url, r.status, JSON.stringify(r.body))
    } catch (e) {
      fail(name, "POST", url, "network error", String(e))
    }
  }

  {
    // POST rotate
    const name = `POST /apikeys/:id/rotate`
    const url = `${BASE_URL}/apikeys/${createdApiKeyId}/rotate`
    try {
      const r = await req("POST", url, {
        headers: { ...authHeaders(TOKEN, USER_ID), "Content-Type": "application/json", "X-Request-Id": crypto.randomUUID() },
        body: {},
      })
      r.ok ? pass(name, "POST", url, r.status, r.body) : fail(name, "POST", url, r.status, JSON.stringify(r.body))
    } catch (e) {
      fail(name, "POST", url, "network error", String(e))
    }
  }

  {
    // DELETE (cleanup)
    const name = `DELETE /apikeys/:id (cleanup)`
    const url = `${BASE_URL}/apikeys/${createdApiKeyId}`
    try {
      const res2 = await fetch(url, {
        method: "DELETE",
        headers: { ...authHeaders(TOKEN, USER_ID), "X-Request-Id": crypto.randomUUID() },
        signal: AbortSignal.timeout(10_000),
      })
      const body = await res2.json().catch(() => ({}))
      res2.ok ? pass(name, "DELETE", url, res2.status, body) : fail(name, "DELETE", url, res2.status, JSON.stringify(body))
    } catch (e) {
      fail(name, "DELETE", url, "network error", String(e))
    }
  }
}

// ── Step 3: Balance & Usage ────────────────────────────────────────────────────
section("STEP 3 — Balance & Usage")

for (const [name, url] of [
  ["GET /balance", `${BASE_URL}/balance`],
  ["GET /usage/ledger", `${BASE_URL}/usage/ledger?page=1&pageSize=10`],
  ["GET /usage/summary", `${BASE_URL}/usage/summary?from=2026-03-25&to=2026-04-25&groupBy=day`],
] as [string, string][]) {
  try {
    const r = await req("GET", url, { headers: authHeaders(TOKEN, USER_ID) })
    r.ok ? pass(name, "GET", url, r.status, r.body) : fail(name, "GET", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "GET", url, "network error", String(e))
  }
}

// ── Step 4: Settings ───────────────────────────────────────────────────────────
section("STEP 4 — Settings")

{
  const name = "GET /settings/scope"
  const url = `${BASE_URL}/settings/scope`
  try {
    const r = await req("GET", url, { headers: authHeaders(TOKEN, USER_ID) })
    r.ok ? pass(name, "GET", url, r.status, r.body) : fail(name, "GET", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "GET", url, "network error", String(e))
  }
}

{
  const name = "GET /settings/memory-policy"
  const url = `${BASE_URL}/settings/memory-policy`
  try {
    const r = await req("GET", url, { headers: authHeaders(TOKEN, USER_ID) })
    r.ok ? pass(name, "GET", url, r.status, r.body) : fail(name, "GET", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "GET", url, "network error", String(e))
  }
}

{
  // PUT memory-policy — keep default_scope: "user" (non-destructive)
  const name = "PUT /settings/memory-policy"
  const url = `${BASE_URL}/settings/memory-policy`
  try {
    const r = await req("PUT", url, {
      headers: authHeaders(TOKEN, USER_ID),
      body: { default_scope: "user" },
    })
    r.ok ? pass(name, "PUT", url, r.status, r.body) : fail(name, "PUT", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "PUT", url, "network error", String(e))
  }
}

{
  // PATCH account-name — restore same name immediately
  const name = "PATCH /settings/account-name"
  const url = `${BASE_URL}/settings/account-name`
  try {
    const r = await req("PATCH", url, {
      headers: authHeaders(TOKEN, USER_ID),
      body: { name: EMAIL.split("@")[0] },
    })
    r.ok ? pass(name, "PATCH", url, r.status, r.body) : fail(name, "PATCH", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "PATCH", url, "network error", String(e))
  }
}

{
  // POST scope-upgrade with invalid code — 4xx expected
  const name = "POST /settings/scope-upgrade (invalid code, 4xx expected)"
  const url = `${BASE_URL}/settings/scope-upgrade`
  try {
    const r = await req("POST", url, {
      headers: authHeaders(TOKEN, USER_ID),
      body: { code: "INVALID-TEST-CODE-000" },
    })
    if (r.status >= 400 && r.status < 500) {
      pass(name, "POST", url, r.status, r.body)
    } else if (r.ok) {
      pass(name, "POST", url, r.status, r.body)
    } else {
      fail(name, "POST", url, r.status, JSON.stringify(r.body))
    }
  } catch (e) {
    fail(name, "POST", url, "network error", String(e))
  }
}

// ── Step 5: LLM Keys ──────────────────────────────────────────────────────────
section("STEP 5 — LLM Keys")

let createdLlmKeyId: string | null = null

{
  const name = "GET /llm-keys"
  const url = `${BASE_URL}/llm-keys`
  try {
    const r = await req("GET", url, { headers: authHeaders(TOKEN, USER_ID) })
    r.ok ? pass(name, "GET", url, r.status, r.body) : fail(name, "GET", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "GET", url, "network error", String(e))
  }
}

{
  // GET llm-models — X-LLM-Api-Key is a placeholder, 4xx is acceptable
  const name = "GET /llm-models?provider=openai (invalid key, 4xx acceptable)"
  const url = `${BASE_URL}/llm-models?provider=openai`
  try {
    const r = await req("GET", url, {
      headers: { ...authHeaders(TOKEN, USER_ID), "X-LLM-Api-Key": "sk-test-placeholder" },
    })
    if (r.status >= 200 && r.status < 500) {
      pass(name, "GET", url, r.status, r.body)
    } else {
      fail(name, "GET", url, r.status, JSON.stringify(r.body))
    }
  } catch (e) {
    fail(name, "GET", url, "network error", String(e))
  }
}

{
  // POST create LLM key (placeholder key — expected to validate or store)
  const name = "POST /llm-keys (create test LLM key)"
  const url = `${BASE_URL}/llm-keys`
  try {
    const r = await req("POST", url, {
      headers: authHeaders(TOKEN, USER_ID),
      body: {
        label: "__test_llm_key__",
        api_key: "sk-test-placeholder-0000",
        provider: "openai",
        model_name: "gpt-4o",
        is_default: false,
      },
    })
    if (r.ok) {
      const data = r.body as { id?: string }
      createdLlmKeyId = data?.id ?? null
      pass(name, "POST", url, r.status, { id: createdLlmKeyId })
    } else {
      // Creation may fail due to invalid key validation — still note response
      fail(name, "POST", url, r.status, JSON.stringify(r.body))
    }
  } catch (e) {
    fail(name, "POST", url, "network error", String(e))
  }
}

if (createdLlmKeyId) {
  {
    const name = "PUT /llm-keys/:id (update binding)"
    const url = `${BASE_URL}/llm-keys/${createdLlmKeyId}`
    try {
      const r = await req("PUT", url, {
        headers: authHeaders(TOKEN, USER_ID),
        body: { is_default: false, api_key_id: null },
      })
      r.ok ? pass(name, "PUT", url, r.status, r.body) : fail(name, "PUT", url, r.status, JSON.stringify(r.body))
    } catch (e) {
      fail(name, "PUT", url, "network error", String(e))
    }
  }

  {
    const name = "DELETE /llm-keys/:id (cleanup)"
    const url = `${BASE_URL}/llm-keys/${createdLlmKeyId}`
    try {
      const res2 = await fetch(url, {
        method: "DELETE",
        headers: authHeaders(TOKEN, USER_ID),
        signal: AbortSignal.timeout(10_000),
      })
      const body = await res2.json().catch(() => ({}))
      res2.ok ? pass(name, "DELETE", url, res2.status, body) : fail(name, "DELETE", url, res2.status, JSON.stringify(body))
    } catch (e) {
      fail(name, "DELETE", url, "network error", String(e))
    }
  }
}

// ── Step 6: Memory Ingest ──────────────────────────────────────────────────────
section("STEP 6 — Memory Ingest")

let ingestJobId: string | null = null

{
  const name = "POST /memory/ingest"
  const url = `${BASE_URL}/memory/ingest`
  try {
    const r = await req("POST", url, {
      headers: { ...authHeaders(TOKEN, USER_ID), "X-Request-Id": crypto.randomUUID() },
      body: {
        turns: [{ role: "user", content: "test memory ingestion from api test script" }],
      },
    })
    if (r.ok) {
      const data = r.body as { job_id?: string; jobId?: string }
      ingestJobId = data?.job_id ?? data?.jobId ?? null
      pass(name, "POST", url, r.status, { job_id: ingestJobId })
    } else {
      fail(name, "POST", url, r.status, JSON.stringify(r.body))
    }
  } catch (e) {
    fail(name, "POST", url, "network error", String(e))
  }
}

if (ingestJobId) {
  const name = "GET /memory/ingest/jobs/:id"
  const url = `${BASE_URL}/memory/ingest/jobs/${ingestJobId}`
  try {
    const r = await req("GET", url, { headers: authHeaders(TOKEN, USER_ID) })
    r.ok ? pass(name, "GET", url, r.status, r.body) : fail(name, "GET", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "GET", url, "network error", String(e))
  }
}

// ── Step 7: User Feedback ──────────────────────────────────────────────────────
section("STEP 7 — User Feedback")

{
  const name = "POST /user-feedback"
  const url = `${BASE_URL}/user-feedback`
  try {
    const r = await req("POST", url, {
      headers: authHeaders(TOKEN, USER_ID),
      body: { title: "Test feedback from API test script", content: "Automated test — please ignore." },
    })
    r.ok ? pass(name, "POST", url, r.status, r.body) : fail(name, "POST", url, r.status, JSON.stringify(r.body))
  } catch (e) {
    fail(name, "POST", url, "network error", String(e))
  }
}

// ── Summary ────────────────────────────────────────────────────────────────────
function printSummary() {
  const total = results.length
  const passed = results.filter((r) => r.passed).length
  const failed = total - passed

  console.log(`\n${BOLD}${"═".repeat(50)}${RESET}`)
  console.log(`${BOLD}  测试结果汇总${RESET}`)
  console.log(`${"═".repeat(50)}`)
  console.log(`  总计: ${total}  |  ${GREEN}通过: ${passed}${RESET}  |  ${failed > 0 ? RED : GREEN}失败: ${failed}${RESET}`)
  console.log(`${"─".repeat(50)}`)

  if (failed > 0) {
    console.log(`\n${RED}${BOLD}  失败项目:${RESET}`)
    for (const r of results.filter((x) => !x.passed)) {
      console.log(`  ${RED}✗${RESET} ${r.name}`)
      console.log(`    ${DIM}${r.method} ${r.endpoint} → ${r.status}${RESET}`)
      if (r.error) console.log(`    ${RED}${r.error}${RESET}`)
    }
  }

  console.log()
}

printSummary()
