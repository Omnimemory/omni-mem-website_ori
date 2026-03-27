import { ArrowRight, Bot, CheckCircle2, DatabaseZap, ShieldCheck, Workflow } from 'lucide-react'

interface OpenClawMemoryPluginPageProps {
  locale: 'en' | 'zh'
  onNavigate: (path: string) => void
}

export function OpenClawMemoryPluginPage({ locale, onNavigate }: OpenClawMemoryPluginPageProps) {
  const content = locale === 'en' ? contentEN : contentZH
  const docsPath = '/docs/guides/openclaw-memory-plugin'

  return (
    <div style={{ backgroundColor: 'rgb(var(--ivory))', color: 'rgb(var(--ink))' }}>
      <section className="relative overflow-hidden" style={{ backgroundColor: 'rgb(var(--deep-blue))' }}>
        <div
          className="absolute inset-0 opacity-95"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(61, 166, 166, 0.34), transparent 38%), radial-gradient(circle at 80% 20%, rgba(0, 146, 184, 0.28), transparent 32%)',
          }}
        />

        <div className="container-v2 relative grid gap-10 py-24 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:gap-12 lg:items-center lg:py-32">
          <div className="space-y-7">
            <p className="module-eyebrow" style={{ color: 'rgb(var(--teal))' }}>{content.eyebrow}</p>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-[clamp(2.65rem,5.2vw,4.7rem)] leading-[0.94] tracking-[-0.04em] lg:whitespace-nowrap" style={{ color: 'rgb(var(--ivory))' }}>
                {content.title}
              </h1>
              <p
                className="max-w-2xl text-base leading-8 text-white sm:text-lg"
                style={{ textShadow: '0 8px 28px rgba(0, 0, 0, 0.22)' }}
              >
                {content.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button type="button" className="btn-primary" onClick={() => onNavigate(docsPath)}>
                <span className="inline-flex items-center gap-2">
                  {content.primaryCta}
                  <ArrowRight size={16} />
                </span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigate('/dashboard')}
                style={{ color: 'rgb(var(--ivory))', borderColor: 'rgba(255, 255, 255, 0.24)' }}
              >
                {content.secondaryCta}
              </button>
            </div>
          </div>

          <div
            className="rounded-[32px] border p-7 shadow-2xl lg:ml-4"
            style={{
              backgroundColor: 'rgba(6, 16, 42, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.16)',
              boxShadow: '0 28px 80px rgba(0, 0, 0, 0.26)',
            }}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{content.summaryTitle}</p>
                <h2 className="mt-3 text-3xl leading-none tracking-[-0.03em]" style={{ color: 'rgb(var(--ivory))' }}>
                  OpenClaw x OmniMemory
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(61, 166, 166, 0.16)', color: 'rgb(var(--ivory))' }}>
                <Bot size={28} />
              </div>
            </div>
            <div className="space-y-4">
              {content.summaryPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border p-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.14)' }}
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-teal-300" />
                  <p className="text-sm leading-7 text-white/95">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-v2">
          <p className="module-eyebrow">{content.featuresEyebrow}</p>
          <h2 className="module-title">{content.featuresTitle}</h2>
          <p className="module-subtitle">{content.featuresDescription}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {content.features.map((feature) => (
              <div key={feature.title} className="rounded-[28px] border bg-white p-7" style={{ borderColor: 'rgba(var(--ink), 0.08)', boxShadow: '0 14px 40px rgba(12, 24, 61, 0.06)' }}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(var(--teal), 0.08)', color: 'rgb(var(--teal))' }}>
                  {renderFeatureIcon(feature.icon)}
                </div>
                <h3 className="text-[1.5rem] leading-tight text-[rgb(var(--deep-blue))]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[rgb(var(--ink)/0.72)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24" style={{ backgroundColor: 'rgb(var(--ivory-dark))' }}>
        <div className="container-v2">
          <p className="module-eyebrow">{content.workflowEyebrow}</p>
          <h2 className="module-title">{content.workflowTitle}</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {content.workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-[28px] border bg-white p-7" style={{ borderColor: 'rgba(var(--ink), 0.08)', boxShadow: '0 12px 30px rgba(12, 24, 61, 0.05)' }}>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(var(--teal), 0.1)', color: 'rgb(var(--teal))' }}>
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--ink-muted))]">{content.workflowStepLabel}</span>
                </div>
                <h3 className="text-[1.45rem] leading-tight text-[rgb(var(--deep-blue))]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[rgb(var(--ink)/0.72)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-v2 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="space-y-5">
            <p className="module-eyebrow">{content.useCasesEyebrow}</p>
            <h2 className="module-title">{content.useCasesTitle}</h2>
            <p className="module-subtitle">{content.useCasesDescription}</p>
          </div>
          <div className="grid gap-5">
            {content.useCases.map((useCase) => (
              <div key={useCase.title} className="rounded-[28px] border p-7" style={{ borderColor: 'rgba(var(--ink), 0.08)', background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(252, 251, 249, 1) 100%)' }}>
                <h3 className="text-[1.45rem] leading-tight text-[rgb(var(--deep-blue))]">{useCase.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[rgb(var(--ink)/0.72)]">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-v2">
          <div className="rounded-[36px] px-8 py-10 sm:px-12 sm:py-12" style={{ background: 'linear-gradient(135deg, rgba(12, 24, 61, 1) 0%, rgba(0, 146, 184, 0.92) 100%)', color: 'rgb(var(--ivory))' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{content.finalCtaEyebrow}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <h2 className="text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.95] tracking-[-0.03em]" style={{ color: 'rgb(var(--ivory))' }}>
                  {content.finalCtaTitle}
                </h2>
              </div>
              <div className="flex flex-wrap gap-4 lg:justify-end">
                <button type="button" className="btn-primary" onClick={() => onNavigate('/dashboard')}>{content.finalPrimaryCta}</button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onNavigate(docsPath)}
                  style={{ color: 'rgb(var(--ivory))', borderColor: 'rgba(255, 255, 255, 0.24)' }}
                >
                  {content.finalSecondaryCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function renderFeatureIcon(icon: FeatureIconKey) {
  switch (icon) {
    case 'database': return <DatabaseZap size={22} />
    case 'shield': return <ShieldCheck size={22} />
    case 'workflow': return <Workflow size={22} />
    case 'agent': return <Bot size={22} />
  }
}

const contentEN: OpenClawPageContent = {
  eyebrow: 'Solution / Plugin',
  title: 'OpenClaw Memory Plugin',
  description: 'Connect OpenClaw agents to OmniMemory so they keep user context across sessions, recall the right memory before acting, and stay aligned with memory policy.',
  primaryCta: 'Read the docs',
  secondaryCta: 'Open dashboard',
  summaryTitle: 'What this solution adds',
  summaryPoints: [
    'Persist memory from OpenClaw runs and stitch it back to the right user, session, or workflow.',
    'Pull the most relevant memories before tool calls, planning steps, or response generation.',
    'Keep operators in control with dashboard visibility, API key management, and policy-aware memory scope.',
  ],
  featuresEyebrow: 'Capabilities',
  featuresTitle: 'Operational memory surfaces for OpenClaw',
  featuresDescription: 'The page focuses on the core surfaces a production plugin needs: clean memory capture, predictable recall, and operating visibility.',
  features: [
    { icon: 'database', title: 'Session-to-user stitching', description: 'Store events, turns, and tool traces against stable user or session identifiers so memory survives beyond a single OpenClaw run.' },
    { icon: 'workflow', title: 'Recall before action', description: 'Retrieve relevant memory before planning, selecting tools, or composing the next reply so agents act with the right context.' },
    { icon: 'shield', title: 'Policy-aware scope', description: 'Apply memory policy boundaries at retrieval time so agent memory can stay separated by user, workspace, or operational rule.' },
    { icon: 'agent', title: 'Operator visibility', description: 'Route plugin traffic through the same dashboard and API layer your team already uses for keys, usage, and memory settings.' },
  ],
  workflowEyebrow: 'Flow',
  workflowTitle: 'A simple runtime loop: capture, enrich, recall',
  workflowStepLabel: 'Step',
  workflowSteps: [
    { title: 'Capture OpenClaw runtime events', description: 'Send user messages, agent replies, tool calls, and workflow outcomes into the memory layer with stable identifiers.' },
    { title: 'Enrich memory in OmniMemory', description: 'Classify and organize the captured context so later lookups can target people, tasks, timelines, and recurring facts.' },
    { title: 'Recall before the next decision', description: 'Fetch policy-scoped memory at the next turn so the plugin returns useful context with less glue logic.' },
  ],
  useCasesEyebrow: 'Use Cases',
  useCasesTitle: 'Where the plugin fits best',
  useCasesDescription: 'The strongest use cases are the ones where the agent should feel continuous across time, not stateless from request to request.',
  useCases: [
    { title: 'Companion and assistant agents', description: 'Carry personal preferences, prior tasks, and long-running goals forward so interactions feel cumulative instead of forgetful.' },
    { title: 'Support and success workflows', description: 'Bring previous incidents, account context, and action history back into the next support turn without manual lookup.' },
    { title: 'Operational copilots', description: 'Attach memory to ongoing projects, tool traces, and execution outcomes so OpenClaw can reason over work already in motion.' },
  ],
  finalCtaEyebrow: 'Next Step',
  finalCtaTitle: 'Make OpenClaw agents remember what matters',
  finalPrimaryCta: 'Go to dashboard',
  finalSecondaryCta: 'View documentation',
}

const contentZH: OpenClawPageContent = {
  eyebrow: '解决方案 / 插件',
  title: 'OpenClaw 记忆插件',
  description: '把 OpenClaw Agent 接到 OmniMemory 上，让它能跨会话保留用户上下文，在执行动作前召回正确记忆，并且始终受记忆策略约束。',
  primaryCta: '查看文档',
  secondaryCta: '打开控制台',
  summaryTitle: '这个方案解决什么',
  summaryPoints: [
    '把 OpenClaw 运行过程中的对话、事件和工具调用沉淀成长期记忆，并绑定到正确的用户，跨设备支持记忆联动。',
    '在工具调用、规划决策或回复生成前，先召回最相关的记忆，减少临时拼 Prompt 的做法。',
    '让记忆写入、召回和范围控制都走统一插件链路，减少额外接线成本，也方便后续持续维护。',
  ],
  featuresEyebrow: '核心能力',
  featuresTitle: '面向 OpenClaw 的可运营记忆能力',
  featuresDescription: '这个子页面聚焦插件真正需要的几个面：怎么写入记忆、怎么稳定召回、怎么让系统侧可观测可治理。',
  features: [
    { icon: 'database', title: '会话到用户的记忆绑定', description: '把事件流、对话轮次和工具轨迹绑定到稳定的用户或会话标识上，让记忆不再只活在一次 OpenClaw 运行里。' },
    { icon: 'workflow', title: '行动前召回', description: '在规划、选工具或生成回复之前先做召回，让 Agent 带着上下文行动。' },
    { icon: 'shield', title: '策略感知的记忆范围', description: '在召回阶段应用记忆策略边界，按用户、工作空间或业务规则隔离上下文，避免记忆串线。' },
    { icon: 'agent', title: '运营与控制台可见', description: '插件流量继续走已有的 Dashboard 和 API 层，方便统一查看密钥、用量、策略和记忆配置。' },
  ],
  workflowEyebrow: '接入流程',
  workflowTitle: '最小闭环很简单：采集、增强、召回',
  workflowStepLabel: '步骤',
  workflowSteps: [
    { title: '采集 OpenClaw 运行事件', description: '把用户输入、Agent 输出、工具调用和执行结果按稳定标识写进记忆层，形成连续上下文。' },
    { title: '在 OmniMemory 中做增强', description: '对采集到的上下文做组织和分类，让后续检索能围绕人物、任务、时间线和事实稳定工作。' },
    { title: '下一个决策前做召回', description: '在下一轮行动前按策略召回所需记忆，让插件返回的是可用上下文而不是额外提示词。' },
  ],
  useCasesEyebrow: '适用场景',
  useCasesTitle: '最适合需要连续感的 Agent',
  useCasesDescription: '只要你的 Agent 不应该每次请求都像失忆一样重新开始，这个插件页就有价值。',
  useCases: [
    { title: '陪伴型与助理型 Agent', description: '持续记住偏好、历史任务和长期目标，让交互更像连续关系，而不是一次性问答。' },
    { title: '客服与客户成功流程', description: '把历史工单、账户上下文和处理动作带回下一轮会话，不再依赖人工翻记录。' },
    { title: '业务执行 Copilot', description: '把项目进展、工具轨迹和执行结果变成可召回记忆，让 OpenClaw 能基于正在推进的工作继续推理。' },
  ],
  finalCtaEyebrow: '下一步',
  finalCtaTitle: '让 OpenClaw Agent 真的记住该记住的东西',
  finalPrimaryCta: '进入控制台',
  finalSecondaryCta: '查看文档',
}

interface OpenClawPageContent {
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
  summaryTitle: string
  summaryPoints: string[]
  featuresEyebrow: string
  featuresTitle: string
  featuresDescription: string
  features: FeatureItem[]
  workflowEyebrow: string
  workflowTitle: string
  workflowStepLabel: string
  workflowSteps: WorkflowStep[]
  useCasesEyebrow: string
  useCasesTitle: string
  useCasesDescription: string
  useCases: UseCaseItem[]
  finalCtaEyebrow: string
  finalCtaTitle: string
  finalPrimaryCta: string
  finalSecondaryCta: string
}

interface FeatureItem {
  icon: FeatureIconKey
  title: string
  description: string
}

interface WorkflowStep {
  title: string
  description: string
}

interface UseCaseItem {
  title: string
  description: string
}

type FeatureIconKey = 'database' | 'shield' | 'workflow' | 'agent'
