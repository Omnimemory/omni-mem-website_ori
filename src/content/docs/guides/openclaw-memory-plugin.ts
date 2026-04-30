import type { DocPage } from '../types'

export const openClawPluginPage: DocPage = {
  slug: 'guides/openclaw-memory-plugin',
  title: {
    en: 'OpenClaw Memory Plugin 🔥',
    zh: 'OpenClaw记忆插件 🔥',
  },
  description: {
    en: 'Full guide for installing, configuring, and testing the OpenClaw OmniMemory plugin.',
    zh: 'OpenClaw OmniMemory 插件的完整安装、配置与测试指南。',
  },
  sections: [
    {
      id: 'overview',
      heading: {
        en: 'Overview',
        zh: '概览',
      },
      content: {
        en: `# 🧠 OpenClaw OmniMemory Plugin Guide

This plugin gives OpenClaw **long-term memory** and uses the OmniMemory cloud endpoint to store and retrieve conversation content safely.

## What it can do

### 1. Automatically recall past information

Before generating an answer, the plugin can retrieve content that was already remembered.

### 2. Automatically record your conversations

The plugin saves conversation data at these moments:

- Every time a conversation ends (\`agent_end\`)
- Before context compaction (\`before_compaction\`)
- Before reset (\`before_reset\`)`,
        zh: `# 🧠 OpenClaw OmniMemory 插件使用指南

这个插件的作用是：
👉 让 OpenClaw 具备“长期记忆”，并通过云端接口安全存取对话内容。

## 📌 一、这个插件能帮你做什么？

简单来说，它做三件事：

### 1️⃣ 自动“回忆”过去的信息

在生成回答之前，会自动帮你找回之前记住的内容。

### 2️⃣ 自动“记录”你的对话

会在这些时机保存对话：

- 每次对话结束（agent_end）
- 压缩上下文前（before_compaction）
- 重置前（before_reset）`,
      },
    },
    {
      id: 'install',
      heading: {
        en: 'Install',
        zh: '安装',
      },
      content: {
        en: `## ⚙️ Install the plugin

Run this command in your terminal:

\`\`\`bash
openclaw plugins install @omni-pt/omnimemory-overlay
\`\`\`

📌 Use an **absolute path** when required by your runtime environment.`,
        zh: `## ⚙️ 二、安装插件

在终端执行：

\`\`\`bash
openclaw plugins install @omni-pt/omnimemory-overlay
\`\`\`

📌 注意：必须使用**绝对路径**。`,
      },
    },
    {
      id: 'configuration',
      heading: {
        en: 'Configuration',
        zh: '配置',
      },
      content: {
        en: `## ⚙️ Three, configure the plugin

### 1. The API key is required

All memory reads and writes are authenticated through the OmniMemory cloud service, so you need to get your own API key first.

👉 Manual setup steps:

1. Visit:
   https://www.omnimemory.ai/zh/
2. Register and log in with your email.
3. Open the **API Keys** page.
   - Click **Create New API Key**
   - Copy the generated key
4. Open the **Memory Policy** page.
   - Add your own memory extraction model
   - Set the binding scope to **All API Keys**

After that, give the generated \`apiKey\` to OpenClaw so it can configure the plugin.

If smoke testing shows “omnimemory-overlay apiKey is required for SaaS auth”, use these commands to repair the config:

\`\`\`bash
openclaw config set plugins.entries.omnimemory-overlay.config.baseUrl "https://nrswzocoshah.sealoshzh.site/api/v1/memory"
openclaw config set plugins.entries.omnimemory-overlay.config.apiKey "qbk_xxx (platform API key)"
openclaw config set plugins.entries.omnimemory-overlay.config.groupPrefix "openclaw"
openclaw config set plugins.entries.omnimemory-overlay.config.autoRecall true
openclaw config set plugins.entries.omnimemory-overlay.config.autoCapture true
\`\`\``,
        zh: `## ⚙️ 三、配置插件（最关键步骤，默认由openclaw自行配置）

### 1️⃣ apiKey 是必须的

因为这个插件所有的记忆读写都需要通过 OmniMemory 的云端服务进行认证，所以你**必须先让openclaw或者手动在我们的官网免费获取自己的 API Key**。

👉 手动操作步骤如下：

1. 访问官网：
   https://www.omnimemory.ai/zh/
2. 使用邮箱注册账号并登录
3. 进入「API 密钥」页面
   - 点击「新建 API 密钥」
   - 复制生成的 key（后面配置要用）
4. 进入「记忆策略」页面
   - 添加你自己的**记忆抽取模型**（例如你使用的模型平台 + API Key）
   - 在「绑定范围」中选择：
     👉 **所有 API 密钥**

📌 完成以上步骤后，再把你生成的 \`apiKey\` 告诉 OpenClaw，让它帮你配置 omnimemory-overlay 插件即可正常使用。

👉 基于不同底层模型的指令遵循能力差异，如果冒烟测试时会出现“omnimemory-overlay apiKey is required for SaaS auth”这样的报错，请使用以下命令修复：

\`\`\`bash
openclaw config set plugins.entries.omnimemory-overlay.config.baseUrl "https://nrswzocoshah.sealoshzh.site/api/v1/memory"
openclaw config set plugins.entries.omnimemory-overlay.config.apiKey "qbk_xxx（平台 API Key）"
openclaw config set plugins.entries.omnimemory-overlay.config.groupPrefix "openclaw"
openclaw config set plugins.entries.omnimemory-overlay.config.autoRecall true
openclaw config set plugins.entries.omnimemory-overlay.config.autoCapture true
\`\`\``,
      },
    },
    {
      id: 'errors-and-test',
      heading: {
        en: 'Common Errors and Smoke Test',
        zh: '常见错误与冒烟测试',
      },
      content: {
        en: `## ⚠️ Common error

Do **not** write:

\`\`\`
plugins.entries.omnimemory-overlay.baseUrl
\`\`\`

You must write:

\`\`\`
plugins.entries.omnimemory-overlay.config.baseUrl
\`\`\`

If you configured the wrong path before, clean it with:

\`\`\`bash
openclaw config unset plugins.entries.omnimemory-overlay.baseUrl
openclaw config unset plugins.entries.omnimemory-overlay.apiKey
openclaw config unset plugins.entries.omnimemory-overlay.groupPrefix
openclaw config unset plugins.entries.omnimemory-overlay.autoRecall
openclaw config unset plugins.entries.omnimemory-overlay.autoCapture
\`\`\`

## 🧪 Smoke test

1. Start a new OpenClaw session
2. Input:

\`\`\`
Remember that my office snack is sea salt plum candy.
\`\`\`

3. Wait a few seconds for memory ingestion
4. Ask again:

\`\`\`
What is my office snack?
\`\`\`

### Expected result

- The reply mentions **sea salt plum candy**
- The answer comes from memory recall, not from the current prompt`,
        zh: `## ⚠️ 常见错误（很重要）

❌ 不要这样写：

\`\`\`
plugins.entries.omnimemory-overlay.baseUrl
\`\`\`

✅ 必须写成：

\`\`\`
plugins.entries.omnimemory-overlay.config.baseUrl
\`\`\`

### 🧹 如果你之前配错了，可用以下命令清理：

\`\`\`bash
openclaw config unset plugins.entries.omnimemory-overlay.baseUrl
openclaw config unset plugins.entries.omnimemory-overlay.apiKey
openclaw config unset plugins.entries.omnimemory-overlay.groupPrefix
openclaw config unset plugins.entries.omnimemory-overlay.autoRecall
openclaw config unset plugins.entries.omnimemory-overlay.autoCapture
\`\`\`

## 🧪 四、测试插件是否正常工作（推荐）

按照以下步骤验证：

1. 启动一个新的 OpenClaw 会话
2. 输入一句话让它记住：

\`\`\`
Remember that my office snack is sea salt plum candy.
\`\`\`

3. 等几秒（让它完成写入记忆）
4. 再问：

\`\`\`
What is my office snack?
\`\`\`

### ✅ 正常结果

- 回答中提到：👉 **sea salt plum candy**
- 并且这是“记忆出来的”，不是当前对话提供的`,
      },
    },
    {
      id: 'workflow',
      heading: {
        en: 'Internal Workflow',
        zh: '整体工作流程',
      },
      content: {
        en: `## 🧠 Internal workflow

The plugin does two core things internally:

### Read memory

\`\`\`
POST /api/v1/memory/retrieval
\`\`\`

### Write memory

\`\`\`
POST /api/v1/memory/ingest
\`\`\`

These steps are automatic. You do not need to call them manually.

## ✅ One-line summary

This plugin lets OpenClaw:

- remember what you said
- recall it later automatically
- keep data safe and structured`,
        zh: `## 🧠 六、整体工作流程（帮你理解）

插件内部其实做了两件事：

### 📥 读取记忆

\`\`\`
POST /api/v1/memory/retrieval
\`\`\`

### 📤 写入记忆

\`\`\`
POST /api/v1/memory/ingest
\`\`\`

👉 但你不用手动操作，这些都是自动完成的。

## ✅ 一句话总结

👉 这个插件让 OpenClaw：

- 会记住你说过的话
- 会在之后自动想起来
- 并且保证数据安全不混乱`,
      },
    },
  ],
}
