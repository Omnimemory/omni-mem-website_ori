# 系统前端 dashboard 架构文件

更新时间：2026-01-10  
范围：基于 `omni-mem-website` 总结前端 dashboard 请求、后端链路与预期效果。

## 1. 前端基础与环境

- 框架：Vite + React
- 鉴权：Supabase JS（`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`）
- API 基址：`VITE_API_BASE_URL`（指向 gateway）
- 通用请求头：
  - `Authorization: Bearer <access_token>`
  - `X-Principal-User-Id: <user_id>`（前端带上，gateway 会重新注入内部头）

## 2. 页面级请求清单（前端 → 后端）

### 2.1 认证相关

1) 登录（`src/pages/auth/sign-in.tsx`）
- Supabase：`auth.signInWithPassword(email, password)`
- 预期效果：获得 session / access_token，进入控制台

2) 注册（`src/pages/auth/sign-up.tsx`）
- Supabase：`auth.signInWithOtp(email, shouldCreateUser)` → `auth.verifyOtp` → `auth.updateUser(password, name)`
- 预期效果：完成注册并进入控制台

3) 密码重置（`src/pages/auth/password-reset.tsx` / `update-password.tsx`）
- `POST /auth/password-reset/request`：发送验证码
- `POST /auth/password-reset/verify`：校验验证码并返回 `reset_token`
- `POST /auth/password-reset/confirm`：提交新密码
- 预期效果：完成密码更新并重新登录

### 2.2 控制台概览（`src/pages/dashboard.tsx`）

- `GET /settings/scope`
- `GET /balance`
- `GET /settings/memory-policy`
- `GET /usage/summary?from=...&to=...&groupBy=account|apikey`

预期效果：
- 展示套餐/权益/余额/记忆策略
- 展示按账号或 API Key 的用量汇总
  - Note：配额中的“已用节点”来自 `/settings/scope` 返回的 `qdrant_node_counts`；统计口径以 Qdrant payload 的 `metadata.tenant_id` 或 `metadata.user_id = u:<account_id>` 为准，字段不一致会导致显示为 0。

### 2.3 API Key 管理（`src/pages/api-keys.tsx`）

- `GET /apikeys?page=&pageSize=`：列表
- `POST /apikeys`：创建（携带 `X-Request-Id`）
- `POST /apikeys/:id/reveal`：明文复制（需密码验证）
- `POST /apikeys/:id/rotate`：轮换（legacy；后端当前返回 403 `rotate_disabled`，前端仍保留入口）
- `DELETE /apikeys/:id`：删除

预期效果：
- 创建/管理可用于 SDK 调用的 API Key
  - Note：`/apikeys/:id/revoke` 在当前 api 代码中无实现（旧文档遗留），实际为“删除/禁用”语义。

### 2.4 账户与套餐（`src/pages/profile.tsx`）

- `GET /settings/scope`：加载套餐权益
- `PATCH /settings/account-name`：更新账户显示名
- `POST /settings/scope-upgrade`：使用邀请码升级套餐
- Supabase：`auth.updateUser(email)`（更换绑定邮箱）

预期效果：
- 管理账户资料与套餐

### 2.5 记忆策略与 LLM Key 管理（`src/pages/memory-policy.tsx`）

- `GET /settings/memory-policy`
- `PUT /settings/memory-policy`
- `GET /apikeys?page=1&pageSize=200`
- `GET /llm-keys`
- `POST /llm-keys`
- `PUT /llm-keys/:id`（绑定范围）
- `DELETE /llm-keys/:id`
- `POST /llm-keys/:id/disable` / `POST /llm-keys/:id/enable`
- `GET /llm-models?provider=...`（头部 `X-LLM-Api-Key`）

预期效果：
- 设置记忆隔离策略
- 配置 BYOK/托管 LLM Key

### 2.6 上传任务（`src/pages/uploads.tsx`）

- `POST /uploads/init`：获取 OSS 预签名上传 URL
- 上传文件到 OSS：`PUT <upload_url>`（XHR 直传）
- `GET /uploads/:id`：轮询任务状态
- `GET /uploads/history`：加载历史记录

预期效果：
- 上传会话文件并触发记忆写入
- 查看处理状态与历史用量

### 2.7 用量详情（`src/pages/usage.tsx`）

- `GET /balance`
- `GET /usage/ledger?page=&pageSize=`

预期效果：
- 展示余额与用量账本

## 3. 请求链路与后端处理流程（摘要）

### 3.1 认证类

- Supabase JS → `gotrue`（Auth） → 返回 session/token
- 密码重置：前端 → `gateway` → `api` → Supabase Auth → 返回 reset_token / 更新密码

### 3.2 账户与套餐

- 前端 → `gateway`（Bearer token） → `api`
- `api` 调用 Supabase（`accounts` / `entitlements` / `memory_policy`）
- 返回账户、权益、余额

### 3.3 API Key / LLM Key

- 前端 → `gateway` → `api`
- `api` 调用 Supabase REST（`api_keys` / `llm_keys`）
- `llm-models` 额外调用 LLM Provider 验证 API Key

### 3.4 上传与记忆写入

1) `POST /uploads/init`
- `gateway` → `api`：创建 uploads 记录，预扣配额，生成 OSS 预签名 URL

2) 前端直传 OSS
- 前端 → OSS
- OSS 回调 → `api /uploads/oss-callback` → 入队 `{QUEUE_PREFIX}_upload`

3) `worker` 执行
- 拉取 OSS 文件 → 解析 JSON/JSONL → 调用 `core /ingest/dialog/v1`
- 更新 uploads 状态 + usage_ledger

4) 前端轮询
- `GET /uploads/:id` / `GET /uploads/history`

### 3.5 用量与余额

- 前端 → `gateway` → `api`
- `api` 读取 Supabase `usage_ledger` / `accounts.balance`

## 4. 预期输出与用户可见效果

- 用户能完成注册/登录/密码重置并进入控制台
- 控制台能看到套餐、配额、余额、用量统计
- 能创建/管理 API Key 与 LLM Key
- 能上传数据并查看记忆写入进度
