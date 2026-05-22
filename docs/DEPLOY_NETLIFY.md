# Deploy to Netlify - 部署指南

## 前置条件

- GitHub 账户
- Netlify 账户（可用 GitHub 登录）
- OpenAI-compatible API Key（Mimo、DeepSeek 或其他兼容服务）

## 部署步骤

### 1. 推送到 GitHub

```bash
cd D:\AiProjects2\XiangqinMouthpiece

# 初始化 Git 仓库
git init
git add .
git commit -m "feat: initial commit - 相亲嘴替"

# 创建 GitHub 仓库并推送
# 在 GitHub 上创建新仓库：XiangqinMouthpiece
git remote add origin https://github.com/your-username/XiangqinMouthpiece.git
git branch -M main
git push -u origin main
```

### 2. 在 Netlify 创建项目

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub
4. 选择 `XiangqinMouthpiece` 仓库
5. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. 点击 "Deploy site"

### 3. 配置环境变量

1. 在 Netlify 项目页面，点击 "Site settings"
2. 左侧菜单选择 "Environment variables"
3. 添加以下变量：

| 变量名 | 值 | 标记为 Secret | 说明 |
|--------|-----|---------------|------|
| `MODEL_PROVIDER` | `mimo` | **否** | 可选 - 仅用于标识 |
| `MODEL_API_KEY` | `your_api_key_here` | **是（必须）** | **必填** - API Key |
| `MODEL_BASE_URL` | `从Mimo控制台获取` | **否** | **必填** - 需包含 `/v1` |
| `MODEL_NAME` | `从Mimo控制台获取` | **否** | **必填** - 模型名称 |
| `DEMO_INVITE_CODE` | `your_invite_code` | **是（建议）** | 可选 - 邀请码 |

4. 点击 "Save"

> **重要**：
> - `MODEL_BASE_URL` 必须填写完整的 OpenAI-compatible Base URL，例如 `https://api.mimo.example.com/v1`
> - 后端会拼接 `${MODEL_BASE_URL}/chat/completions` 进行调用
> - 不要把 API Key 写入前端代码或提交到 Git 仓库

### 4. 重新部署

环境变量配置后需要重新部署：

1. 点击 "Deploys" 标签
2. 点击 "Trigger deploy" → "Deploy site"
3. 等待部署完成

### 5. 获取访问地址

1. 部署完成后，点击 "Site settings"
2. 在 "General" → "Site information" 中可以看到：
   - **Production branch**: main
   - **Site name**: `your-site-name.netlify.app`
3. 可以点击 "Change site name" 修改为自定义名称

## 测试 Functions

### 本地测试

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 启动本地开发（同时启动前端和 Functions）
netlify dev

# 或者只启动 functions
netlify functions:serve
```

### 远程测试

部署后，可以通过以下方式测试 API：

```bash
# 测试 generate 函数
curl -X POST https://your-site.netlify.app/.netlify/functions/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "你工资多少？"}'
```

## 常见问题

### 1. 构建失败

检查：
- `npm run build` 是否在本地成功
- Node.js 版本是否兼容（建议 18+）
- package.json 中的依赖是否正确

### 2. Functions 无法访问

检查：
- `netlify/functions/` 目录结构是否正确
- 函数文件是否导出正确的 handler
- 环境变量是否配置

### 3. API 调用失败

检查：
- `MODEL_API_KEY` 是否正确配置
- `MODEL_BASE_URL` 是否正确（需包含 `/v1`）
- `MODEL_NAME` 是否正确
- API Key 是否有效
- 网络是否可以访问模型服务

### 4. 无 API Key 时的测试

如果未配置 `MODEL_API_KEY`，调用 generate 函数会返回：

```json
{"error": "服务端模型 API Key 未配置，请设置 MODEL_API_KEY。"}
```

这是预期行为，说明函数正常工作，只是缺少 API Key。本地测试时无需配置真实 Key，只需验证错误提示是否清晰即可。

> **重要**：API Key 只应存在于服务端环境变量中，不要写入前端代码或提交到 Git 仓库。

### 5. 跨域问题

Vite 开发服务器已配置代理，生产环境通过 Netlify Functions 代理，不会有跨域问题。

### 6. API 成本说明

- Netlify 免费域名 `xxx.netlify.app` 只是部署域名免费
- AI API 调用成本由模型服务商计费（Mimo、DeepSeek 等）
- 不要公开无邀请码的演示链接，避免 API 被刷

## 监控和日志

1. 在 Netlify 项目页面，点击 "Functions" 标签
2. 可以查看函数调用日志
3. 点击具体函数可以查看详细日志

## 自定义域名（可选）

1. 在 "Site settings" → "Domain management"
2. 点击 "Add custom domain"
3. 按照提示配置 DNS

## 性能优化

- Netlify 自动提供 CDN 加速
- Functions 有冷启动延迟，首次调用可能较慢
- 可以考虑启用 "Functions warming" 功能

---

*Last updated: 2026-05-23*
