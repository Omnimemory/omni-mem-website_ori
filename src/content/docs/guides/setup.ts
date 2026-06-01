import type { DocPage } from '../types';

// =============================================================================
// Setup Guide - Account & API Key Configuration
// =============================================================================

export const setupGuidePage: DocPage = {
  slug: 'guides/setup',
  title: {
    en: 'Account Setup',
    zh: '账户设置',
  },
  description: {
    en: 'Complete guide to setting up your Omni Memory account and creating API keys.',
    zh: '完整的 Omni Memory 账户设置指南：创建账户并生成 API 密钥。',
  },
  sections: [
    {
      id: 'overview',
      heading: {
        en: 'Overview',
        zh: '概述',
      },
      content: {
        en: `Before using Omni Memory, you need to complete two setup steps:

1. **Create your account** — Access the dashboard and manage your workspace
2. **Create an API Key** — Authenticate your SDK/API calls

Both steps take about 2 minutes total.`,
        zh: `在使用 Omni Memory 之前，您需要完成两个设置步骤：

1. **创建账户** — 进入控制台并管理您的工作区
2. **创建 API 密钥** — 用于 SDK/API 调用的身份验证

两个步骤总共大约需要 2 分钟。`,
      },
    },
    {
      id: 'create-account',
      heading: {
        en: 'Step 1: Create Your Account',
        zh: '第一步：创建账户',
      },
      content: {
        en: `1. Go to [omnimemory.ai](https://omnimemory.ai) and click **Sign Up**
2. Enter your email and create a password
3. Verify your email address
4. You'll be redirected to the Dashboard`,
        zh: `1. 访问 [omnimemory.ai](https://omnimemory.ai) 并点击**注册**
2. 输入您的邮箱并创建密码
3. 验证您的邮箱地址
4. 您将被重定向到控制台`,
      },
    },
    {
      id: 'create-api-key',
      heading: {
        en: 'Step 2: Create an API Key',
        zh: '第二步：创建 API 密钥',
      },
      content: {
        en: `Your API key authenticates all SDK and API requests. Each key starts with \`qbk_\`.

### How to Create

1. Go to **Dashboard → API Keys** (or click "API 密钥" in the sidebar)
2. Click **Create New Key** (创建新密钥)
3. Enter a descriptive label (e.g., "Production", "Development", "My Agent")
4. Click **Create**
5. **Copy the key immediately** — it won't be shown again!

### Best Practices

- **Use separate keys for dev/prod** — Easier debugging and usage tracking
- **Never commit keys to git** — Use environment variables instead
- **Rotate keys periodically** — Security hygiene
- **Label keys descriptively** — Know which app uses which key

### Example Usage

\`\`\`python
import os
from omem import Memory

# Load from environment variable (recommended)
mem = Memory(api_key=os.environ["OMEM_API_KEY"])

# Or directly (for testing only)
mem = Memory(api_key="qbk_your_key_here")
\`\`\``,
        zh: `API 密钥用于验证所有 SDK 和 API 请求。每个密钥以 \`qbk_\` 开头。

### 如何创建

1. 进入**控制台 → API 密钥**（或点击侧边栏的"API 密钥"）
2. 点击**创建新密钥**
3. 输入描述性标签（如"生产环境"、"开发环境"、"我的 Agent"）
4. 点击**创建**
5. **立即复制密钥** — 它不会再次显示！

### 最佳实践

- **为开发/生产使用不同密钥** — 更容易调试和追踪用量
- **不要将密钥提交到 git** — 使用环境变量代替
- **定期轮换密钥** — 安全习惯
- **使用描述性标签** — 知道哪个应用使用哪个密钥

### 使用示例

\`\`\`python
import os
from omem import Memory

# 从环境变量加载（推荐）
mem = Memory(api_key=os.environ["OMEM_API_KEY"])

# 或直接使用（仅用于测试）
mem = Memory(api_key="qbk_your_key_here")
\`\`\``,
      },
    },
  ],
};
