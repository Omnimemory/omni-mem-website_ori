/**
 * Documentation Content Index
 */

export * from './types'

export { conceptsPage } from './concepts'

export {
  pythonSdkPage,
  memoryClass,
  errorHandlingSection,
  multiUserSection,
  tkgFeaturesSection,
} from './sdk/python'

export { javascriptSdkPage } from './sdk/javascript'

export { setupGuidePage } from './guides/setup'
export { agentIntegrationPage } from './guides/agent'
export { multiSpeakerPage } from './guides/multi-speaker'
export { openClawPluginPage } from './guides/openclaw-memory-plugin'

export { pipelinesPage } from './pipelines'

export {
  ingestEndpoint,
  retrievalEndpoint,
  turnSchema,
  memoryEndpoints,
} from './api/memory'

export {
  listApiKeysEndpoint,
  createApiKeyEndpoint,
  uploadDirectEndpoint,
  uploadStatusEndpoint,
  usageSummaryEndpoint,
  balanceEndpoint,
  apiKeyEndpoints,
  uploadEndpoints,
  usageEndpoints,
  managementEndpoints,
} from './api/management'

export { errorsPage } from './reference/errors'
export { limitsPage } from './reference/limits'
export { changelogPage } from './reference/changelog'

import type { DocsNav } from './types'
import { conceptsPage } from './concepts'
import { pythonSdkPage } from './sdk/python'
import { javascriptSdkPage } from './sdk/javascript'
import { setupGuidePage } from './guides/setup'
import { agentIntegrationPage } from './guides/agent'
import { multiSpeakerPage } from './guides/multi-speaker'
import { openClawPluginPage } from './guides/openclaw-memory-plugin'
import { pipelinesPage } from './pipelines'
import { errorsPage } from './reference/errors'
import { limitsPage } from './reference/limits'
import { changelogPage } from './reference/changelog'

export const docsNavigation: DocsNav = {
  sections: [
    {
      title: { en: 'Getting Started', zh: '开始使用' },
      items: [
        {
          title: { en: 'Account Setup', zh: '账户设置' },
          href: '/docs/guides/setup',
          description: { en: 'Create API key & configure LLM (BYOK)', zh: '创建 API 密钥并配置 LLM（BYOK）' },
        },
        {
          title: { en: 'Python SDK', zh: 'Python SDK' },
          href: '/docs/sdk/python',
          description: { en: 'Get memory working in 5 minutes', zh: '5 分钟内让记忆工作起来' },
        },
        {
          title: { en: 'Core Concepts', zh: '核心概念' },
          href: '/docs/concepts',
          description: { en: 'Understand save, search, and retrieval', zh: '理解保存、搜索和检索' },
        },
        {
          title: { en: 'Pipelines', zh: '处理管线' },
          href: '/docs/pipelines',
          description: { en: 'Text vs Video', zh: '文本 vs 视频' },
        },
      ],
    },
    {
      title: { en: 'API Reference', zh: 'API 参考' },
      items: [
        {
          title: { en: 'Memory', zh: '记忆' },
          href: '/docs/api/memory',
          description: { en: 'HTTP endpoints for any language', zh: '适用于任何语言的 HTTP 端点' },
        },
        {
          title: { en: 'Management', zh: '管理' },
          href: '/docs/api/management',
          description: { en: 'API keys and usage', zh: 'API 密钥和用量' },
        },
      ],
    },
    {
      title: { en: 'Guides', zh: '指南' },
      items: [
        {
          title: { en: 'Agent Integration', zh: 'Agent 集成' },
          href: '/docs/guides/agent',
          description: { en: 'Add memory to your LLM agent', zh: '给你的 LLM Agent 添加记忆' },
        },
        {
          title: { en: 'OpenClaw Memory Plugin 🔥', zh: 'OpenClaw记忆插件 🔥' },
          href: '/docs/guides/openclaw-memory-plugin',
          description: { en: 'Full OpenClaw plugin setup and smoke test guide', zh: 'OpenClaw 插件完整安装、配置与冒烟测试指南' },
        },
        {
          title: { en: 'Multi-Speaker', zh: '多说话人' },
          href: '/docs/guides/multi-speaker',
          description: { en: 'Handle conversations with multiple people', zh: '处理多人对话' },
        },
      ],
    },
    {
      title: { en: 'Reference', zh: '参考' },
      items: [
        {
          title: { en: 'Error Codes', zh: '错误码' },
          href: '/docs/reference/errors',
          description: { en: 'Handle failures gracefully', zh: '优雅处理失败' },
        },
        {
          title: { en: 'Limits', zh: '限制' },
          href: '/docs/reference/limits',
          description: { en: 'Rate limits and quotas', zh: '速率限制和配额' },
        },
        {
          title: { en: 'Changelog', zh: '更新日志' },
          href: '/docs/reference/changelog',
        },
      ],
    },
  ],
}

export const allDocPages = [
  setupGuidePage,
  pythonSdkPage,
  javascriptSdkPage,
  conceptsPage,
  pipelinesPage,
  agentIntegrationPage,
  openClawPluginPage,
  multiSpeakerPage,
  errorsPage,
  limitsPage,
  changelogPage,
]
