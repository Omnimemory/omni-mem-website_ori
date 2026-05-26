import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useSupabaseSession } from '../../hooks/use-supabase-session'
import { validatePasswordComplexity } from '../../lib/password'

interface UpdatePasswordPageProps {
  dashboardPath: string
  signInPath: string
  onNavigate: (path: string) => void
}

export function UpdatePasswordPage({ signInPath, onNavigate }: UpdatePasswordPageProps) {
  const { client } = useSupabaseSession()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Supabase sends a PASSWORD_RECOVERY event when the user lands via the reset link.
  // We wait for that event before allowing the form to submit.
  useEffect(() => {
    if (!client) return
    const { data: { subscription } } = client.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [client])

  async function handleUpdatePassword() {
    setErrorMessage(null)

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

    if (!client) {
      setErrorMessage('客户端未就绪，请刷新页面重试。')
      return
    }

    setIsBusy(true)
    const { error } = await client.auth.updateUser({ password })
    setIsBusy(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setDone(true)
    setTimeout(() => onNavigate(signInPath), 2000)
  }

  if (done) {
    return (
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
          <h1 className="text-2xl font-semibold">密码已更新</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-muted">密码更新成功，正在跳转到登录页…</p>
        </CardBody>
      </Card>
    )
  }

  if (!ready) {
    return (
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
          <h1 className="text-2xl font-semibold">更新密码</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-muted">链接已失效或未通过验证，请重新发起密码重置。</p>
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" onPress={() => onNavigate(signInPath)}>
            返回登录
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
        <h1 className="text-2xl font-semibold">更新密码</h1>
      </CardHeader>
      <CardBody className="space-y-4">
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
          value={repeatPassword}
          onValueChange={setRepeatPassword}
        />
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        <Button
          className="bg-teal text-white hover:bg-seafoam"
          radius="full"
          isLoading={isBusy}
          onPress={handleUpdatePassword}
        >
          更新密码
        </Button>
      </CardBody>
    </Card>
  )
}
