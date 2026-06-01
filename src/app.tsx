import { useEffect, useState, useRef, type FormEvent } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { BarChart3, Home, KeyRound, Settings, UploadCloud, UserCircle, Play, Check, X, Linkedin, Github, Rocket, Cpu, Trophy, FileText, Copy, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import { DashboardShell, type DashboardLink } from './components/dashboard-shell'
import { useSupabaseSession } from './hooks/use-supabase-session'
import { DashboardPage } from './pages/dashboard'
import { ApiKeysPage } from './pages/api-keys'
import { UploadsPage } from './pages/uploads'
import { UsagePage } from './pages/usage'
import { MemoryPolicyPage } from './pages/memory-policy'
import { ProfilePage } from './pages/profile'
import { SignInPage } from './pages/auth/sign-in'
import { SignUpPage } from './pages/auth/sign-up'
import { PasswordResetPage } from './pages/auth/password-reset'
import { UpdatePasswordPage } from './pages/auth/update-password'
import { DocsPage } from './pages/docs'
import { FaqPage } from './pages/faq'
import { OpenClawMemoryPluginPage } from './pages/openclaw-memory-plugin'

export function App() {
  const [locale, setLocale] = useState<Locale>(() => getPreferredLocale())
  const [routeKey, setRouteKey] = useState<RouteKey>(() =>
    getRouteFromPathname({ pathname: getBrowserPathname() })
  )
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isWechatOpen, setIsWechatOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const content = contentByLocale[locale]
  const homepageCompanyName =
    locale === 'zh'
      ? '丘脑智能科技（深圳）有限公司'
      : 'OmniMemory Intelligence Technology (Shenzhen) Co., Ltd.'
  const navbarLinks = getMarketingNavLinks({ navLinks: content.navbar.navLinks, locale })
  const { session, isLoading: isSessionLoading } = useSupabaseSession()
  const accountDisplayName =
    session?.user?.user_metadata?.name ??
    (session?.user?.email ? session.user.email.split('@')[0] : null)
  const accountEmail = session?.user?.email ?? null
  const signInPath = buildLocalePathname({ pathname: ROUTE_PATHS.signIn, locale })
  const signUpPath = buildLocalePathname({ pathname: ROUTE_PATHS.signUp, locale })
  const passwordResetPath = buildLocalePathname({ pathname: ROUTE_PATHS.passwordReset, locale })
  const updatePasswordPath = buildLocalePathname({ pathname: ROUTE_PATHS.updatePassword, locale })
  const dashboardPath = buildLocalePathname({ pathname: ROUTE_PATHS.dashboard, locale })
  const apiKeysPath = buildLocalePathname({ pathname: ROUTE_PATHS.apiKeys, locale })
  const uploadsPath = buildLocalePathname({ pathname: ROUTE_PATHS.uploads, locale })
  const usagePath = buildLocalePathname({ pathname: ROUTE_PATHS.usage, locale })
  const memoryPolicyPath = buildLocalePathname({ pathname: ROUTE_PATHS.memoryPolicy, locale })
  const profilePath = buildLocalePathname({ pathname: ROUTE_PATHS.profile, locale })
  const homePath = '/'
  const memAuraPath = buildLocalePathname({ pathname: ROUTE_PATHS.memAura, locale })
  const docsPath = buildLocalePathname({ pathname: ROUTE_PATHS.docs, locale })
  const isMarketing = routeKey === 'marketing'
  const isOpenClawMemoryPlugin = routeKey === 'openclawPlugin'
  const isMemAura = routeKey === 'memAura'
  const isPublicMarketingRoute = isMarketing || isOpenClawMemoryPlugin || isMemAura
  const isDocs = routeKey === 'docs'
  const isProtectedRoute = ['dashboard', 'apiKeys', 'uploads', 'usage', 'memoryPolicy', 'profile'].includes(routeKey)

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setIsScrolled(window.scrollY > 50)
      setScrollProgress(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // IP-based locale detection on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Check if we've already detected locale from IP
    const ipLocaleChecked = window.localStorage.getItem(IP_LOCALE_CHECKED_KEY)
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)

    // Only run IP detection if:
    // 1. Never checked before
    // 2. No stored locale preference
    if (ipLocaleChecked || storedLocale) return

    detectLocaleFromIP().then((detectedLocale) => {
      window.localStorage.setItem(IP_LOCALE_CHECKED_KEY, 'true')
      if (detectedLocale && detectedLocale !== locale) {
        setLocale(detectedLocale)
      }
    })
  }, []) // Only run on mount

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Sync locale to document and localStorage
    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)

    // Update URL to reflect current locale (URL-based i18n)
    const currentPath = window.location.pathname
    const pathLocale = getLocaleFromPathname({ pathname: currentPath })
    const strippedPath = stripLocaleFromPathname({ pathname: currentPath })

    // Build the correct URL for current locale
    const correctPath = buildLocalePathname({ pathname: strippedPath, locale })
    if (currentPath !== correctPath) {
      const nextUrl = `${correctPath}${window.location.search}${window.location.hash}`
      window.history.replaceState(null, '', nextUrl)
    }
  }, [locale])

  useEffect(() => {
    if (typeof window === 'undefined') return
    function handlePopState() {
      const pathname = window.location.pathname
      // Sync locale from URL
      const pathLocale = getLocaleFromPathname({ pathname })
      if (pathLocale && pathLocale !== locale) {
        setLocale(pathLocale)
      }
      // Get route from stripped path
      const strippedPath = stripLocaleFromPathname({ pathname })
      setRouteKey(getRouteFromPathname({ pathname: strippedPath }))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [locale])

  useEffect(() => {
    if (!isProtectedRoute) return
    if (isSessionLoading) return
    if (session) return
    navigateTo(signInPath)
  }, [isProtectedRoute, isSessionLoading, routeKey, session, signInPath])

  function handleLocaleToggle() {
    const newLocale = locale === 'en' ? 'zh' : 'en'
    setLocale(newLocale)
    // URL will be updated by the useEffect that watches locale
  }

  function handleSignInClick() { navigateTo(signInPath) }
  function handleSignUpClick() { navigateTo(signUpPath) }
  function handleOpenContactModal() { setIsContactModalOpen(true) }
  function handleCloseContactModal() { setIsContactModalOpen(false) }

  function navigateTo(pathname: string) {
    if (typeof window === 'undefined') return
    // Build locale-aware path
    const strippedPath = stripLocaleFromPathname({ pathname })
    const localePath = buildLocalePathname({ pathname: strippedPath, locale })
    window.history.pushState({}, '', localePath)
    setRouteKey(getRouteFromPathname({ pathname: strippedPath }))
  }

  const dashboardLinks: DashboardLink[] = locale === 'zh' ? [
    { label: '概览', path: dashboardPath, group: 'main', icon: Home },
    { label: 'API 密钥', path: apiKeysPath, group: 'main', icon: KeyRound },
    { label: '上传任务', path: uploadsPath, group: 'main', icon: UploadCloud },
    { label: '用量', path: usagePath, group: 'main', icon: BarChart3 },
    { label: '记忆策略', path: memoryPolicyPath, group: 'main', icon: Settings },
    { label: '个人资料', path: profilePath, group: 'account', icon: UserCircle },
  ] : [
    { label: 'Overview', path: dashboardPath, group: 'main', icon: Home },
    { label: 'API Keys', path: apiKeysPath, group: 'main', icon: KeyRound },
    { label: 'Uploads', path: uploadsPath, group: 'main', icon: UploadCloud },
    { label: 'Usage', path: usagePath, group: 'main', icon: BarChart3 },
    { label: 'Memory Policy', path: memoryPolicyPath, group: 'main', icon: Settings },
    { label: 'Profile', path: profilePath, group: 'account', icon: UserCircle },
  ]

  const currentDashboardPath = (() => {
    switch (routeKey) {
      case 'apiKeys': return apiKeysPath
      case 'uploads': return uploadsPath
      case 'usage': return usagePath
      case 'memoryPolicy': return memoryPolicyPath
      case 'profile': return profilePath
      default: return dashboardPath
    }
  })()

  const mainClassName = isProtectedRoute
    ? 'min-h-[70vh]'
    : isDocs || isOpenClawMemoryPlugin || isMemAura
      ? 'min-h-[70vh] pt-0'
      : 'min-h-[70vh] px-6 pb-24 pt-28 sm:px-8'

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      {isPublicMarketingRoute && (
        <div className="announcement-bar">
          <span>UPCOMING UPDATE: OmniMemory 1.1</span>
        </div>
      )}

      {/* Navbar */}
      <nav className={`navbar-v2 ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-v2-inner">
          <a href={homePath} className="logo-v2">
            <img src="/Logo/SVG/Logo-Graphic-OmniMemory.svg" alt="" width={28} height={28} />
            <span>OmniMemory</span>
          </a>

          {isPublicMarketingRoute && (
            <div className="nav-links-v2">
              {navbarLinks.map((link) => (
                link.dropdown ? (
                  <div key={link.label} className="navbar-dropdown">
                    <button className="nav-link-v2 dropdown-trigger">
                      {link.label}
                      <span className="dropdown-chevron">▾</span>
                    </button>
                    <div className="dropdown-menu">
                      {link.dropdown.map((item) => (
                        <a key={item.label} href={item.href} className="dropdown-item">
                          <span className="dropdown-icon">{item.icon}</span>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a key={link.label} href={link.href} className="nav-link-v2">
                    {link.label}
                  </a>
                )
              ))}
            </div>
          )}

          <div className="nav-actions-v2">
            <button onClick={handleLocaleToggle} className="lang-toggle-v2">
              {locale === 'en' ? '中文' : 'EN'}
            </button>
            {isPublicMarketingRoute && (
              <a href="/dashboard" className="btn-primary btn-nav">
                {content.navbar.ctaLabel}
              </a>
            )}
            {!isPublicMarketingRoute && session ? (
              <div className="hidden flex-col items-end text-xs text-ink/60 sm:flex">
                <span className="font-semibold text-ink">
                  {accountDisplayName ?? '账户'}
                </span>
                {accountEmail ? <span>{accountEmail}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {isPublicMarketingRoute ? (
        <main>
          {isMarketing ? (
            <>
              <HeroSection
                content={content.hero}
                dashboardPath={dashboardPath}
                docsPath={docsPath}
                memAuraPath={memAuraPath}
                locale={locale}
              />
              <NewsSection locale={locale} />
              <DemoSection />
              <HowItWorksSection content={content.howItWorks} />
              <BenchmarkSection content={content.stats} />
              {/* <EnterpriseSection content={content.features} /> */}
              <TestimonialsSection content={content.testimonials} />
              <PartnersMarquee content={content.partners} />
              <PricingSection content={content.pricing} eyebrowTone="cyan" onContactClick={handleOpenContactModal} />
              <CtaSection content={content.cta} onContactClick={handleOpenContactModal} />
              <FooterSection content={content.footer} companyName={homepageCompanyName} />
            </>
          ) : isOpenClawMemoryPlugin ? (
            <>
              <OpenClawMemoryPluginPage locale={locale} onNavigate={navigateTo} />
              <FooterSection content={content.footer} />
            </>
          ) : (
            <>
              <MemAuraPage
                content={content}
                dashboardPath={dashboardPath}
                docsPath={docsPath}
                memAuraPath={memAuraPath}
                locale={locale}
                onContactClick={handleOpenContactModal}
              />
              <MemAuraFooterSection phone={content.businessContact.phone} locale={locale} />
            </>
          )}
        </main>
      ) : (
        <main className={mainClassName}>
          {isProtectedRoute && (
            <DashboardShell
              title={getDashboardTitle(routeKey, locale)}
              currentPath={currentDashboardPath}
              links={dashboardLinks}
              locale={locale}
              onNavigate={navigateTo}
              onSignIn={handleSignInClick}
              onSignUp={handleSignUpClick}
            >
              {routeKey === 'dashboard' && <DashboardPage />}
              {routeKey === 'apiKeys' && <ApiKeysPage />}
              {routeKey === 'uploads' && <UploadsPage />}
              {routeKey === 'usage' && <UsagePage />}
              {routeKey === 'memoryPolicy' && <MemoryPolicyPage />}
              {routeKey === 'profile' && <ProfilePage />}
            </DashboardShell>
          )}
          {routeKey === 'signIn' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <SignInPage signUpPath={signUpPath} passwordResetPath={passwordResetPath} dashboardPath={dashboardPath} onNavigate={navigateTo} />
            </div>
          )}
          {routeKey === 'signUp' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <SignUpPage signInPath={signInPath} dashboardPath={dashboardPath} onNavigate={navigateTo} />
            </div>
          )}
          {routeKey === 'passwordReset' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <PasswordResetPage
                signInPath={signInPath}
                dashboardPath={dashboardPath}
                updatePasswordPath={updatePasswordPath}
                onNavigate={navigateTo}
              />
            </div>
          )}
          {routeKey === 'updatePassword' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <UpdatePasswordPage
                dashboardPath={dashboardPath}
                signInPath={signInPath}
                onNavigate={navigateTo}
              />
            </div>
          )}
          {routeKey === 'docs' && (
            <DocsPage locale={locale} onNavigate={navigateTo} onLocaleToggle={handleLocaleToggle} />
          )}
          {routeKey === 'faq' && (
            <FaqPage locale={locale} />
          )}
        </main>
      )}
      {isPublicMarketingRoute && <PageScrollIndicator progress={scrollProgress} />}
      <ContactModal
        content={content.businessContact}
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
      />
      <Analytics />
      <div className={`wechat-fab ${isWechatOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="wechat-fab-button"
          onClick={() => setIsWechatOpen((prev) => !prev)}
          aria-expanded={isWechatOpen}
          aria-controls="wechat-qr-panel"
        >
          加入微信群讨论
        </button>
        <div
          id="wechat-qr-panel"
          className="wechat-fab-panel"
          role="dialog"
          aria-hidden={!isWechatOpen}
        >
          <div className="wechat-fab-card">
            <div className="wechat-fab-header">
              <span className="wechat-fab-title">扫码加入微信群</span>
              <button
                type="button"
                className="wechat-fab-close"
                onClick={() => setIsWechatOpen(false)}
                aria-label="Close"
              >
                X
              </button>
            </div>
            <img src="/QRcode.jpg" alt="WeChat QR code" className="wechat-fab-image" />
            <p className="wechat-fab-caption">打开微信扫一扫，加入讨论</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PageScrollIndicator({ progress }: { progress: number }) {
  return (
    <div className="page-scroll-indicator" aria-hidden>
      <div className="page-scroll-indicator-thumb" style={{ height: `${Math.max(progress * 100, 8)}%` }} />
    </div>
  )
}
// ============ HERO SECTION ============
function HeroSection({
  content,
  dashboardPath,
  docsPath,
  memAuraPath,
  locale,
}: {
  content: HeroContent
  dashboardPath: string
  docsPath: string
  memAuraPath: string
  locale: 'en' | 'zh'
}) {
  return (
    <section className="hero-v2">
      <div className="hero-v2-bg" aria-hidden>
        <div className="hero-v2-bg-gradient" />
        <div className="hero-v2-glow hero-v2-glow--1" />
        <div className="hero-v2-glow hero-v2-glow--2" />
        <div className="hero-v2-grid" />
      </div>
      <div className="hero-v2-content">
        <div className="hero-announcement">
          <span className="hero-announcement-dot" aria-hidden />
          <span>{content.announcement}</span>
          <span className="hero-announcement-dot hero-announcement-dot--plain" aria-hidden />
        </div>

        <h1 className="hero-v2-title">
          <span className="hero-v2-line hero-v2-title-plain">{content.titleLine1}</span>
          <span className="hero-v2-line hero-v2-title-gradient">{content.titleLine2}</span>
        </h1>

        <div className="hero-description-box">
          <p className="hero-description-text">
            <span
              className={
                locale === 'zh'
                  ? 'hero-description-main hero-description-main--nowrap'
                  : 'hero-description-main'
              }
            >
              <span className="hero-description-lead">
                <strong>{content.descriptionLead}</strong>
              </span>
              {content.descriptionBody}
            </span>
            <span className="hero-benefits-row">
              <span className="hero-benefits-label">{content.benefitsEyebrow}</span>
              {content.benefitTags.map((tag, i) => (
                <span key={tag} className={`hero-benefit-tag hero-benefit-tag--${i + 1}`}>
                  {tag}
                </span>
              ))}
            </span>
          </p>
        </div>

        <div className="hero-v2-ctas">
          <a href={dashboardPath} className="hero-cta-primary">
            <Rocket size={20} aria-hidden />
            {content.primaryCta}
          </a>
          <a href={docsPath} className="hero-cta-secondary">
            <FileText size={20} aria-hidden />
            {content.secondaryCta}
          </a>
          <a href={memAuraPath} className="hero-cta-secondary hero-cta-solution">
            <Cpu size={20} aria-hidden />
            {content.solutionCta}
          </a>
        </div>

        <div className="hero-mem-stats">
          {content.heroStats.map((row) => {
            if (row.kind === 'percent') {
              return (
                <div key={row.label} className="hero-mem-stat">
                  <div className="hero-mem-stat-value">
                    {row.num}
                    <span className="hero-mem-stat-suffix">%</span>
                  </div>
                  <div className="hero-mem-stat-label">{row.label}</div>
                </div>
              )
            }
            if (row.kind === 'latency') {
              return (
                <div key={row.label} className="hero-mem-stat">
                  <div className="hero-mem-stat-value hero-mem-stat-value--latency">
                    <span className="hero-mem-stat-prefix">≤</span>
                    {row.maxMs}
                    <span className="hero-mem-stat-suffix ms">ms</span>
                  </div>
                  <div className="hero-mem-stat-label">{row.label}</div>
                </div>
              )
            }
            return (
              <div key={row.label} className="hero-mem-stat">
                <Trophy size={32} className="hero-mem-stat-trophy" aria-hidden />
                <div className="hero-mem-stat-label">{row.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============ MEMAURA PAGE ============
function MemAuraPage({
  content,
  dashboardPath,
  docsPath,
  memAuraPath,
  locale,
  onContactClick,
}: {
  content: AppContent
  dashboardPath: string
  docsPath: string
  memAuraPath: string
  locale: Locale
  onContactClick: () => void
}) {
  const pageContent = locale === 'zh'
    ? {
      architectureEyebrow: '架构图 / ARCHITECTURE',
      architectureTitle: '从多模态事件到长期认知资产',
      architectureDescription: '通过摄取、增强、检索的记忆链路，将文本、视觉、听觉和行为事件沉淀为可追溯、可更新、可注入的长期记忆。',
      advantages: [
        '保留 80% 以上原始证据，减少过度摘要导致的 AI 幻觉。',
        '识别长期偏好、短期情绪、时间顺序和过期规则。',
        '支持跨会话、跨应用、跨设备的人格一致性与记忆同步。',
      ],
    }
    : {
      architectureEyebrow: '架构图 / ARCHITECTURE',
      architectureTitle: 'From multimodal events to long-term cognitive assets',
      architectureDescription: 'The ingest, enrich, and recall pipeline turns text, visual, auditory, and behavioral events into traceable, updatable, injectable long-term memory.',
      advantages: [
        'Retain more than 80% raw evidence to reduce hallucinations caused by over-summary.',
        'Understand long-term preferences, short-term emotion, temporal order, and expiry rules.',
        'Keep personality and memory consistent across sessions, applications, and devices.',
      ],
    }

  return (
    <div className="mem-aura-page">
      <HeroSection
        content={content.hero}
        dashboardPath={dashboardPath}
        docsPath={docsPath}
        memAuraPath={memAuraPath}
        locale={locale}
      />

      <CapabilitiesSection content={content.capabilities} />
      <MemAuraArchitectureSection
        eyebrow={pageContent.architectureEyebrow}
        title={pageContent.architectureTitle}
        description={pageContent.architectureDescription}
        steps={content.howItWorks.steps}
        advantages={pageContent.advantages}
      />
      <CostReductionSection content={content.costReduction} />
      <CustomerCaseSection content={content.customerCase} />
      <PricingSection content={content.pricing} onContactClick={onContactClick} />
      <BusinessContactSection content={content.businessContact} onContactClick={onContactClick} />
    </div>
  )
}

function MemAuraArchitectureSection({
  eyebrow,
  title,
  description,
  steps,
  advantages,
}: {
  eyebrow: string
  title: string
  description: string
  steps: { title: string; description: string }[]
  advantages: string[]
}) {
  return (
    <section className="module-section mem-aura-architecture" id="mem-aura-architecture">
      <div className="container-v2">
        <SectionEyebrow icon="architecture">{eyebrow}</SectionEyebrow>
        <h2 className="module-title">{title}</h2>
        <p className="module-subtitle">{description}</p>

        <div className="mem-aura-architecture-grid">
          <div className="mem-aura-flow-card">
            {steps.map((step, index) => (
              <div key={step.title} className="mem-aura-flow-step">
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mem-aura-advantages-card">
            {advantages.map((advantage) => (
              <div key={advantage} className="mem-aura-advantage-item">
                <Check size={18} aria-hidden />
                <p>{advantage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
function NewsSection({ locale }: { locale: Locale }) {
  const content = locale === 'en' ? {
    eyebrow: 'Recent News',
    title: 'Hot Release: OpenClaw Memory Plugin 🔥',
    description: 'A new OpenClaw solution is now live. Long-term memory, automatic recall, and secure OmniMemory SaaS integration are bundled into one focused release for agent teams.',
    cta: 'View OpenClaw Solution',
    href: '/solutions/openclaw-memory-plugin',
  } : {
    eyebrow: '近期新闻',
    title: '重磅发布：OpenClaw记忆插件 🔥',
    description: 'OpenClaw 新解决方案已正式上线。长期记忆、自动回忆和 OmniMemory SaaS 安全接入，现在作为一个完整产品能力集中发布。',
    cta: '查看 OpenClaw 解决方案',
    href: '/zh/solutions/openclaw-memory-plugin',
  }

  return (
    <section id="recent-news" className="bg-white px-6 py-10 sm:px-8">
      <div
        className="container-v2 overflow-hidden rounded-[34px] border p-4 shadow-[0_26px_80px_rgba(12,24,61,0.08)] lg:p-5"
        style={{ borderColor: 'rgba(var(--ink), 0.08)', background: 'linear-gradient(135deg, rgba(12, 24, 61, 0.04) 0%, rgba(61, 166, 166, 0.08) 100%)' }}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
          <div className="space-y-5 px-4 py-5 sm:px-8">
            <p className="module-eyebrow text-left">{content.eyebrow}</p>
            <h2 className="module-title text-left">
              {locale === 'zh' ? (
                <>
                  <span className="block">重磅发布：</span>
                  <span className="block whitespace-nowrap">OpenClaw记忆插件 🔥</span>
                </>
              ) : (
                content.title
              )}
            </h2>
            <p className="max-w-2xl text-base leading-8 text-[rgb(var(--ink)/0.76)] sm:text-lg">
              {content.description}
            </p>
            <a href={content.href} className="btn-primary inline-flex">
              {content.cta}
            </a>
          </div>
          <div
            className="overflow-hidden rounded-[28px] border p-4"
            style={{
              borderColor: 'rgba(var(--ink), 0.08)',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 248, 252, 1) 100%)',
            }}
          >
            <img
              src="/news/poster_top.jpg"
              alt="OpenClaw release poster"
              className="max-h-[420px] w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ DEMO SECTION (PLACEHOLDER) ============
function DemoSection() {
  return (
    <section className="demo-section">
      <div className="container-v2">
        <h2 className="demo-section-title">Introducing OmniMemory</h2>
        <div className="demo-tabs">
          <button className="demo-tab active" type="button">
            Video
          </button>
        </div>
        <div className="demo-content">
          <video
            className="demo-video-player"
            src="/Video/omnimemory-demo.mp4"
            controls
            playsInline
            preload="metadata"
            aria-label="OmniMemory video demo"
          />
        </div>
      </div>
    </section>
  )
}

// ============ BENCHMARK SECTION ============
// Benchmarks: LoCoMo + LongMemEval - see process.md for tracking
function BenchmarkSection({ content }: { content: StatsContent }) {
  const [activeBenchmark, setActiveBenchmark] = useState<'locomo' | 'longmemeval'>('locomo')

  return (
    <section className="benchmark-section">
      <div className="container-v2">
        <p className="module-eyebrow">Multimodal Benchmarks</p>
        <h2 className="module-title">Memory Across All Modalities</h2>
        <p className="module-subtitle">Omni Memory processes and remembers context from conversations, audio, and video.</p>

        {/* Modality Tabs */}
        <div className="benchmark-tabs">
          <button
            className={`benchmark-tab ${activeBenchmark === 'locomo' ? 'active' : ''}`}
            onClick={() => setActiveBenchmark('locomo')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            LoCoMo
          </button>
          <button
            className={`benchmark-tab ${activeBenchmark === 'longmemeval' ? 'active' : ''}`}
            onClick={() => setActiveBenchmark('longmemeval')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            LongMemEval
          </button>
          <button className="benchmark-tab disabled" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Audio
            <span className="tab-badge">Soon</span>
          </button>
          <button className="benchmark-tab disabled" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            Video
            <span className="tab-badge">Soon</span>
          </button>
        </div>

        {activeBenchmark === 'locomo' && (
          <div className="benchmark-content">
            <div className="benchmark-info">
              <h3 className="benchmark-modality-title">LoCoMo Benchmark</h3>
              <p className="benchmark-modality-desc">Long-context conversation memory evaluation with multi-hop reasoning</p>
              <div className="benchmark-modality-stats">
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">93.50%</span>
                  <span className="benchmark-stat-label">J-Score Accuracy</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">4</span>
                  <span className="benchmark-stat-label">Task Categories</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">&lt;500ms</span>
                  <span className="benchmark-stat-label">Retrieval Latency</span>
                </div>
              </div>
            </div>

            <div className="benchmark-chart">
              <div className="chart-title">LoCoMo Benchmark - J-Score Accuracy (%)</div>
              <div className="chart-bars">
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Omni Memory</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-primary" style={{ width: '93.50%' }}>
                      <span className="chart-bar-value">93.50%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">memU（official）</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '88.20%' }}>
                      <span className="chart-bar-value">88.20%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">MemOS</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '75.80%' }}>
                      <span className="chart-bar-value">75.80%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Membase</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '75.80%' }}>
                      <span className="chart-bar-value">75.80%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeBenchmark === 'longmemeval' && (
          <div className="benchmark-content">
            <div className="benchmark-info">
              <h3 className="benchmark-modality-title">LongMemEval Benchmark</h3>
              <p className="benchmark-modality-desc">Comprehensive evaluation across 6 memory dimensions</p>
              <div className="benchmark-modality-stats">
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">82%</span>
                  <span className="benchmark-stat-label">Overall Accuracy</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">95.6%</span>
                  <span className="benchmark-stat-label">Session Assistant</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">97.3%</span>
                  <span className="benchmark-stat-label">Temporal Reasoning</span>
                </div>
              </div>
            </div>

            <div className="benchmark-chart">
              <div className="chart-title">LongMemEval - Overall Accuracy (%)</div>
              <div className="chart-bars">
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Omni Memory</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-primary" style={{ width: '82.00%' }}>
                      <span className="chart-bar-value">82.00%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">MemOS</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '77.80%' }}>
                      <span className="chart-bar-value">77.80%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Membase</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '72.4%' }}>
                      <span className="chart-bar-value">72.4%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">memU</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '38.40%' }}>
                      <span className="chart-bar-value">38.40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ============ ENTERPRISE SECTION ============

function EnterpriseSection({ content }: { content: FeaturesContent }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        )
      case 'deploy':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
            <polyline points="7.5 19.79 7.5 14.6 3 12"/>
            <polyline points="21 12 16.5 14.6 16.5 19.79"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        )
      case 'support':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        )
      case 'dashboard':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <section className="enterprise-section" id="enterprise">
      <div className="container-v2">
        <p className="module-eyebrow">{content.eyebrow}</p>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        <div className="enterprise-grid">
          {content.items.map((item, i) => (
            <div key={i} className="enterprise-card">
              <div className="enterprise-card-header">
                <div className="enterprise-icon">
                  {getIcon(item.icon)}
                </div>
                <span className="enterprise-tag">{item.tag}</span>
              </div>
              <h4 className="enterprise-card-title">{item.title}</h4>
              <p className="enterprise-card-desc">{item.description}</p>
              <div className="enterprise-card-border" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type SectionEyebrowIcon = 'features' | 'architecture' | 'metrics' | 'pricing' | 'customer' | 'contact'

function SectionEyebrow({
  children,
  align = 'center',
  icon,
  tone = 'default',
}: {
  children: string
  align?: 'center' | 'left'
  icon: SectionEyebrowIcon
  tone?: 'default' | 'cyan'
}) {
  return (
    <p
      className={[
        'mem-aura-section-eyebrow',
        `mem-aura-section-eyebrow--${align}`,
        tone === 'cyan' ? 'mem-aura-section-eyebrow--cyan' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className="mem-aura-section-eyebrow-icon" aria-hidden>
        <SectionEyebrowGlyph icon={icon} />
      </span>
      {children}
    </p>
  )
}

function SectionEyebrowGlyph({ icon }: { icon: SectionEyebrowIcon }) {
  if (icon === 'features') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  }

  if (icon === 'architecture') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="m12 4 7 3.5-7 3.5-7-3.5L12 4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m5 12 7 3.5 7-3.5M5 16.5 12 20l7-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (icon === 'metrics') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 19h16M7 19V10m5 9V5m5 14v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 10h2m3-5h2m3 7h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (icon === 'pricing') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 11.5 11.5 4H20v8.5L12.5 20 4 11.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M16 8h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    )
  }

  if (icon === 'contact') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M21 15.6v3a2 2 0 0 1-2.2 2 16.9 16.9 0 0 1-7.4-2.6 16.4 16.4 0 0 1-5.1-5.1 16.9 16.9 0 0 1-2.6-7.4A2 2 0 0 1 5.7 3.3h3a2 2 0 0 1 2 1.7c.1.8.3 1.5.6 2.2a2 2 0 0 1-.4 2.1l-1.2 1.2a13 13 0 0 0 4.8 4.8l1.2-1.2a2 2 0 0 1 2.1-.4c.7.3 1.4.5 2.2.6a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 1 1 7.1 7.1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function CapabilitiesSection({ content }: { content: CapabilitiesContent }) {
  return (
    <section className="module-section module-gray capabilities-showcase" id="capabilities">
      <div className="container-v2 capabilities-showcase-inner">
        <SectionEyebrow icon="features">完整功能 / CORE FEATURES</SectionEyebrow>
        <h2 className="capabilities-showcase-title">核心功能特性</h2>
        <p className="capabilities-showcase-subtitle">从记录对话到深度进化的核心技术支柱</p>

        <div className="capabilities-showcase-groups">
          {content.groups.map((group, groupIndex) => (
            <div key={group.label} className="capability-showcase-group">
              <div className="capability-showcase-heading">
                {groupIndex === 0 ? <TargetGlyph /> : <LightningGlyph />}
                <span>{group.label}</span>
                <div />
              </div>
              <div className="capability-showcase-grid">
                {group.items.map((item, itemIndex) => (
                  <article key={item.title} className="capability-showcase-card">
                    <div className="capability-showcase-icon">
                      <CapabilityGlyph index={itemIndex + groupIndex * 5} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TargetGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function LightningGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function CapabilityGlyph({ index }: { index: number }) {
  const glyphs = [
    <g key="eye">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.35" stroke="currentColor" strokeWidth="1.6" />
    </g>,
    <path key="db" d="M5 7c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3Zm0 0v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" stroke="currentColor" strokeWidth="1.6" />,
    <path key="user" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
    <path key="layers" d="m12 4 8 4-8 4-8-4 8-4Zm-8 8 8 4 8-4M4 16l8 4 8-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
    <path key="clock" d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
    <path key="brain" d="M9 5a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 5 2.2V5.8A3 3 0 0 0 9 5Zm6 0a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-5 2.2V5.8A3 3 0 0 1 15 5Z" stroke="currentColor" strokeWidth="1.6" />,
    <path key="gear" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
    <path key="share" d="M18 8a3 3 0 1 0-2.8-4.1A3 3 0 0 0 18 8ZM6 15a3 3 0 1 0-2.8-4.1A3 3 0 0 0 6 15Zm12 6a3 3 0 1 0-2.8-4.1A3 3 0 0 0 18 21Zm-9.4-7.6 6.8 3.2M15.4 7.4 8.6 10.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  ]

  return <svg viewBox="0 0 24 24" fill="none" aria-hidden>{glyphs[index % glyphs.length]}</svg>
}

function getCostSceneTone(scene: string) {
  const normalizedScene = scene.toLowerCase()

  if (scene.includes('重度') || normalizedScene.includes('heavy')) return 'heavy'
  if (scene.includes('长上下文') || normalizedScene.includes('long context')) return 'long'
  return 'medium'
}

function CostReductionSection({ content }: { content: CostReductionContent }) {
  return (
    <section className="module-section" id="cost-reduction">
      <div className="container-v2">
        <SectionEyebrow icon="metrics">{content.eyebrow}</SectionEyebrow>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle cost-reduction-subtitle">{content.description}</p>

        <div className="cost-table-wrap">
          <table className="cost-table">
            <thead>
              <tr>
                <th>模型名称</th>
                <th>场景</th>
                <th>优化前年输入 tokens</th>
                <th>优化后年输入 tokens</th>
                <th>未优化总成本 (RMB)</th>
                <th>优化后总成本 (RMB)</th>
                <th>成本差值 (RMB)</th>
                <th className="cost-table-ratio-head">成本降低比例</th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, index) => (
                <tr key={`${row.model}-${row.scene}`}>
                  {index === 0 && (
                    <td className="cost-table-model-cell" rowSpan={content.rows.length}>{row.model}</td>
                  )}
                  <td className={`cost-table-scene-cell cost-table-scene-cell--${getCostSceneTone(row.scene)}`}>
                    <span>{row.scene}</span>
                  </td>
                  <td>{row.beforeTokens}</td>
                  <td>{row.afterTokens}</td>
                  <td>{row.beforeCost}</td>
                  <td>{row.afterCost}</td>
                  <td>{row.diff}</td>
                  <td className="cost-table-ratio-cell">{row.ratio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-xs italic text-ink/50">{content.note}</p>
      </div>
    </section>
  )
}

function CustomerCaseSection({ content }: { content: CustomerCaseContent }) {
  return (
    <section className="module-section module-dark customer-case-section" id="customer-case">
      <div className="container-v2 customer-case-container">
        <div className="customer-case-header">
          <SectionEyebrow icon="customer">{content.eyebrow}</SectionEyebrow>
          <h2 className="customer-case-title">{content.title}</h2>
          <p className="customer-case-subtitle">{content.summary}</p>
        </div>

        <div className="customer-case-panel">
          <div className="customer-case-columns">
            <article className="customer-case-column">
              <h3 className="customer-case-heading customer-case-heading--purple">{content.backgroundTitle}</h3>
              <p>{content.background}</p>
              <div className="customer-case-metrics">
                {content.metrics.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <h3 className="customer-case-heading customer-case-heading--red">{content.painTitle}</h3>
              <ul className="customer-case-list customer-case-list--pain">
                {content.challenges.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="customer-case-column customer-case-column--solution">
              <h3 className="customer-case-heading customer-case-heading--green">{content.solutionTitle}</h3>
              <div className="customer-case-solutions">
                {content.solutions.map((item) => (
                  <div key={item.title} className="customer-case-solution-item">
                    <Check size={18} aria-hidden />
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="customer-case-benchmark-panel">
            <h3>{content.benchmarkTitle}</h3>
            <div className="customer-case-benchmark-table-v2">
              <div className="customer-case-benchmark-head">
                <span>指标</span>
                <span>{content.metricBeforeLabel}</span>
                <span>{content.metricAfterLabel}</span>
                <span>{content.metricChangeLabel}</span>
              </div>
              {content.benchmark.map((item) => (
                <div key={item.dimension} className="customer-case-benchmark-row-v2">
                  <span>{item.dimension}</span>
                  <span>{item.before}</span>
                  <span>{item.after}</span>
                  <span>{item.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


function BusinessContactSection({
  content,
  onContactClick,
}: {
  content: BusinessContactContent
  onContactClick: () => void
}) {
  return (
    <section className="module-section business-contact-section" id="business-contact">
      <div className="container-v2">
        <div className="business-contact-card">
          <div className="business-contact-copy">
            <SectionEyebrow align="left" icon="contact">{content.eyebrow}</SectionEyebrow>
            <h2 className="module-title text-left">{content.title}</h2>
            <p className="module-subtitle text-left business-contact-description">{content.description}</p>
          </div>
          <div className="business-contact-actions">
            <div>
              <p className="business-contact-label">{content.phoneLabel}</p>
              <button type="button" className="business-contact-phone" onClick={onContactClick}>
                {content.wechat}
              </button>
            </div>
            <button type="button" className="hero-cta-primary business-contact-cta" onClick={onContactClick}>
              <PhoneIcon />
              {content.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactModal({
  content,
  isOpen,
  onClose,
}: {
  content: BusinessContactContent
  isOpen: boolean
  onClose: () => void
}) {
  const [contact, setContact] = useState('')
  const [companyType, setCompanyType] = useState(content.companyTypeOptions[0] ?? '')
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    setCompanyType(content.companyTypeOptions[0] ?? '')
    setCopied(false)
    setMessage(null)
  }, [content.companyTypeOptions, isOpen])

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content.wechat)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = content.wechat
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setMessage(content.copyFailedText)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contact.trim()) {
      setMessage(content.requiredText)
      return
    }

    setContact('')
    setCompanyType(content.companyTypeOptions[0] ?? '')
    setMessage(content.successText)
  }

  if (!isOpen) return null

  const dialogTitleId = 'business-contact-dialog-title'

  return (
    <div className="contact-modal" role="presentation" onMouseDown={onClose}>
      <div
        className="contact-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="contact-modal-close" onClick={onClose} aria-label={content.closeLabel}>
          <X size={18} aria-hidden />
        </button>

        <div className="contact-modal-header">
          <p className="contact-modal-eyebrow">{content.modalEyebrow}</p>
          <h2 id={dialogTitleId}>{content.modalTitle}</h2>
        </div>

        <div className="contact-modal-copy-row">
          <div>
            <p className="contact-modal-wechat-line">
              <span className="contact-modal-label">{content.wechatLabel}</span>
              <span className="contact-modal-wechat">{content.wechat}</span>
            </p>
          </div>
          <button type="button" className="contact-copy-button" onClick={handleCopy}>
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? content.copiedText : content.copyText}
          </button>
        </div>

        <form className="contact-modal-form" onSubmit={handleSubmit}>
          <label className="contact-form-field">
            <span>{content.contactFieldLabel}</span>
            <input
              type="text"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder={content.contactPlaceholder}
              autoComplete="email"
            />
          </label>

          <label className="contact-form-field">
            <span>{content.companyTypeLabel}</span>
            <select value={companyType} onChange={(event) => setCompanyType(event.target.value)}>
              {content.companyTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          {message ? <p className="contact-modal-message">{message}</p> : null}

          <button type="submit" className="contact-submit-button">
            <Send size={16} aria-hidden />
            {content.submitText}
          </button>
        </form>

        <p className="contact-modal-hint">{content.formHint}</p>
      </div>
    </div>
  )
}

function MemAuraFooterSection({ phone, locale }: { phone: string; locale: Locale }) {
  const links = locale === 'zh'
    ? [
      { label: '完整功能', href: '#capabilities' },
      { label: '架构优势', href: '#mem-aura-architecture' },
      { label: '降本数据', href: '#cost-reduction' },
      { label: '客户案例', href: '#customer-case' },
      { label: '商务咨询', href: '#business-contact' },
    ]
    : [
      { label: 'Capabilities', href: '#capabilities' },
      { label: 'Architecture', href: '#mem-aura-architecture' },
      { label: 'Cost data', href: '#cost-reduction' },
      { label: 'Customer case', href: '#customer-case' },
      { label: 'Business contact', href: '#business-contact' },
    ]

  return (
    <footer className="mem-aura-footer">
      <div className="container-v2 mem-aura-footer-inner">
        <div>
          <p className="mem-aura-footer-brand">memAura AI 记忆基座</p>
          <p className="mem-aura-footer-copy">
            {locale === 'zh' ? '© 2026 memAura AI 记忆基座. All rights reserved.' : '© 2026 memAura AI Memory Base. All rights reserved.'}
          </p>
        </div>
        <nav className="mem-aura-footer-links" aria-label="memAura page links">
          {links.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <a className="mem-aura-footer-phone" href={`tel:${phone}`}>
          {phone}
        </a>
      </div>
    </footer>
  )
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.68A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L8 9.8a16 16 0 0 0 6.2 6.2l1.37-1.28a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

interface GraphNode {
  id: string
  icon: 'person' | 'location' | 'object' | 'analyse' | 'research' | 'study'
  layer: 'cognition' | 'perception'
  active?: boolean
}

const knowledgeGraphData = {
  nodes: [
    { id: 'c1', icon: 'person', layer: 'cognition' },
    { id: 'c2', icon: 'location', layer: 'cognition' },
    { id: 'c3', icon: 'person', layer: 'cognition' },
    { id: 'c4', icon: 'object', layer: 'cognition' },
    { id: 'p1', icon: 'analyse', layer: 'perception' },
    { id: 'p2', icon: 'research', layer: 'perception', active: true },
    { id: 'p3', icon: 'study', layer: 'perception' },
    { id: 'p4', icon: 'analyse', layer: 'perception' },
    { id: 'p5', icon: 'research', layer: 'perception' },
  ] as GraphNode[],
}

function HowItWorksSection({ content }: { content: HowItWorksContent }) {
  // Calculate node positions for SVG edges
  const getNodePosition = (nodeId: string): { x: number; y: number } => {
    const cognitionNodes = knowledgeGraphData.nodes.filter(n => n.layer === 'cognition');
    const perceptionNodes = knowledgeGraphData.nodes.filter(n => n.layer === 'perception');

    const cognitionIdx = cognitionNodes.findIndex(n => n.id === nodeId);
    const perceptionIdx = perceptionNodes.findIndex(n => n.id === nodeId);

    if (cognitionIdx !== -1) {
      // 4 cognition nodes spread across width
      const spacing = 280 / (cognitionNodes.length + 1);
      return { x: spacing * (cognitionIdx + 1), y: 20 };
    } else if (perceptionIdx !== -1) {
      // 5 perception nodes spread across width
      const spacing = 280 / (perceptionNodes.length + 1);
      return { x: spacing * (perceptionIdx + 1), y: 80 };
    }
    return { x: 0, y: 0 };
  };

  const renderNodeIcon = (icon: GraphNode['icon']) => {
    switch (icon) {
      case 'person': return <PersonIcon />;
      case 'location': return <LocationIcon />;
      case 'object': return <ObjectIcon />;
      case 'analyse': return <AnalyseIcon />;
      case 'research': return <ResearchIcon />;
      case 'study': return <StudyIcon />;
    }
  };

  const cognitionNodes = knowledgeGraphData.nodes.filter(n => n.layer === 'cognition');
  const perceptionNodes = knowledgeGraphData.nodes.filter(n => n.layer === 'perception');

  return (
    <section className="module-section process-section" id="how-it-works">
      <div className="container-v2">
        <p className="module-eyebrow">{content.eyebrow}</p>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        {/* Process Pipeline */}
        <div className="pipeline">
          {/* Cards Row */}
          <div className="pipeline-cards">
            {/* INGEST */}
            <div className="pipeline-stage">
              <div className="card card-ingest">
                <div className="ingest-grid">
                  <div className="input-box input-active">
                    <VideoIcon />
                    <span>Video</span>
                  </div>
                  <div className="input-box">
                    <TextIcon />
                    <span>Text</span>
                  </div>
                  <div className="input-box">
                    <AudioIcon />
                    <span>Audio</span>
                  </div>
                  <div className="input-box">
                    <ActionsIcon />
                    <span>Actions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="pipeline-arrow">
              <svg viewBox="0 0 40 16" fill="none">
                <path d="M0 8H32M32 8L26 3M32 8L26 13" stroke="#D1D1D1" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* ENRICH */}
            <div className="pipeline-stage pipeline-stage-enrich">
              <div className="card card-enrich">
                {/* Main content area with graph and labels */}
                <div className="enrich-content">
                  {/* Left side: Node graph with edges */}
                  <div className="enrich-graph">
                    {/* Cognition Layer - Entity Nodes */}
                    <div className="kg-row kg-row-cognition">
                      {cognitionNodes.map(node => (
                        <div key={node.id} className={`kg-node ${node.active ? 'kg-node-active' : ''}`}>
                          {renderNodeIcon(node.icon)}
                        </div>
                      ))}
                    </div>

                    {/* SVG Edges connecting nodes */}
                    <svg className="kg-edges" viewBox="0 0 192 28">
                      {/* Cognition centers (4 nodes, offset 20px): 36, 76, 116, 156 */}
                      {/* Perception centers (5 nodes): 16, 56, 96, 136, 176 */}

                      {/* Cross connections between layers */}
                      <line x1="36" y1="0" x2="16" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="36" y1="0" x2="56" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="76" y1="0" x2="56" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="76" y1="0" x2="96" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="116" y1="0" x2="96" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="116" y1="0" x2="136" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="156" y1="0" x2="136" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="156" y1="0" x2="176" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>

                      {/* Horizontal connections in cognition layer */}
                      <line x1="48" y1="0" x2="64" y2="0" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="88" y1="0" x2="104" y2="0" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="128" y1="0" x2="144" y2="0" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>

                      {/* Horizontal connections in perception layer */}
                      <line x1="28" y1="28" x2="44" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="68" y1="28" x2="84" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="108" y1="28" x2="124" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="148" y1="28" x2="164" y2="28" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                    </svg>

                    {/* Perception Layer - Evidence Nodes */}
                    <div className="kg-row kg-row-perception">
                      {perceptionNodes.map(node => (
                        <div key={node.id} className={`kg-node ${node.active ? 'kg-node-active' : ''}`}>
                          {renderNodeIcon(node.icon)}
                        </div>
                      ))}
                    </div>

                    {/* Vertical arrows from perception nodes to timeline */}
                    <svg className="kg-vertical-arrows" viewBox="0 0 192 16">
                      {/* Vertical dashed lines from perception nodes (5 nodes): 16, 56, 96, 136, 176 */}
                      <line x1="16" y1="0" x2="16" y2="16" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="56" y1="0" x2="56" y2="16" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="96" y1="0" x2="96" y2="16" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="136" y1="0" x2="136" y2="16" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                      <line x1="176" y1="0" x2="176" y2="16" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="3 2"/>
                    </svg>

                    {/* Timeline */}
                    <div className="kg-timeline">
                      <img src="/3 Stages/Module Parts/Timeline.svg" alt="Timeline" className="timeline-svg" />
                    </div>
                  </div>

                  {/* Connecting arrows from graph to labels */}
                  <div className="enrich-arrows">
                    <svg viewBox="0 0 24 100" preserveAspectRatio="none">
                      {/* Arrow to Cognition Layer - aligned with cognition row */}
                      <path d="M0 12 L18 12" stroke="#D1D1D1" strokeWidth="1" fill="none" markerEnd="url(#arrowhead)" />
                      {/* Arrow to Perception Layer - aligned with perception row */}
                      <path d="M0 42 L18 42" stroke="#D1D1D1" strokeWidth="1" fill="none" markerEnd="url(#arrowhead)" />
                      {/* Arrow to Physical Layer - aligned with timeline */}
                      <path d="M0 82 L18 82" stroke="#D1D1D1" strokeWidth="1" fill="none" markerEnd="url(#arrowhead)" />
                      <defs>
                        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                          <path d="M0 0 L6 3 L0 6 Z" fill="#D1D1D1" />
                        </marker>
                      </defs>
                    </svg>
                  </div>

                  {/* Right side: Layer labels */}
                  <div className="enrich-labels">
                    <div className="layer-label">
                      <img src="/3 Stages/Module Parts/Rectangle 8.svg" alt="" />
                      <span>Cognition Layer</span>
                    </div>
                    <div className="layer-label">
                      <img src="/3 Stages/Module Parts/Rectangle 8.svg" alt="" />
                      <span>Perception Layer</span>
                    </div>
                    <div className="layer-label">
                      <img src="/3 Stages/Module Parts/Rectangle 8.svg" alt="" />
                      <span>Physical Layer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="pipeline-arrow">
              <svg viewBox="0 0 40 16" fill="none">
                <path d="M0 8H32M32 8L26 3M32 8L26 13" stroke="#D1D1D1" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* RECALL */}
            <div className="pipeline-stage">
              <div className="card card-recall">
                <div className="recall-layout">
                  {/* Left: Mini graph + Profiles */}
                  <div className="recall-left">
                    <div className="mini-kg">
                      <div className="mini-kg-nodes">
                        <div className="mini-node"><PersonIcon /></div>
                        <div className="mini-node"><LocationIcon /></div>
                        <div className="mini-node mini-node-active"><ObjectIcon /></div>
                      </div>
                      <svg className="mini-kg-lines" viewBox="0 0 100 30">
                        <line x1="20" y1="25" x2="50" y2="25" stroke="#D1D1D1" strokeWidth="1"/>
                        <line x1="20" y1="8" x2="30" y2="25" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="2 2"/>
                        <line x1="50" y1="8" x2="40" y2="25" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="2 2"/>
                        <line x1="80" y1="8" x2="60" y2="25" stroke="#D1D1D1" strokeWidth="1" strokeDasharray="2 2"/>
                      </svg>
                      <div className="mini-timeline"></div>
                    </div>
                    <div className="profiles-box">
                      <UserProfileIcon />
                      <span>Human Profiles</span>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="recall-arrow">
                    <svg viewBox="0 0 32 16" fill="none">
                      <path d="M0 8H24M24 8L18 3M24 8L18 13" stroke="#D1D1D1" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {/* Logo */}
                  <div className="recall-logo">
                    <img src="/3 Stages/Module Parts/Logo Graphic.svg" alt="OmniMemory" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Labels - Isolated at Bottom */}
          <div className="pipeline-labels">
            <div className="stage-info">
              <h4 className="stage-label">{content.steps[0]?.title}</h4>
              <p className="stage-desc">{content.steps[0]?.description}</p>
            </div>
            <div className="stage-info stage-info-enrich">
              <h4 className="stage-label">{content.steps[1]?.title}</h4>
              <p className="stage-desc">{content.steps[1]?.description}</p>
            </div>
            <div className="stage-info">
              <h4 className="stage-label">{content.steps[2]?.title}</h4>
              <p className="stage-desc">{content.steps[2]?.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Icon Components for Process Graph
function VideoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 47 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44.8354 19.9931H14.3534L43.6875 11.0248C44.5053 10.7748 44.9655 9.90916 44.7156 9.0913L42.2711 1.09574C42.1511 0.703023 41.8798 0.374081 41.5173 0.181303C41.1547 -0.0115726 40.7301 -0.0524122 40.3377 0.0676872H40.3376L1.09567 12.0651C0.702859 12.1852 0.374013 12.4563 0.181234 12.819C-0.011544 13.1817 -0.0523836 13.6059 0.067619 13.9986L2.44454 21.7729V44.9458C2.44454 47.4842 4.50984 49.5495 7.04829 49.5495H41.7799C44.3185 49.5495 46.3838 47.4842 46.3838 44.9458V21.5415C46.3838 20.6864 45.6905 19.9931 44.8354 19.9931ZM20.4186 9.39586L27.9854 7.08242L32.9882 11.0575L25.4215 13.3708L20.4186 9.39586ZM21.8267 14.47L14.26 16.7834L9.25711 12.8083L16.8239 10.4948L21.8267 14.47ZM5.66226 13.9074L10.6652 17.8825L5.02092 19.6081L3.48179 14.5741L5.66226 13.9074ZM36.5832 9.95852L31.5803 5.98343L39.7624 3.48196L41.3014 8.51606L36.5832 9.95852ZM43.2869 44.9458C43.2869 45.7767 42.611 46.4527 41.7799 46.4527H7.04829C6.21737 46.4527 5.54138 45.7767 5.54138 44.9458V23.0899H43.2869V44.9458ZM18.8747 41.6146C19.1144 41.7529 19.3816 41.8221 19.649 41.8221C19.9163 41.8221 20.1835 41.7529 20.4232 41.6146L29.9535 36.1123C30.4325 35.8357 30.7277 35.3245 30.7277 34.7714C30.7277 34.2181 30.4325 33.707 29.9535 33.4304L20.4232 27.9281C19.944 27.6516 19.3539 27.6515 18.8747 27.9281C18.3957 28.2047 18.1005 28.716 18.1005 29.2691V40.2738C18.1005 40.8268 18.3956 41.3379 18.8747 41.6146ZM21.1974 31.9508L26.0824 34.7713L21.1974 37.5917V31.9508Z" fill="currentColor"/>
    </svg>
  )
}

function TextIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6H8C6.34315 6 5 7.34315 5 9V31C5 32.6569 6.34315 34 8 34H32C33.6569 34 35 32.6569 35 31V9C35 7.34315 33.6569 6 32 6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 14H29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M11 20H29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M11 26H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function AudioIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4V36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 10V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M4 16V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 10V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M36 16V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function ActionsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 36L20 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 20H4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M36 20H32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M14 20L18 24L26 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21C12 21 19 15.5 19 10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10C5 15.5 12 21 12 21Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function ObjectIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function AnalyseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ResearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 3H19C20.1046 3 21 3.89543 21 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function StudyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L2 9L12 15L22 9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M2 15L12 21L22 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ImageAnchorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <path d="M21 15L16 10L6 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function VideoAnchorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 9L15 12L10 15V9Z" fill="currentColor"/>
    </svg>
  )
}

function AudioAnchorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function UserProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function AgentIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="agent-gradient" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#01BCB2"/>
          <stop offset="0.5" stopColor="#9727FF"/>
          <stop offset="1" stopColor="#002C79"/>
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path
          key={i}
          d={`M24 24 L${24 + 18 * Math.cos((i * 45 * Math.PI) / 180)} ${24 + 18 * Math.sin((i * 45 * Math.PI) / 180)} Q${24 + 12 * Math.cos(((i * 45 + 22.5) * Math.PI) / 180)} ${24 + 12 * Math.sin(((i * 45 + 22.5) * Math.PI) / 180)} ${24 + 18 * Math.cos(((i + 1) * 45 * Math.PI) / 180)} ${24 + 18 * Math.sin(((i + 1) * 45 * Math.PI) / 180)} Z`}
          fill="url(#agent-gradient)"
          opacity={0.7 + (i % 3) * 0.1}
        />
      ))}
    </svg>
  )
}

function AgentOrbIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="orb-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3da6a6"/>
          <stop offset="50%" stopColor="#754aad"/>
          <stop offset="100%" stopColor="#471D8F"/>
        </linearGradient>
        <linearGradient id="orb-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0092B8"/>
          <stop offset="50%" stopColor="#cc3d8f"/>
          <stop offset="100%" stopColor="#471D8F"/>
        </linearGradient>
      </defs>
      {/* Swirling petals */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const angle = (i * 36 * Math.PI) / 180
        const nextAngle = ((i + 1) * 36 * Math.PI) / 180
        const innerR = 6
        const outerR = 20
        const curveOffset = 8
        return (
          <path
            key={i}
            d={`M24 24
               Q${24 + curveOffset * Math.cos(angle + 0.3)} ${24 + curveOffset * Math.sin(angle + 0.3)}
                ${24 + outerR * Math.cos(angle)} ${24 + outerR * Math.sin(angle)}
               Q${24 + outerR * Math.cos((angle + nextAngle) / 2)} ${24 + outerR * Math.sin((angle + nextAngle) / 2)}
                ${24 + outerR * Math.cos(nextAngle)} ${24 + outerR * Math.sin(nextAngle)}
               Q${24 + curveOffset * Math.cos(nextAngle - 0.3)} ${24 + curveOffset * Math.sin(nextAngle - 0.3)}
                24 24 Z`}
            fill={i % 2 === 0 ? "url(#orb-grad-1)" : "url(#orb-grad-2)"}
            opacity={0.6 + (i % 3) * 0.12}
          />
        )
      })}
    </svg>
  )
}

// ============ PARTNERS MARQUEE ============
function PartnersMarquee({ content }: { content: PartnersContent }) {
  const marqueePartners = Array.from({ length: 3 }, () => content.partners).flat()
  return (
    <section className="partners-marquee-section">
      <div className="partners-marquee-wrapper">
        <div className="partners-marquee">
          {[0, 1].map((groupIndex) => (
            <div className="partners-marquee-group" key={groupIndex} aria-hidden={groupIndex === 1}>
              {marqueePartners.map((partner, i) => (
                <div key={`${groupIndex}-${partner.name}-${i}`} className="partners-marquee-item">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={groupIndex === 0 ? partner.nameCn || partner.name : ''}
                      className={[
                        'partner-logo-img',
                        partner.fullColor ? 'partner-logo-img--full-color' : '',
                        partner.logoClassName ?? '',
                      ].filter(Boolean).join(' ')}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <span className={partner.logo ? 'hidden' : ''}>{partner.nameCn || partner.name}</span>
                  <span className="dot"></span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ TESTIMONIALS SECTION ============
function TestimonialsSection({ content }: { content: TestimonialsContent }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const storyCount = content.items.length
  const activeItem = content.items[activeIndex] ?? content.items[0]

  if (!activeItem) return null

  function showPreviousStory() {
    setActiveIndex((current) => (current - 1 + storyCount) % storyCount)
  }

  function showNextStory() {
    setActiveIndex((current) => (current + 1) % storyCount)
  }

  return (
    <section className="testimonial-section-v2">
      <div className="testimonial-bg">
        <img src="/Visual/data image.jpg" alt="" className="testimonial-bg-image" />
        <div className="testimonial-bg-overlay" />
      </div>
      <div className="container-v2">
        <p className="module-eyebrow" style={{ color: 'rgb(var(--teal))' }}>{content.eyebrow}</p>
        <h2 className="module-title-light">{content.title}</h2>
        <div className="testimonial-content-v2">
          <div className="testimonial-carousel-v2" aria-roledescription="carousel" aria-label={content.eyebrow}>
            <button
              type="button"
              className="testimonial-nav-button-v2"
              onClick={showPreviousStory}
              aria-label="Previous customer story"
            >
              <ChevronLeft size={28} aria-hidden />
            </button>
            <article key={activeIndex} className="testimonial-slide-v2" aria-live="polite">
              <div className="testimonial-page-count-v2">{activeIndex + 1} / {storyCount}</div>
              <blockquote className="testimonial-quote-v2">
                &ldquo;{activeItem.quote}&rdquo;
              </blockquote>
          <div className="testimonial-author-v2">
            <span>— {activeItem.name}, {activeItem.title}</span>
          </div>
            </article>
            <button
              type="button"
              className="testimonial-nav-button-v2"
              onClick={showNextStory}
              aria-label="Next customer story"
            >
              <ChevronRight size={28} aria-hidden />
            </button>
          </div>
          <div className="testimonial-dots-v2">
            <span className="testimonial-fixed-dot-v2" aria-hidden />
            <span className="testimonial-dots-label">客户故事</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ PRICING SECTION ============
function PricingSection({
  content,
  eyebrowTone = 'default',
  onContactClick,
}: {
  content: PricingContent
  eyebrowTone?: 'default' | 'cyan'
  onContactClick?: () => void
}) {
  return (
    <section className="module-section" id="pricing">
      <div className="container-v2">
        <SectionEyebrow icon="pricing" tone={eyebrowTone}>{content.eyebrow}</SectionEyebrow>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        <div className="pricing-intro-note">
          <span>{content.modesLabel}</span>
          <div className="pricing-mode-tags">
            {content.modes.map((mode) => (
              <span key={mode} className="pricing-mode-tag">{mode}</span>
            ))}
          </div>
          <p className="pricing-contact-note">{content.contactNote}</p>
        </div>

        <div className="pricing-grid-v2">
          {content.plans.map((plan, i) => (
            <PricingPlanCard key={i} plan={plan} onContactClick={onContactClick} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingPlanCard({
  plan,
  onContactClick,
}: {
  plan: PricingContent['plans'][number]
  onContactClick?: () => void
}) {
  const isFeatured = plan.badge.includes('Enterprise') || plan.badge.includes('企业')
  const opensContact = isContactCta(plan.cta)

  return (
    <div className={`pricing-card-v2 ${isFeatured ? 'featured' : ''}`}>
      <span className="pricing-badge">{plan.badge}</span>
      <h3 className="pricing-plan-name">{plan.name}</h3>
      <div className="pricing-price">{plan.price}<span className="pricing-period">{plan.period}</span></div>
      <ul className="pricing-features-v2">
        {plan.features.map((feature, j) => (
          <li key={j} className="pricing-feature-v2">
            <Check size={16} className="check-icon" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn-pricing"
        onClick={opensContact ? onContactClick : undefined}
      >
        {plan.cta}
      </button>
    </div>
  )
}

function isContactCta(label: string) {
  const normalized = label.trim().toLowerCase()
  return normalized.includes('contact') || normalized.includes('talk') || normalized.includes('联系')
}

// ============ FAQ SECTION ============
function FaqSection({ content }: { content: FaqContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="module-section module-gray" id="faq">
      <div className="container-v2">
        <p className="module-eyebrow">{content.eyebrow}</p>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        <div className="faq-grid">
          {content.items.map((item, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
              <button className="faq-trigger" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span>{item.question}</span>
                <span className="faq-icon">{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ CTA SECTION ============
function CtaSection({
  content,
  onContactClick,
}: {
  content: CtaContent
  onContactClick?: () => void
}) {
  const secondaryOpensContact = isContactCta(content.secondaryCta)

  return (
    <section className="cta-section-v2">
      <div className="cta-bg">
        <img src="/Visual/Visual-Human-Particles 时间粒子.jpg" alt="" />
        <div className="cta-overlay" />
      </div>
      <div className="container-v2 cta-content">
        <h2 className="cta-title">{content.title}</h2>
        <p className="cta-description">{content.description}</p>
        <div className="cta-buttons">
          <a href="/dashboard" className="btn-cta-primary">{content.primaryCta}</a>
          {secondaryOpensContact ? (
            <button type="button" className="btn-cta-secondary" onClick={onContactClick}>
              {content.secondaryCta}
            </button>
          ) : (
            <a href="/docs" className="btn-cta-secondary">{content.secondaryCta}</a>
          )}
        </div>
      </div>
    </section>
  )
}

// ============ FOOTER SECTION ============
function FooterSection({ content, companyName }: { content: FooterContent; companyName?: string }) {
  return (
    <footer className="footer-v2">
      <div className="container-v2">
        {/* Top Section: Brand + 3 Link Columns */}
        <div className="footer-grid-v2">
          <div className="footer-brand-v2">
            <div className="footer-logo-v2">
              <img src="/Logo/SVG/Logo-Graphic-OmniMemory_White.svg" alt="" width={32} height={32} />
              <span>{content.brandName}</span>
            </div>
            <p className="footer-tagline-v2">{content.tagline}</p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">USE CASE</h4>
            <a href="#" className="footer-link-v2">AI Assistants</a>
            <a href="#" className="footer-link-v2">Healthcare</a>
            <a href="#" className="footer-link-v2">Customer Service</a>
            <a href="#" className="footer-link-v2">Education</a>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">SOLUTION</h4>
            <a href="#how-it-works" className="footer-link-v2">How it Works</a>
            <a href="#enterprise" className="footer-link-v2">Enterprise</a>
            <a href="/docs" className="footer-link-v2">Documentation</a>
            <a href="#pricing" className="footer-link-v2">Pricing</a>
          </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">CONTACT</h4>
              <span className="footer-link-v2">E. alice@omnimemory.ai</span>
              <a href="tel:15058996662" className="footer-link-v2">P. 15058996662</a>
              <a href="https://omnimemory.ai" className="footer-link-v2">W. omnimemory.ai</a>
            </div>
        </div>

        {/* Middle Section: Social Icons + Subscription */}
        <div className="footer-middle">
          <div className="footer-social-v2">
            <a href="#" className="social-icon"><X size={20} /></a>
            <a href="#" className="social-icon"><Linkedin size={20} /></a>
            <a href="#" className="social-icon"><Github size={20} /></a>
            <a href="#" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
          <div className="footer-subscribe">
            <h4 className="footer-subscribe-title">SUBSCRIPTION</h4>
            <form className="footer-subscribe-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="footer-subscribe-input"
                required
              />
              <button type="submit" className="footer-subscribe-btn">SUBMIT</button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Copyright + Nav Links */}
        <div className="footer-bottom-v2">
          <div className="flex flex-col gap-1">
            <span>{content.copyright}</span>
            {companyName ? (
              <span className="text-sm text-white/65">{companyName}</span>
            ) : null}
          </div>
          <div className="footer-bottom-links">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="/docs">API</a>
            <a href="/careers">Join us</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============ UTILITIES ============
function getLocaleFromPathname({ pathname }: { pathname: string }): Locale | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  if (!segment) return null
  if (SUPPORTED_LOCALES.includes(segment as Locale)) return segment as Locale
  return null
}

function buildLocalePathname({ pathname, locale }: { pathname: string; locale: Locale }): string {
  // For English (default), no prefix needed
  // For other locales, add prefix
  if (locale === 'en') {
    return pathname
  }
  // Don't double-prefix if already has locale
  if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
    return pathname
  }
  return `/${locale}${pathname}`
}

function getMarketingNavLinks({ navLinks, locale }: { navLinks: NavLink[]; locale: Locale }) {
  return navLinks.map((link) => {
    if (!link.dropdown) return link

    const hasOpenClawLink = link.dropdown.some((item) => item.href === ROUTE_PATHS.openclawPlugin)
    const hasMemAuraLink = link.dropdown.some((item) => item.href === ROUTE_PATHS.memAura)
    const isPlaceholderSolutionsMenu = link.dropdown.length > 0 &&
      link.dropdown.every((item) =>
        item.href === '#' ||
        item.href === ROUTE_PATHS.openclawPlugin ||
        item.href === ROUTE_PATHS.memAura
      )

    if (!isPlaceholderSolutionsMenu) return link

    return {
      ...link,
      dropdown: [
        ...link.dropdown,
        ...(!hasMemAuraLink ? [{
          label: locale === 'zh' ? 'memAura 新基座' : 'memAura Memory Base',
          href: ROUTE_PATHS.memAura,
        }] : []),
        ...(!hasOpenClawLink ? [{
          label: locale === 'zh' ? 'OpenClaw记忆插件 🔥' : 'OpenClaw Memory Plugin 🔥',
          href: ROUTE_PATHS.openclawPlugin,
        }] : []),
      ],
    }
  })
}

function getRouteFromPathname({ pathname }: { pathname: string }): RouteKey {
  const strippedPath = stripLocaleFromPathname({ pathname })
  if (strippedPath.startsWith(ROUTE_PATHS.docs)) return 'docs'
  if (strippedPath.startsWith(ROUTE_PATHS.faq)) return 'faq'
  if (strippedPath.startsWith(ROUTE_PATHS.openclawPlugin)) return 'openclawPlugin'
  if (strippedPath.startsWith(ROUTE_PATHS.memAura)) return 'memAura'
  if (strippedPath.startsWith(ROUTE_PATHS.apiKeys)) return 'apiKeys'
  if (strippedPath.startsWith(ROUTE_PATHS.uploads)) return 'uploads'
  if (strippedPath.startsWith(ROUTE_PATHS.usage)) return 'usage'
  if (strippedPath.startsWith(ROUTE_PATHS.memoryPolicy)) return 'memoryPolicy'
  if (strippedPath.startsWith(ROUTE_PATHS.profile)) return 'profile'
  if (strippedPath.startsWith(ROUTE_PATHS.dashboard)) return 'dashboard'
  if (strippedPath.startsWith(ROUTE_PATHS.signIn)) return 'signIn'
  if (strippedPath.startsWith(ROUTE_PATHS.signUp)) return 'signUp'
  if (strippedPath.startsWith(ROUTE_PATHS.passwordReset)) return 'passwordReset'
  if (strippedPath.startsWith(ROUTE_PATHS.updatePassword)) return 'updatePassword'
  return 'marketing'
}

function stripLocaleFromPathname({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return '/'
  const [firstSegment, ...rest] = segments
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return `/${rest.join('/')}`
  }
  return `/${segments.join('/')}`
}

function getBrowserPathname() {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

function getDashboardTitle(routeKey: RouteKey, locale: Locale) {
  if (locale === 'zh') {
    switch (routeKey) {
      case 'apiKeys': return 'API 密钥'
      case 'uploads': return '上传任务'
      case 'usage': return '用量'
      case 'memoryPolicy': return '记忆策略'
      case 'profile': return '个人资料'
      default: return '个人空间概览'
    }
  }
  switch (routeKey) {
    case 'apiKeys': return 'API Keys'
    case 'uploads': return 'Uploads'
    case 'usage': return 'Usage'
    case 'memoryPolicy': return 'Memory Policy'
    case 'profile': return 'Profile'
    default: return 'Dashboard Overview'
  }
}

function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  // Check path locale first
  const pathLocale = getLocaleFromPathname({ pathname: window.location.pathname })
  if (pathLocale) return pathLocale
  // Check stored preference
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale as Locale)) {
    return storedLocale as Locale
  }
  return 'en'
}

// IP-based locale detection for automatic language routing
async function detectLocaleFromIP(): Promise<Locale | null> {
  try {
    // Use a free IP geolocation API
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000) // 3 second timeout
    })
    if (!response.ok) return null
    const data = await response.json()
    // Check if user is in China (country_code: CN)
    if (data.country_code === 'CN' || data.country === 'China') {
      return 'zh'
    }
    return 'en'
  } catch {
    // Fallback on any error (timeout, network, etc.)
    return null
  }
}

// ============ CONSTANTS ============
const LOCALE_STORAGE_KEY = 'omni-memory-locale'
const IP_LOCALE_CHECKED_KEY = 'omni-memory-ip-locale-checked'
const SUPPORTED_LOCALES: Locale[] = ['en', 'zh']

const ROUTE_PATHS = {
  home: '/',
  docs: '/docs',
  faq: '/faq',
  openclawPlugin: '/solutions/openclaw-memory-plugin',
  memAura: '/solutions/mem-aura',
  dashboard: '/dashboard',
  apiKeys: '/dashboard/api-keys',
  uploads: '/dashboard/uploads',
  usage: '/dashboard/usage',
  memoryPolicy: '/dashboard/memory-policy',
  profile: '/dashboard/profile',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  passwordReset: '/auth/password-reset',
  updatePassword: '/update-password',
} as const

// ============ CODE SAMPLES ============
const CODE_SAMPLE_PYTHON = `from omem import Memory

mem = Memory(api_key="qbk_xxx")  # That's it!

# Save a conversation
mem.add("conv-001", [
    {"role": "user", "content": "Meeting with Caroline tomorrow"},
    {"role": "assistant", "content": "Got it, I will remember"},
])

# Search memories
result = mem.search("When is my meeting?")
if result:
    print(result.to_prompt())`

const CODE_SAMPLE_JS = `import { Memory } from 'omem'

const mem = new Memory({ apiKey: 'qbk_xxx' })

// Save a conversation
await mem.add('conv-001', [
  { role: 'user', content: 'Meeting with Caroline tomorrow' },
  { role: 'assistant', content: 'Got it, I will remember' },
])

// Search memories
const result = await mem.search('When is my meeting?')
if (result) {
  console.log(result.toPrompt())
}`

const CODE_SAMPLE_REST = `# Save a conversation
curl -X POST "https://api.omnimemory.ai/v1/memory/ingest" \\
  -H "x-api-key: qbk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"session_id": "conv-001", "turns": [...]}'

# Search memories
curl -X POST "https://api.omnimemory.ai/v1/memory/retrieval" \\
  -H "x-api-key: qbk_xxx" \\
  -d '{"query": "When is my meeting?", "topk": 10}'`

// ============ CONTENT ============
const contentByLocale: Record<Locale, AppContent> = {
  en: {
    navbar: {
      brandName: 'Omni Memory',
      navLinks: [
        {
          label: 'Developers',
          dropdown: [
            { label: 'Documentation', href: '/docs' },
            { label: 'API', href: '/docs' },
            { label: 'Support', href: '/support' },
          ]
        },
        {
          label: 'Solutions 🔥',
          dropdown: [
            { label: 'AI Companion Robot', href: '#' },
            { label: 'Chatbot', href: '#' },
            { label: 'Robotics', href: '#' },
            { label: 'OpenClaw Memory Plugin 🔥', href: '/solutions/openclaw-memory-plugin' },
          ]
        },
        { label: 'Research', href: '/research' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Docs', href: '/docs' },
        { label: 'Join Us', href: '/careers' },
      ],
      ctaLabel: 'Get Started',
    },
    hero: {
      announcement: 'Thalamic foundation memAura is officially live',
      titleLine1: 'The next generation',
      titleLine2: 'intelligent memory foundation',
      descriptionLead: 'One-stop AI memory solution:',
      descriptionBody:
        'Deep user profiles that evolve dynamically; memory is preserved and tamper-evident; materially better retention—the more you chat, the better it understands users.',
      benefitsEyebrow: 'Platform benefits',
      benefitTags: ['Stronger', 'Faster', 'Leaner'],
      primaryCta: 'Try it now',
      secondaryCta: 'Read the technical whitepaper',
      solutionCta: 'Explore memAura',
      heroStats: [
        { kind: 'percent', num: '50', label: 'Token savings (up to)' },
        { kind: 'percent', num: '80', label: 'Raw evidence retention' },
        { kind: 'latency', maxMs: '500', label: 'Ultra-low response latency' },
        { kind: 'trophy', label: 'SOTA among comparable products' },
      ],
    },
    stats: {
      items: [
        { value: '#1', label: 'LoCoMo Benchmark' },
        { value: '77.8%', label: 'J-Score Accuracy' },
        { value: '<500 ms', label: 'Retrieval Latency' },
      ],
    },
    capabilities: {
      eyebrow: 'Complete Capabilities',
      title: 'From multimodal perception to long-term cognition',
      description: 'memAura turns scattered text, audio, visual signals, and behavioral events into continuously evolving memory assets.',
      groups: [
        {
          label: 'Foundation capabilities',
          items: [
            { title: 'Omnimodal memory', description: 'Unifies text, auditory, visual, and event memories in one long-term memory foundation.' },
            { title: 'High-fidelity memory storage', description: 'Keeps more than 80% raw evidence through event recognition and denoising, reducing hallucination caused by over-summary.' },
            { title: 'Dynamic cognitive profile', description: 'Builds a user cognitive map that separates long-term preferences from short-term emotion and keeps the profile evolving.' },
            { title: 'Cross-session integration', description: 'Breaks session isolation by aggregating persona, habits, constraints, and facts across the full user lifecycle.' },
            { title: 'Temporal reasoning', description: 'Understands effective time, ordering, and expiry rules to judge which memories remain valid.' },
          ],
        },
        {
          label: 'Custom capabilities',
          items: [
            { title: 'Proactive reasoning', description: 'Predicts likely next events from interaction history and profile signals to support proactive intelligence.' },
            { title: 'E2P state injection personalization', description: 'Stably injects preferences into the interaction state for low-cost personality consistency and preference learning.' },
            { title: 'Unified cognition for multi-agent systems', description: 'Shares one memory base across agents, applications, and devices to keep personality and context consistent.' },
          ],
        },
      ],
    },
    features: {
      eyebrow: 'For Enterprise',
      title: 'Production-ready memory infrastructure',
      description: 'Deploy with confidence. Full control over your data and infrastructure.',
      items: [
        { icon: 'shield', tag: 'Privacy', title: 'Self-Hosted Database', description: 'Deploy on your infrastructure with Qdrant + Neo4j. Your data never leaves your servers. Full data sovereignty.' },
        { icon: 'deploy', tag: 'Deploy', title: 'One-Command Setup', description: 'Docker Compose deployment in minutes. Kubernetes-ready. No complex configuration required.' },
        { icon: 'support', tag: 'Support', title: 'Dedicated Team', description: 'SLA-backed enterprise support. Direct access to engineering team. Custom integration assistance.' },
        { icon: 'dashboard', tag: 'Console', title: 'API Dashboard', description: 'Monitor usage, manage API keys, configure memory policies. Full observability into your memory layer.' },
      ],
    },
    howItWorks: {
      eyebrow: 'Process',
      title: 'From ingestion to recall',
      description: 'A simple three-step process to give your AI persistent memory.',
      steps: [
        { title: 'Ingest', description: 'Stream conversations, files, and events into Omni Memory via our simple API.' },
        { title: 'Enrich', description: 'We classify, dedupe, and score memories with decay curves to keep recall fresh.' },
        { title: 'Retrieve', description: 'Query by user, intent, and time horizon. Get policy-filtered context in milliseconds.' },
      ],
    },
    developers: {
      eyebrow: 'For Developers',
      title: 'Deploy with Python / JavaScript / REST',
      description: 'Three lines of code to give your AI persistent memory. Initialize, store conversations, search with graph-enhanced retrieval.',
      primaryCta: 'Read Docs',
      secondaryCta: 'Talk to Us',
      codeTabs: [
        { label: 'Python', code: CODE_SAMPLE_PYTHON },
        { label: 'JavaScript', code: CODE_SAMPLE_JS },
        { label: 'REST', code: CODE_SAMPLE_REST },
      ],
    },
    testimonials: {
      eyebrow: 'Testimonials',
      title: 'Teams building with Omni Memory',
      items: [
        { name: 'Leading companion robotics company in China', title: 'Product Lead', quote: 'The solution you proposed is excellent and exceeded our expectations.' },
        { name: 'Legal-domain Agent company in China', title: 'Technical Lead', quote: 'After integrating Omni Memory, our AI product experience improved significantly, user retention increased noticeably, and our cost consumption also came down.' },
        { name: 'Sarah Chen', title: 'Head of AI, Aurora Labs', quote: 'We replaced three internal services with Omni Memory. Agent latency dropped 40% immediately—it just works.' },
      ],
    },
    partners: {
      label: 'Trusted by leading research institutions and enterprises',
      partners: [
        { name: 'Tsinghua University', nameCn: '清华大学', logo: '/partner/tsinghua.png' },
        { name: 'Peking University', nameCn: '北京大学', logo: '/partner/peking.png' },
        { name: 'The Chinese University of Hong Kong', nameCn: '香港中文大学', logo: '/partner/cuhk.png' },
        { name: 'HKUST', nameCn: '香港科技大学', logo: '/partner/hkust.svg', logoClassName: 'partner-logo-img--hkust' },
        { name: 'NUS', logo: '/partner/nus.png', logoClassName: 'partner-logo-img--nus' },
        { name: 'VU Amsterdam', logo: '/partner/vu-amsterdam.png' },
        { name: 'USC', nameCn: '南加州大学', logo: '/partner/usc.png' },
        { name: 'Virginia Tech', nameCn: '弗吉尼亚理工', logo: '/partner/virginia-tech.png' },
      ],
    },
    pricing: {
      eyebrow: '价格 / PRICING',
      title: 'Plans that scale with you',
      description: 'Start free, upgrade as you grow. Predictable, usage-based pricing.',
      modesLabel: 'Supported billing models',
      modes: ['By device', 'Annual contract', 'QPS / throughput', 'Deployment scope'],
      contactNote: 'Enterprise pricing can be tailored by deployment scope, device fleet, annual usage, and QPS requirements.',
      plans: [
        { badge: 'Starter', name: 'Build', price: 'Free', period: 'forever', cta: 'Start Free', features: ['2M memories', 'Multi-modal API', 'Community support'] },
        { badge: 'Enterprise', name: 'Govern', price: 'Custom', period: '', cta: 'Contact Us', features: ['Unlimited memories', 'Dedicated VPC', 'Custom SLAs', 'Dedicated support'] },
      ],
    },
    costReduction: {
      eyebrow: '降本数据 / PERFORMANCE METRICS',
      title: 'Measured cost optimization data',
      description: 'Full-scenario comparison before and after adopting the memory solution. Input tokens decreased by 49.9% in measurement.',
      note: 'Data is based on memAura production measurements. Actual optimization depends on scenario and business logic.',
      rows: [
        { model: 'Model A', scene: 'Medium usage · 24 rounds/day', beforeTokens: '4,353,720', afterTokens: '2,176,860', beforeCost: '20', afterCost: '17.64', diff: '2.36', ratio: '11.80%' },
        { model: 'Model A', scene: 'Heavy usage · 60 rounds/day', beforeTokens: '20,016,600', afterTokens: '10,008,300', beforeCost: '87.12', afterCost: '76.11', diff: '11.01', ratio: '12.64%' },
        { model: 'Model A', scene: 'Long context · 40 rounds/day · 500 input tokens/round', beforeTokens: '26,134,000', afterTokens: '13,067,000', beforeCost: '98.61', afterCost: '85.98', diff: '12.63', ratio: '12.81%' },
      ],
    },
    customerCase: {
      eyebrow: '客户案例 / INDUSTRY VERTICAL',
      title: 'Long-term emotional memory for companion robots',
      summary: 'A leading home companion robot team uses the memAura architecture to give children’s robots stable long-term emotional memory.',
      backgroundTitle: 'Customer background',
      painTitle: 'Core challenges',
      solutionTitle: 'The OmniMemory Advantage',
      benchmarkTitle: 'Before RAG vs. After OmniMemory',
      metricBeforeLabel: 'Before (RAG)',
      metricAfterLabel: 'After (OmniMemory)',
      metricChangeLabel: 'Change',
      background: 'A leading companion robot brand serves young users aged 18–28 with interactive companionship and emotional support.',
      metrics: [
        { label: 'Hardware shipment', value: '20k devices' },
        { label: 'Daily active users', value: '1,000 DAU' },
      ],
      challenges: [
        'Memory retrieval latency stayed around 500 ms, limiting smooth real-time companionship.',
        'Single-turn interaction consumed about 1.8M tokens, pushing model-call cost too high.',
        '30-day churn stayed high because the robot could not sustain long-term emotional continuity.',
      ],
      solutions: [
        { title: 'Multimodal knowledge vectorization', description: 'Turn visual context and conversation events into durable long-term memory nodes.' },
        { title: 'E2P state injection', description: 'Resume the prior interaction state after restart so emotional continuity is preserved.' },
        { title: 'Lightweight non-invasive adaptation', description: 'Control retrieval latency while protecting privacy and minimizing integration cost.' },
      ],
      benchmark: [
        { dimension: 'Memory retrieval latency', before: '500 ms', after: '400 ms', change: '-20%' },
        { dimension: 'Single interaction TK cost', before: '1.8M', after: '950k', change: '-47%' },
        { dimension: '30-day churn', before: '48%', after: '26%', change: '-22 pct' },
        { dimension: 'Daily active users', before: '1,000', after: '2,300', change: '+130%' },
        { dimension: 'Daily interactions per user', before: '8 rounds', after: '22 rounds', change: '+175%' },
        { dimension: 'Long-term memory recall accuracy', before: '34%', after: '91%', change: '+57 pct' },
      ],
    },
    businessContact: {
      eyebrow: '商务咨询 / BUSINESS CONTACT',
      title: 'Design a deployment and pricing model for your scenario',
      description: 'Pricing can be discussed by device, year, QPS, or deployment scope. Talk to us before choosing a plan.',
      phoneLabel: 'Business / WeChat',
      phone: '15058996662',
      wechat: '15058996662',
      cta: 'Contact us',
      modalEyebrow: 'BUSINESS CONTACT',
      modalTitle: 'Contact our team',
      wechatLabel: 'Business / WeChat contact',
      copyText: 'Copy',
      copiedText: 'Copied',
      copyFailedText: 'Copy failed. Please copy the contact manually.',
      contactFieldLabel: '1. Leave your email or contact information',
      contactPlaceholder: 'Email, phone, or WeChat ID',
      companyTypeLabel: '2. What type of company are you?',
      companyTypeOptions: [
        'AI companion software',
        'AI virtual human / virtual customer service',
        'Smart hardware / IoT',
        'Companion robot',
        'Vertical agent',
        'Embodied AI',
      ],
      submitText: 'Submit registration',
      requiredText: 'Please leave your email or contact information.',
      successText: 'Registered. We will contact you soon.',
      closeLabel: 'Close contact form',
      formHint: 'You can also copy the WeChat contact above and reach us directly.',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Common questions',
      description: 'Everything you need to know about Omni Memory.',
      items: [
        { question: 'What AI models are supported?', answer: 'We normalize across providers. Write once, retrieve across GPT, Claude, Gemini, or custom models.' },
        { question: 'What data types can be stored?', answer: 'Text, audio transcripts, images with context, and structured events. All enriched with entity and intent signals.' },
        { question: 'How do you handle privacy?', answer: 'Automated PII detection, configurable retention, consent tracking, and right-to-forget workflows. SOC 2 Type II certified.' },
        { question: "What's the retrieval latency?", answer: 'P95 recall under 500ms globally with multi-region caching and hybrid retrieval.' },
      ],
    },
    cta: {
      title: 'Give your AI the memory it deserves',
      description: 'Start building with persistent, contextual memory. Free tier available.',
      primaryCta: 'Start Building',
      secondaryCta: 'View Documentation',
    },
    footer: {
      brandName: 'Omni Memory',
      tagline: 'The memory layer for intelligent AI applications.',
      links: [
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Enterprise', href: '#enterprise' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '/faq' },
      ],
      copyright: '© 2025 Omni Memory. All rights reserved.',
    },
  },
  zh: {
    navbar: {
      brandName: 'Omni Memory',
      navLinks: [
        {
          label: '开发者',
          dropdown: [
            { label: '文档', href: '/docs' },
            { label: 'API', href: '/docs/api' },
            { label: '支持', href: '/support' },
          ],
        },
        {
          label: '解决方案 🔥',
          dropdown: [
            { label: 'AI 伴侣机器人', href: '#' },
            { label: '聊天机器人', href: '#' },
            { label: '机器人技术', href: '#' },
          ]
        },
        { label: '研究', href: '/research' },
        { label: '价格', href: '#pricing' },
        { label: '文档', href: '/docs' },
        { label: '加入我们', href: '/careers' },
      ],
      ctaLabel: '开始使用',
    },
    hero: {
      announcement: '丘脑新基座 memAura 正式发布',
      titleLine1: '新一代',
      titleLine2: '智能记忆基座',
      descriptionLead: '一站式 AI 记忆解决方案：',
      descriptionBody: '动态演化的深度用户画像，记忆信息不丢失不篡改，显著提升留存，越聊越懂用户。',
      benefitsEyebrow: '基座效益',
      benefitTags: ['更强', '更快', '更省'],
      primaryCta: '立即体验试用',
      secondaryCta: '查看技术白皮书',
      solutionCta: '了解新基座',
      heroStats: [
        { kind: 'percent', num: '50', label: 'Token 最高节省' },
        { kind: 'percent', num: '80', label: '原始证据留存' },
        { kind: 'latency', maxMs: '500', label: '超低响应延迟' },
        { kind: 'trophy', label: '同类竞品 SOTA 表现' },
      ],
    },
    stats: {
      items: [
        { value: '#1', label: 'LoCoMo 基准测试' },
        { value: '77.8%', label: 'J-Score 准确率' },
        { value: '<1s', label: '检索延迟' },
      ],
    },
    capabilities: {
      eyebrow: '完整功能',
      title: '从全模态感知到长期认知资产',
      description: 'memAura 将文本、听觉、视觉与行为事件统一沉淀为可长期演化的用户记忆资产。',
      groups: [
        {
          label: '基础能力',
          items: [
            { title: '全模态记忆', description: '不仅实现文本记忆，也统一听觉、视觉等模态的长期记忆。' },
            { title: '高保真记忆存储', description: '通过事件识别与降噪保留 80% 以上原始证据，不做过度摘要，从根源降低 AI 幻觉。' },
            { title: '动态认知画像', description: '自动构建用户认知地图，区分长期偏好与短期情绪，让 AI 真正理解用户。' },
            { title: '跨会话整合', description: '聚合不同会话周期中的人设偏好、生活习惯与禁忌诉求，形成完整用户画像。' },
            { title: '时序推理', description: '识别信息生效时间、新旧顺序与过期规则，判断哪段记忆仍然有效。' },
          ],
        },
        {
          label: '定制化能力',
          items: [
            { title: '主动推理', description: '结合互动数据和画像模型预测下一步可能事件，在交互中实现主动智能。' },
            { title: 'E2P 状态注入个性化', description: '稳定注入用户偏好，以超低成本实现人格一致性建模与偏好持续学习。' },
            { title: '多 Agent 统一认知底座', description: '一套记忆支持多场景 Agent 共用，实现跨应用、跨设备的人格一致。' },
          ],
        },
      ],
    },
    features: {
      eyebrow: '企业级部署',
      title: '生产就绪的记忆基础设施',
      description: '自托管部署，全面掌控数据与基础设施。',
      items: [
        { icon: 'shield', tag: '隐私', title: '自托管数据库', description: '在你的基础设施上部署 Qdrant + Neo4j，数据不出域。完全数据主权。' },
        { icon: 'deploy', tag: '部署', title: '一键部署', description: 'Docker Compose 快速部署，支持 Kubernetes，无需复杂配置。' },
        { icon: 'support', tag: '支持', title: '专属团队', description: 'SLA 保障的企业支持，直连工程团队，定制集成协助。' },
        { icon: 'dashboard', tag: '控制台', title: 'API 控制台', description: '监控用量、管理 API Key、配置记忆策略，全面可观测。' },
      ],
    },
    howItWorks: {
      eyebrow: '工作原理',
      title: '从摄取到召回',
      description: '简单三步，让 AI 拥有持久记忆。',
      steps: [
        { title: '摄取', description: '通过 API 写入对话、文件和事件。' },
        { title: '增强', description: '分类、去重与衰减评分，构建长短期记忆。' },
        { title: '检索', description: '按用户与意图检索，毫秒级返回上下文。' },
      ],
    },
    developers: {
      eyebrow: '开发者',
      title: '支持 Python / JavaScript / REST',
      description: '三行代码让你的 AI 拥有持久记忆。初始化、存储对话、图增强检索。',
      primaryCta: '阅读文档',
      secondaryCta: '联系我们',
      codeTabs: [
        { label: 'Python', code: CODE_SAMPLE_PYTHON },
        { label: 'JavaScript', code: CODE_SAMPLE_JS },
        { label: 'REST', code: CODE_SAMPLE_REST },
      ],
    },
    testimonials: {
      eyebrow: '用户故事',
      title: '团队使用 Omni Memory',
      items: [
        { name: '某国内头部陪伴机器人', title: '产品负责人', quote: '我觉得你们给出的方案非常棒，超出预期。' },
        { name: '某国内法律领域Agent', title: '技术负责人', quote: '接入Omni Memory后，我们的AI产品体验提高了很多，用户留存率显著提升，同时我们的成本消耗也降下来了。' },
        { name: 'Sarah Chen', title: 'Aurora Labs AI 负责人', quote: '我们用 Omni Memory 替代了多个内部服务，延迟显著下降。' },
      ],
    },
    partners: {
      label: '顶尖研究机构与企业的信赖',
      partners: [
        { name: 'Tsinghua University', nameCn: '清华大学', logo: '/partner/tsinghua.png' },
        { name: 'Peking University', nameCn: '北京大学', logo: '/partner/peking.png' },
        { name: 'The Chinese University of Hong Kong', nameCn: '香港中文大学', logo: '/partner/cuhk.png' },
        { name: 'HKUST', nameCn: '香港科技大学', logo: '/partner/hkust.svg', logoClassName: 'partner-logo-img--hkust' },
        { name: 'NUS', logo: '/partner/nus.png', logoClassName: 'partner-logo-img--nus' },
        { name: 'VU Amsterdam', logo: '/partner/vu-amsterdam.png' },
        { name: 'USC', nameCn: '南加州大学', logo: '/partner/usc.png' },
        { name: 'Virginia Tech', nameCn: '弗吉尼亚理工', logo: '/partner/virginia-tech.png' },
      ],
    },
    pricing: {
      eyebrow: '价格 / PRICING',
      title: '随你扩展的方案',
      description: '从免费开始，随成长升级。可预测的按量计费。',
      modesLabel: '支持的计费模式',
      modes: ['按台', '按年', '按 QPS / 吞吐量', '按部署规模'],
      contactNote: '企业价格可按部署范围、设备规模、年度用量和 QPS 需求定制，欢迎先咨询商务。',
      plans: [
        { badge: '入门（开发者）', name: '构建', price: '免费', period: '永久', cta: '免费开始', features: ['200万条记忆', '社区支持'] },
        { badge: '企业', name: '治理', price: '定制', period: '', cta: '联系我们', features: ['无限记忆', '主动智能', '多模态', '专属支持'] },
      ],
    },
    costReduction: {
      eyebrow: '降本数据 / PERFORMANCE METRICS',
      title: '实测成本优化数据',
      description: '全场景成本实测对比（接入记忆方案前 VS 接入记忆方案后），输入 tokens 实测降低 49.9%。',
      note: '数据基于 memAura 生产环境实测得出，具体优化效果受场景与业务逻辑影响。',
      rows: [
        { model: '模型A', scene: '中等（每天24轮）', beforeTokens: '4,353,720', afterTokens: '2,176,860', beforeCost: '20', afterCost: '17.64', diff: '2.36', ratio: '11.80%' },
        { model: '模型A', scene: '重度（每天60轮）', beforeTokens: '20,016,600', afterTokens: '10,008,300', beforeCost: '87.12', afterCost: '76.11', diff: '11.01', ratio: '12.64%' },
        { model: '模型A', scene: '长上下文（每天40轮，每轮输入500 token）', beforeTokens: '26,134,000', afterTokens: '13,067,000', beforeCost: '98.61', afterCost: '85.98', diff: '12.63', ratio: '12.81%' },
      ],
    },
    customerCase: {
      eyebrow: '客户案例 / INDUSTRY VERTICAL',
      title: '陪伴机器人深度适配：长效情感记忆机器人',
      summary: '某国内领先的家用陪伴机器人团队，基于 memAura 架构完成了儿童陪伴机器人底层升级。',
      backgroundTitle: '客户背景',
      painTitle: '核心挑战',
      solutionTitle: '解决方案（The OmniMemory Advantage）',
      benchmarkTitle: '传统memory方案 vs. 我们的方案（omnimemory）',
      metricBeforeLabel: '传统memory方案',
      metricAfterLabel: '我们的方案（omnimemory）',
      metricChangeLabel: '变化',
      background: '某国内领先的陪伴机器人品牌，致力于为 18–28 岁年轻人提供互动式陪护与情感支持。',
      metrics: [
        { label: '硬件总销量', value: '2 万台' },
        { label: '传统memory方案日活（DAU）', value: '1,000' },
      ],
      challenges: [
        '记忆检索延迟约 500 ms，影响实时陪伴体验的流畅度。',
        '单次交互 TK 消耗约 180 万，模型调用成本偏高。',
        '30 天退货率达到 48%，长期情感连续性不足。',
      ],
      solutions: [
        { title: '多模态知识矢量化', description: '将视觉上下文与会话事件实时沉淀为长期记忆节点。' },
        { title: 'E2P 状态注入技术', description: '允许机器人在重启后瞬间闪回至上一次交互语境，确保情感连接连续。' },
        { title: '非侵入式轻量化适配', description: '专项脱敏处理并控制检索延迟，降低接入成本。' },
      ],
      benchmark: [
        { dimension: '记忆检索延迟', before: '500 ms', after: '400 ms', change: '-20%' },
        { dimension: '单次交互 TK 消耗', before: '180 万', after: '95 万', change: '-47%' },
        { dimension: '退货率（30天）', before: '48%', after: '26%', change: '-22 pct' },
        { dimension: '日活（DAU）', before: '1,000', after: '2,300', change: '+130%' },
        { dimension: '日均交互轮次', before: '8 轮', after: '22 轮', change: '+175%' },
        { dimension: '长时记忆召回准确率', before: '34%', after: '91%', change: '+57 pct' },
      ],
    },
    businessContact: {
      eyebrow: '商务咨询 / BUSINESS CONTACT',
      title: '为你的场景定制部署与计费方式',
      description: '可按设备、按年、按 QPS 或按部署范围沟通定价。正式选择方案前，先和我们聊聊。',
      phoneLabel: '商务联系',
      phone: '15058996662',
      wechat: '15058996662',
      cta: '联系我们',
      modalEyebrow: 'BUSINESS CONTACT',
      modalTitle: '商务/微信联系',
      wechatLabel: '商务/微信联系',
      copyText: '一键复制',
      copiedText: '已复制',
      copyFailedText: '复制失败，请手动复制联系方式。',
      contactFieldLabel: '1、留下您的邮箱或联系方式',
      contactPlaceholder: '邮箱、手机号或微信号',
      companyTypeLabel: '2、您是什么类型公司？',
      companyTypeOptions: [
        'AI陪伴软件',
        'AI虚拟人/虚拟客服',
        '智能硬件/IoT',
        '陪伴机器人',
        '垂类Agent',
        '具身智能',
      ],
      submitText: '提交登记',
      requiredText: '请留下您的邮箱或联系方式。',
      successText: '已收到登记，我们会尽快联系您。',
      closeLabel: '关闭联系窗口',
      formHint: '也可以直接复制上方微信联系商务。',
    },
    faq: {
      eyebrow: '常见问题',
      title: '常见问题',
      description: '关于 Omni Memory 的常见疑问。',
      items: [
        { question: '支持哪些 AI 模型？', answer: '我们对不同模型提供统一接口，支持 GPT、Claude、Gemini 等。' },
        { question: '可存储哪些数据类型？', answer: '文本、音频转写、带上下文的图像与结构化事件。' },
        { question: '如何处理隐私？', answer: 'PII 检测、保留期配置、同意追踪与删除流程。SOC 2 Type II 认证。' },
        { question: '检索延迟是多少？', answer: 'P95 召回低于 500ms，支持多区域缓存。' },
      ],
    },
    cta: {
      title: '记忆赋予AI生命',
      description: '立即开始使用持久的上下文记忆。免费套餐可用。',
      primaryCta: '开始构建',
      secondaryCta: '查看文档',
    },
    footer: {
      brandName: 'Omni Memory',
      tagline: '智能 AI 应用的记忆层。',
      links: [
        { label: '工作原理', href: '#how-it-works' },
        { label: '企业', href: '#enterprise' },
        { label: '文档', href: '/docs' },
        { label: '价格', href: '#pricing' },
        { label: '常见问题', href: '/faq' },
      ],
      copyright: '© 2025 Omni Memory. 保留所有权利。',
    },
  },
}

// ============ TYPES ============
type Locale = 'en' | 'zh'
type RouteKey =
  | 'marketing'
  | 'docs'
  | 'faq'
  | 'openclawPlugin'
  | 'memAura'
  | 'dashboard'
  | 'apiKeys'
  | 'uploads'
  | 'usage'
  | 'memoryPolicy'
  | 'profile'
  | 'signIn'
  | 'signUp'
  | 'passwordReset'
  | 'updatePassword'

interface AppContent {
  navbar: NavbarContent
  hero: HeroContent
  stats: StatsContent
  capabilities: CapabilitiesContent
  features: FeaturesContent
  howItWorks: HowItWorksContent
  costReduction: CostReductionContent
  developers: DevelopersContent
  customerCase: CustomerCaseContent
  testimonials: TestimonialsContent
  partners: PartnersContent
  pricing: PricingContent
  businessContact: BusinessContactContent
  faq: FaqContent
  cta: CtaContent
  footer: FooterContent
}

interface NavbarContent {
  brandName: string
  navLinks: NavLink[]
  ctaLabel: string
}
interface NavLink {
  label: string
  href?: string
  dropdown?: { label: string; href: string; icon?: string }[]
}
type HeroStatRow =
  | { kind: 'percent'; num: string; label: string }
  | { kind: 'latency'; maxMs: string; label: string }
  | { kind: 'trophy'; label: string }

interface HeroContent {
  announcement: string
  titleLine1: string
  titleLine2: string
  descriptionLead: string
  descriptionBody: string
  benefitsEyebrow: string
  benefitTags: [string, string, string]
  primaryCta: string
  secondaryCta: string
  solutionCta: string
  heroStats: [HeroStatRow, HeroStatRow, HeroStatRow, HeroStatRow]
}
interface StatsContent { items: { value: string; label: string }[] }
interface CapabilityItem { title: string; description: string }
interface CapabilitiesContent {
  eyebrow: string
  title: string
  description: string
  groups: { label: string; items: CapabilityItem[] }[]
}
interface CostReductionContent {
  eyebrow: string
  title: string
  description: string
  note: string
  rows: {
    model: string
    scene: string
    beforeTokens: string
    afterTokens: string
    beforeCost: string
    afterCost: string
    diff: string
    ratio: string
  }[]
}
interface CustomerCaseContent {
  eyebrow: string
  title: string
  summary: string
  backgroundTitle: string
  painTitle: string
  solutionTitle: string
  benchmarkTitle: string
  metricBeforeLabel: string
  metricAfterLabel: string
  metricChangeLabel: string
  background: string
  metrics: { label: string; value: string }[]
  challenges: string[]
  solutions: { title: string; description: string }[]
  benchmark: { dimension: string; before: string; after: string; change: string }[]
}
interface BusinessContactContent {
  eyebrow: string
  title: string
  description: string
  phoneLabel: string
  phone: string
  wechat: string
  cta: string
  modalEyebrow: string
  modalTitle: string
  wechatLabel: string
  copyText: string
  copiedText: string
  copyFailedText: string
  contactFieldLabel: string
  contactPlaceholder: string
  companyTypeLabel: string
  companyTypeOptions: string[]
  submitText: string
  requiredText: string
  successText: string
  closeLabel: string
  formHint: string
}
interface FeaturesContent { eyebrow: string; title: string; description: string; items: { icon: string; tag: string; title: string; description: string }[] }
interface HowItWorksContent { eyebrow: string; title: string; description: string; steps: { title: string; description: string }[] }
interface DevelopersContent { eyebrow: string; title: string; description: string; primaryCta: string; secondaryCta: string; codeTabs: { label: string; code: string }[] }
interface TestimonialsContent { eyebrow: string; title: string; items: { name: string; title: string; quote: string }[] }
interface PartnersContent { label: string; partners: { name: string; nameCn?: string; logo?: string; fullColor?: boolean; logoClassName?: string }[] }
interface PricingContent {
  eyebrow: string
  title: string
  description: string
  modesLabel: string
  modes: string[]
  contactNote: string
  plans: { badge: string; name: string; price: string; period: string; cta: string; features: string[] }[]
}
interface FaqContent { eyebrow: string; title: string; description: string; items: { question: string; answer: string }[] }
interface CtaContent { title: string; description: string; primaryCta: string; secondaryCta: string }
interface FooterContent { brandName: string; tagline: string; copyright: string; links: { label: string; href: string }[] }
