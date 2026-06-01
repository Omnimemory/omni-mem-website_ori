import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useEffect, useMemo, useState } from 'react'
import { getApiEnv } from '../../lib/env'
import { validatePasswordComplexity } from '../../lib/password'

interface PasswordResetPageProps {
  signInPath: string
  dashboardPath: string
  updatePasswordPath: string
  onNavigate: (path: string) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Default wait time when the server reports a rate limit without a parseable
// number of seconds.
const DEFAULT_RATE_LIMIT_SECONDS = 60

// Cooldown applied after a code is successfully sent, to throttle resends
// before the user hits the server-side rate limit.
const RESEND_COOLDOWN_SECONDS = 60

// Extract the wait time (in seconds) from messages like
// "you can only request this after 56 seconds.".
function extractWaitSeconds(text?: string | null): number | null {
  if (!text) return null
  const match = text.match(/(\d+)\s*second/i)
  return match ? Number(match[1]) : null
}

type Step = 'request' | 'verify' | 'set-password'

export function PasswordResetPage({ signInPath, onNavigate }: PasswordResetPageProps) {
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Tick down the resend cooldown once per second.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  function clearMessages() {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  async function handleRequest() {
    clearMessages()
    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('请输入有效邮箱地址')
      return
    }
    setIsBusy(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        message?: string
        msg?: string
        error_code?: string
      }
      if (!response.ok) {
        const serverMessage = data?.msg ?? data?.message
        // Rate limited: tell the user exactly how long to wait and start a
        // countdown that disables the resend button.
        if (response.status === 429 || data?.error_code === 'over_email_send_rate_limit') {
          const waitSeconds = extractWaitSeconds(serverMessage) ?? DEFAULT_RATE_LIMIT_SECONDS
          setCooldown(waitSeconds)
          setErrorMessage(`发送过于频繁，请在 ${waitSeconds} 秒后重试。`)
          return
        }
        throw new Error(serverMessage ?? '发送验证码失败')
      }
      setOtp('')
      setStep('verify')
      setSuccessMessage('验证码已发送，请检查邮箱。')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '发送验证码失败')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleVerify() {
    clearMessages()
    if (!otp.trim()) {
      setErrorMessage('请输入验证码')
      return
    }
    setIsBusy(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/password-reset/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        message?: string
        access_token?: string
      }
      console.log(data)
      // if (!response.ok) throw new Error(data?.message ?? '验证码校验失败')
      if (!data.access_token) throw new Error('验证码校验失败')
      setResetToken(data.access_token)
      setStep('set-password')
      setSuccessMessage('验证成功，请设置新密码。')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setIsBusy(false)
    }
  }

  async function handleUpdatePassword() {
    clearMessages()
    if (!password || !repeatPassword) {
      setErrorMessage('请输入新密码。')
      return
    }
    if (password !== repeatPassword) {
      setErrorMessage('两次输入的密码不一致。')
      return
    }
    const passwordError = validatePasswordComplexity(password)
    if (passwordError) {
      setErrorMessage(passwordError)
      return
    }
    setIsBusy(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: resetToken, password }),
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) throw new Error(data?.message ?? '密码更新失败')
      setSuccessMessage('密码已更新，正在跳转登录页…')
      setTimeout(() => onNavigate(signInPath), 1500)
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setIsBusy(false)
    }
  }

  const stepLabels: Record<Step, string> = {
    'request': '第 1 步，共 3 步',
    'verify': '第 2 步，共 3 步',
    'set-password': '第 3 步，共 3 步',
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          {stepLabels[step]}
        </p>
        <h1 className="text-2xl font-semibold">重置密码</h1>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Step 1 & 2: email always visible */}
        <Input
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onValueChange={step === 'request' ? setEmail : undefined}
          isReadOnly={step !== 'request'}
        />

        {/* Step 2: OTP input */}
        {step === 'verify' && (
          <Input
            label="验证码"
            placeholder="输入邮箱验证码"
            type="text"
            value={otp}
            onValueChange={(v) => setOtp(v.trim())}
            autoFocus
          />
        )}

        {/* Step 3: new password inputs */}
        {step === 'set-password' && (
          <>
            <Input
              label="新密码"
              placeholder="至少 9 位"
              type="password"
              value={password}
              onValueChange={setPassword}
              autoFocus
            />
            <Input
              label="确认新密码"
              placeholder="再次输入新密码"
              type="password"
              value={repeatPassword}
              onValueChange={setRepeatPassword}
            />
          </>
        )}

        {errorMessage && <p className="text-sm text-danger-500">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-emerald-500">{successMessage}</p>}

        {step === 'request' && (
          <Button
            className="bg-teal text-white hover:bg-seafoam"
            radius="full"
            isLoading={isBusy}
            isDisabled={cooldown > 0}
            onPress={handleRequest}
          >
            {cooldown > 0 ? `${cooldown} 秒后可重试` : '发送验证码'}
          </Button>
        )}
        {step === 'verify' && (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-teal text-white hover:bg-seafoam"
              radius="full"
              isLoading={isBusy}
              onPress={handleVerify}
            >
              验证
            </Button>
            <Button
              variant="flat"
              radius="full"
              isLoading={isBusy}
              isDisabled={isBusy || cooldown > 0}
              onPress={handleRequest}
            >
              {cooldown > 0 ? `${cooldown} 秒后重试` : '重新发送'}
            </Button>
          </div>
        )}
        {step === 'set-password' && (
          <Button
            className="bg-teal text-white hover:bg-seafoam"
            radius="full"
            isLoading={isBusy}
            onPress={handleUpdatePassword}
          >
            更新密码
          </Button>
        )}

        <button
          className="text-sm font-medium text-ink/70 hover:text-teal transition-colors"
          onClick={() => onNavigate(signInPath)}
        >
          返回登录
        </button>
      </CardBody>
    </Card>
  )
}
