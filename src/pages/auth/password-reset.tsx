import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useState } from 'react'
import { useSupabaseSession } from '../../hooks/use-supabase-session'
import { validatePasswordComplexity } from '../../lib/password'

interface PasswordResetPageProps {
  signInPath: string
  dashboardPath: string
  updatePasswordPath: string
  onNavigate: (path: string) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PasswordResetPage({ signInPath, onNavigate }: PasswordResetPageProps) {
  const { client } = useSupabaseSession()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleRequest() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('请输入有效邮箱地址')
      return
    }

    if (!client) {
      setErrorMessage('客户端未就绪，请刷新页面重试。')
      return
    }

    setIsBusy(true)
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    setIsBusy(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setStep('verify')
    setSuccessMessage('验证码已发送，请检查邮箱。')
  }

  async function handleVerify() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!otp.trim()) {
      setErrorMessage('请输入验证码')
      return
    }

    if (!password || !confirmPassword) {
      setErrorMessage('请输入新密码')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('两次输入的密码不一致')
      return
    }

    const passwordError = validatePasswordComplexity(password)
    if (passwordError) {
      setErrorMessage(passwordError)
      return
    }

    if (!client) {
      setErrorMessage('客户端未就绪，请刷新页面重试。')
      return
    }

    setIsBusy(true)
    const { error: verifyError } = await client.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })

    if (verifyError) {
      setIsBusy(false)
      setErrorMessage(verifyError.message)
      return
    }

    const { error: updateError } = await client.auth.updateUser({ password })
    setIsBusy(false)

    if (updateError) {
      setErrorMessage(updateError.message)
      return
    }

    // Sign out so the user logs in fresh with the new password
    await client.auth.signOut()
    setSuccessMessage('密码已更新，正在跳转到登录页…')
    setTimeout(() => onNavigate(signInPath), 1500)
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
        <h1 className="text-2xl font-semibold">重置密码</h1>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          isDisabled={step === 'verify'}
          onValueChange={setEmail}
        />
        {step === 'verify' && (
          <>
            <Input
              label="验证码"
              placeholder="输入邮箱验证码"
              type="text"
              value={otp}
              onValueChange={(v) => setOtp(v.trim())}
            />
            <Input
              label="新密码"
              placeholder="至少 9 位字符"
              type="password"
              value={password}
              onValueChange={setPassword}
            />
            <Input
              label="确认新密码"
              placeholder="再次输入新密码"
              type="password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
            />
          </>
        )}
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-500">{successMessage}</p> : null}
        {step === 'request' ? (
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleRequest}>
            发送验证码
          </Button>
        ) : (
          <>
            <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleVerify}>
              确认重置
            </Button>
            <Button radius="full" variant="flat" isLoading={isBusy} onPress={handleRequest}>
              重新发送验证码
            </Button>
          </>
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
