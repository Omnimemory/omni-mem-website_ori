import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useState } from 'react'
import { useSupabaseSession } from '../../hooks/use-supabase-session'

interface PasswordResetPageProps {
  signInPath: string
  dashboardPath: string
  updatePasswordPath: string
  onNavigate: (path: string) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PasswordResetPage({ signInPath, updatePasswordPath, onNavigate }: PasswordResetPageProps) {
  const { client } = useSupabaseSession()
  const [email, setEmail] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleRequest() {
    setErrorMessage(null)

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('请输入有效邮箱地址')
      return
    }

    if (!client) {
      setErrorMessage('客户端未就绪，请刷新页面重试。')
      return
    }

    setIsBusy(true)
    const redirectTo = `${window.location.origin}${updatePasswordPath}`
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo })
    setIsBusy(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
          <h1 className="text-2xl font-semibold">邮件已发送</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-muted">
            重置链接已发送至 <span className="font-medium text-ink">{email}</span>，请检查邮箱并点击链接完成密码重置。
          </p>
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
          onValueChange={setEmail}
        />
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        <Button
          className="bg-teal text-white hover:bg-seafoam"
          radius="full"
          isLoading={isBusy}
          onPress={handleRequest}
        >
          发送重置链接
        </Button>
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
