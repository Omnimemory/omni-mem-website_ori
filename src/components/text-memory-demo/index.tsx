import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, Card, CardBody, CardHeader, Chip } from '@nextui-org/react'
import { ArrowRight, Database, MessageCircle, Play, RotateCcw, Search } from 'lucide-react'

export function TextMemoryConversationDemo({ locale }: { locale: Locale }) {
  const content = TEXT_DEMO_CONTENT[locale]
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeQuery, setActiveQuery] = useState<string | null>(null)

  const hasStarted = currentStep >= 0
  const maxStep = content.steps.length - 1
  const visibleMessages = useMemo(
    () => content.messages.filter((message) => message.step <= currentStep),
    [content.messages, currentStep]
  )
  const visibleMemories = useMemo(
    () => content.memoryItems.filter((memory) => memory.step <= currentStep),
    [content.memoryItems, currentStep]
  )
  const memoryItemsById = useMemo(
    () =>
      content.memoryItems.reduce<Record<string, MemoryItem>>((accumulator, item) => {
        accumulator[item.id] = item
        return accumulator
      }, {}),
    [content.memoryItems]
  )
  const activeResponse = activeQuery ? QUERY_RESPONSES[activeQuery] : null
  const responseSources = activeResponse
    ? activeResponse.memoryIds
        .map((id) => memoryItemsById[id]?.title)
        .filter((title): title is string => Boolean(title))
        .join(' · ')
    : ''

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= maxStep) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, maxStep))
    }, 1400)
    return () => clearTimeout(timer)
  }, [currentStep, isPlaying, maxStep])

  useEffect(() => {
    setActiveQuery(null)
    setCurrentStep(-1)
    setIsPlaying(false)
  }, [locale])

  function handlePlay() {
    setActiveQuery(null)
    setCurrentStep(0)
    setIsPlaying(true)
  }

  function handleReset() {
    setActiveQuery(null)
    setCurrentStep(-1)
    setIsPlaying(false)
  }

  function handleQuerySelect(query: string) {
    if (!hasStarted || currentStep < 3) return
    setActiveQuery(query)
    if (currentStep < 3) setCurrentStep(3)
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{content.eyebrow}</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--font-serif)' }}>
              {content.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{content.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              color="primary"
              startContent={<Play className="h-4 w-4" />}
              onPress={handlePlay}
              className="bg-[#3da6a6] text-white"
              isDisabled={isPlaying}
            >
              {content.runDemo}
            </Button>
            <Button variant="bordered" startContent={<RotateCcw className="h-4 w-4" />} onPress={handleReset}>
              {content.reset}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-5">
        <div className="grid gap-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-5">
          {content.steps.map((step, index) => {
            const isActive = hasStarted && index <= currentStep
            return (
              <div
                key={step.key}
                className={`rounded-[16px] border px-3 py-3 transition-all bg-white ${
                  isActive ? 'border-[#3da6a6] shadow-sm' : 'border-slate-200'
                }`}
              >
                <p className={`text-[11px] uppercase tracking-[0.2em] ${isActive ? 'text-slate-400' : 'text-slate-300'}`}>
                  {step.label}
                </p>
                <p className={`mt-1 text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.title}
                </p>
                <p className={`mt-1 text-xs ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                  {step.caption}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
          <Card className="border border-slate-200 shadow-none h-full flex flex-col">
            <CardHeader className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3da6a6]/10 text-[#3da6a6]">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{content.conversationTitle}</p>
                <p className="text-xs text-slate-500">{content.conversationSubtitle}</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 px-4 py-4 flex-1">
              {!hasStarted && (
                <div className="rounded-[16px] border border-slate-200 bg-slate-100 px-4 py-8 text-center text-sm text-slate-500">
                  {content.conversationIdle}
                </div>
              )}
              {hasStarted && (
                <AnimatePresence initial={false}>
                  {visibleMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-[16px] px-4 py-3 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-[#3da6a6] text-white'
                            : 'border border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {content.conversationTags.map((tag) => (
                  <Chip key={tag} size="sm" variant="flat" className="border border-slate-200 bg-white text-slate-500">
                    {tag}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-4 h-full flex flex-col">
            <Card className="border border-slate-200 shadow-none flex-1 flex flex-col">
              <CardHeader className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3da6a6]/10 text-[#3da6a6]">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{content.memoryTitle}</p>
                  <p className="text-xs text-slate-500">{content.memorySubtitle}</p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 px-4 py-4 flex-1">
                {!hasStarted && (
                  <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
                    {content.memoryIdle}
                  </div>
                )}
                {hasStarted && visibleMemories.length === 0 && (
                  <div className="rounded-[14px] border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                    {content.memoryEmpty}
                  </div>
                )}
                {hasStarted &&
                  visibleMemories.map((memory) => {
                    const isHighlighted = activeResponse?.memoryIds.includes(memory.id)
                    return (
                      <div
                        key={memory.id}
                        className={`rounded-[16px] border px-4 py-3 transition ${
                          isHighlighted ? 'border-[#3da6a6] bg-[#3da6a6]/5' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{memory.title}</p>
                          <Chip size="sm" variant="flat" className="bg-slate-100 text-slate-500">
                            {memory.type}
                          </Chip>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{memory.detail}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {memory.tags.map((tag) => (
                            <Chip
                              key={tag}
                              size="sm"
                              variant="flat"
                              className="border border-[#3da6a6]/30 bg-white text-[#3da6a6]"
                            >
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </CardBody>
            </Card>

            <Card className="border border-slate-200 shadow-none flex-1 flex flex-col">
              <CardHeader className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3da6a6]/10 text-[#3da6a6]">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{content.retrievalTitle}</p>
                  <p className="text-xs text-slate-500">{content.retrievalSubtitle}</p>
                </div>
              </CardHeader>
              <CardBody className="px-4 py-4 flex-1">
                <div className="flex flex-wrap gap-2">
                  {currentStep >= 3 ? (
                    content.queryPresets.map((query) => (
                      <Button
                        key={query}
                        size="sm"
                        variant={activeQuery === query ? 'solid' : 'bordered'}
                        className={activeQuery === query ? 'bg-[#3da6a6] text-white' : 'border-slate-200'}
                        onPress={() => handleQuerySelect(query)}
                        endContent={<ArrowRight className="h-3 w-3" />}
                      >
                        {query}
                      </Button>
                    ))
                  ) : (
                    <div className="rounded-[12px] border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
                      {content.queryIdle}
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm">
                  {activeResponse ? (
                    <div className="space-y-2 text-slate-700">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{content.answerLabel}</p>
                      <p className="text-sm font-semibold text-slate-900">{activeResponse.answer}</p>
                      <p className="text-xs text-slate-500">
                        {content.sourcesLabel} {responseSources}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400">
                      {hasStarted ? (currentStep >= 3 ? content.emptyAnswer : content.retrievalIdle) : content.retrievalIdle}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DemoStep {
  key: string
  label: string
  title: string
  caption: string
}

interface DemoMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  step: number
}

interface MemoryItem {
  id: string
  title: string
  detail: string
  type: string
  tags: string[]
  step: number
}

interface QueryResponse {
  answer: string
  memoryIds: string[]
}

interface TextDemoContent {
  eyebrow: string
  title: string
  subtitle: string
  runDemo: string
  reset: string
  steps: DemoStep[]
  messages: DemoMessage[]
  memoryItems: MemoryItem[]
  conversationTitle: string
  conversationSubtitle: string
  conversationTags: string[]
  conversationIdle: string
  memoryTitle: string
  memorySubtitle: string
  memoryIdle: string
  memoryEmpty: string
  retrievalTitle: string
  retrievalSubtitle: string
  retrievalIdle: string
  queryIdle: string
  queryPresets: string[]
  answerLabel: string
  sourcesLabel: string
  emptyAnswer: string
}

type Locale = 'en' | 'zh'

const TEXT_DEMO_CONTENT: Record<Locale, TextDemoContent> = {
  en: {
    eyebrow: 'Text Memory Demo',
    title: 'Conversations that compound into memory',
    subtitle: 'Watch how OmniMemory ingests a conversation, extracts durable facts, and answers with citations.',
    runDemo: 'Run demo',
    reset: 'Reset',
    steps: [
      { key: 'ingest', label: '1', title: 'Ingest', caption: 'Conversation turns' },
      { key: 'extract', label: '2', title: 'Extract', caption: 'Entities + facts' },
      { key: 'store', label: '3', title: 'Store', caption: 'Memory index' },
      { key: 'retrieve', label: '4', title: 'Retrieve', caption: 'Search memories' },
      { key: 'respond', label: '5', title: 'Respond', caption: 'Grounded reply' },
    ],
    messages: [
      { id: 'm1', role: 'user', content: "Hey James! How've you been? Had an eventful week since our last chat.", step: 0 },
      { id: 'm2', role: 'assistant', content: "Hey John! Man, it's been wild since we talked. Last Friday my game project hit a snag.", step: 0 },
      { id: 'm3', role: 'user', content: 'Oh no—what happened?', step: 1 },
      { id: 'm4', role: 'assistant', content: "A bug messed up the game mechanics. I debugged for hours and couldn't solve it.", step: 1 },
      { id: 'm5', role: 'user', content: 'Did you manage to fix it?', step: 1 },
      { id: 'm6', role: 'assistant', content: 'Yeah, a few friends teamed up with me and we got it fixed.', step: 1 },
      { id: 'm7', role: 'user', content: "Nice! By the way, you still into pizza?", step: 2 },
      { id: 'm8', role: 'assistant', content: 'Always. Pepperoni is still my favorite.', step: 2 },
    ],
    memoryItems: [
      {
        id: 'mem-01',
        title: 'Project bug resolved with friends',
        detail: 'Last Friday · game mechanics bug · fixed by teaming up',
        type: 'event',
        tags: ['project', 'debugging', 'teamwork'],
        step: 1,
      },
      {
        id: 'mem-02',
        title: 'Pizza preference',
        detail: 'Favorite pizza: pepperoni.',
        type: 'preference',
        tags: ['food', 'taste'],
        step: 2,
      },
      {
        id: 'mem-03',
        title: 'Support network',
        detail: 'A reliable group of friends helps on tough problems.',
        type: 'entity',
        tags: ['people', 'relationship'],
        step: 2,
      },
    ],
    conversationTitle: 'Conversation stream',
    conversationSubtitle: 'Turns are ingested as a single session.',
    conversationTags: ['session_id: conv-009', 'policy: long-term', 'status: ready'],
    conversationIdle: 'Press "Run demo" to stream a new conversation.',
    memoryTitle: 'Memory store',
    memorySubtitle: 'Structured facts extracted from the session.',
    memoryIdle: 'No memories yet.',
    memoryEmpty: 'Extracting signals from the conversation...',
    retrievalTitle: 'Memory retrieval',
    retrievalSubtitle: 'Query the store with natural language.',
    retrievalIdle: 'Run the demo to enable retrieval.',
    queryIdle: 'Queries will appear after the retrieval step.',
    queryPresets: ['How did I fix the project bug?', 'What pizza do I like most?', 'Summarize my key memories.'],
    answerLabel: 'Answer',
    sourcesLabel: 'Sources:',
    emptyAnswer: 'Pick a query to see the memory-grounded response.',
  },
  zh: {
    eyebrow: '文本记忆演示',
    title: '对话如何沉淀为长期记忆',
    subtitle: '展示 OmniMemory 如何写入对话、抽取事实，并用引用支撑回答。',
    runDemo: '运行演示',
    reset: '重置',
    steps: [
      { key: 'ingest', label: '1', title: '写入', caption: '对话回合' },
      { key: 'extract', label: '2', title: '抽取', caption: '实体 + 事实' },
      { key: 'store', label: '3', title: '存储', caption: '记忆索引' },
      { key: 'retrieve', label: '4', title: '检索', caption: '查找记忆' },
      { key: 'respond', label: '5', title: '回答', caption: '有据可循' },
    ],
    messages: [
      { id: 'm1', role: 'user', content: '嗨 James！最近怎么样？感觉你这周挺忙的。', step: 0 },
      { id: 'm2', role: 'assistant', content: '嗨 John！确实有点折腾，上周五游戏项目出了个状况。', step: 0 },
      { id: 'm3', role: 'user', content: '怎么了？', step: 1 },
      { id: 'm4', role: 'assistant', content: '游戏机制被一个 bug 搞崩了，我调了好几个小时都没搞定。', step: 1 },
      { id: 'm5', role: 'user', content: '后来修好了吗？', step: 1 },
      { id: 'm6', role: 'assistant', content: '我叫上几个朋友一起排查，终于修好了。', step: 1 },
      { id: 'm7', role: 'user', content: '对了，你还是最爱披萨吗？', step: 2 },
      { id: 'm8', role: 'assistant', content: '是的，最喜欢的还是意式腊肠。', step: 2 },
    ],
    memoryItems: [
      {
        id: 'mem-01',
        title: '项目 bug 与朋友协作修复',
        detail: '上周五 · 游戏机制 bug · 通过协作修好',
        type: '事件',
        tags: ['项目', '调试', '协作'],
        step: 1,
      },
      {
        id: 'mem-02',
        title: '披萨偏好',
        detail: '最喜欢意式腊肠披萨。',
        type: '偏好',
        tags: ['食物', '口味'],
        step: 2,
      },
      {
        id: 'mem-03',
        title: '支持网络',
        detail: '遇到难题时有一群可靠的朋友可以一起解决。',
        type: '实体',
        tags: ['人物', '关系'],
        step: 2,
      },
    ],
    conversationTitle: '对话流',
    conversationSubtitle: '整段会话一次性写入记忆系统。',
    conversationTags: ['session_id: conv-009', '策略: 长期记忆', '状态: 就绪'],
    conversationIdle: '点击“运行演示”开始新的对话写入。',
    memoryTitle: '记忆库',
    memorySubtitle: '从对话中抽取结构化事实。',
    memoryIdle: '记忆库为空。',
    memoryEmpty: '正在从对话中抽取信号...',
    retrievalTitle: '记忆检索',
    retrievalSubtitle: '用自然语言查询已存记忆。',
    retrievalIdle: '请先运行演示。',
    queryIdle: '到检索阶段再显示问题。',
    queryPresets: ['那个项目 bug 是怎么修好的？', '我最喜欢哪种披萨？', '总结一下我的关键记忆。'],
    answerLabel: '回答',
    sourcesLabel: '来源：',
    emptyAnswer: '点击一个问题查看基于记忆的回答。',
  },
}

const QUERY_RESPONSES: Record<string, QueryResponse> = {
  'How did I fix the project bug?': {
    answer: 'You fixed the game-project bug by teaming up with a few friends after getting stuck on it for hours last Friday.',
    memoryIds: ['mem-01', 'mem-03'],
  },
  'What pizza do I like most?': {
    answer: 'Your favorite pizza is pepperoni.',
    memoryIds: ['mem-02'],
  },
  'Summarize my key memories.': {
    answer: 'Last Friday you hit a tough bug in your game project, fixed it with help from friends, and you love pepperoni pizza.',
    memoryIds: ['mem-01', 'mem-02', 'mem-03'],
  },
  '那个项目 bug 是怎么修好的？': {
    answer: '你在上周五卡了很久，最后和几位朋友一起协作把游戏项目里的 bug 修好了。',
    memoryIds: ['mem-01', 'mem-03'],
  },
  '我最喜欢哪种披萨？': {
    answer: '你最喜欢的是意式腊肠披萨。',
    memoryIds: ['mem-02'],
  },
  '总结一下我的关键记忆。': {
    answer: '上周五你在游戏项目里遇到难解的 bug，后来和朋友协作修好；另外你最爱意式腊肠披萨。',
    memoryIds: ['mem-01', 'mem-02', 'mem-03'],
  },
}
