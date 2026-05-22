# 相亲嘴替 - AI整活回复生成器

> 输入一句相亲对象的离谱发言，让AI替你体面发疯。

## 项目简介

相亲嘴替是一个AI驱动的整活工具站。用户输入相亲对象的一句离谱、尴尬、冒犯、查户口、普信、油腻或价值观冲突类发言，网站调用AI API，生成几种"嘴替式回复"。

这不是严肃婚恋咨询产品，而是作品集Demo，展示：
- AI产品设计能力
- Prompt Engineering能力
- 前端交互能力
- Serverless API代理能力
- 内容安全边界设计能力

## 技术栈

- **前端**: React + Vite + Tailwind CSS + JavaScript
- **后端**: Netlify Functions
- **AI**: OpenAI-compatible API（支持 Mimo、DeepSeek 或其他兼容服务）
- **部署**: Netlify

## 本地运行

### 1. 安装依赖

```bash
cd XiangqinMouthpiece
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入你的 API 配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```
MODEL_PROVIDER=mimo
MODEL_API_KEY=你的Mimo API Key
MODEL_BASE_URL=从Mimo控制台获取的OpenAI-compatible Base URL
MODEL_NAME=从Mimo控制台获取的模型名
DEMO_INVITE_CODE=可选邀请码
```

> **重要**：不要把真实 API Key 提交到 Git 仓库。`.env.local` 已在 `.gitignore` 中。

### 3. 启动开发服务器

**仅前端开发**（不需要调用API时）：

```bash
npm run dev
```

浏览器访问 http://localhost:5173

**前后端联调**（需要调用API时）：

```bash
npm install -g netlify-cli
netlify dev --offline
```

这会同时启动Vite和Netlify Functions，浏览器访问 http://localhost:8888

> 注意：`npm run dev`只启动前端，无法调用后端API。如需测试生成功能，请使用`netlify dev --offline`。
>
> `--offline` 参数用于本地开发，不需要登录 Netlify 账户。

> 未配置 `MODEL_API_KEY` 时，调用 generate 函数会返回 `"服务端模型 API Key 未配置"` 错误，这是预期行为，说明函数正常工作。

## 构建和部署

### 构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 部署到 Netlify

1. 推送到 GitHub
2. 在 Netlify 选择仓库
3. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 设置环境变量：

   | 变量名 | 值 | 标记为 Secret |
   |--------|-----|---------------|
   | `MODEL_PROVIDER` | `mimo` | **否** |
   | `MODEL_BASE_URL` | 从 Mimo 控制台获取 | **否** |
   | `MODEL_NAME` | 从 Mimo 控制台获取 | **否** |
   | `MODEL_API_KEY` | 你的 API Key | **是（必须）** |
   | `DEMO_INVITE_CODE` | 演示邀请码（可选） | **是（建议）** |
5. 部署

详细步骤见 `docs/DEPLOY_NETLIFY.md`

## 功能特性

- 输入框 + 示例按钮
- 12种场景选择
- 用户视角选择（不指定/男生/女生）
- 冒犯强度选择（温和/有刺/抽象）
- 4种风格的回复卡片
- 一键复制功能
- 移动端适配
- 输入长度限制
- 按钮冷却防重复点击

## 文档

- [项目简介](docs/PROJECT_BRIEF.md)
- [风格指南](docs/STYLE_GUIDE.md)
- [Prompt规则](docs/PROMPT_RULES.md)
- [验收清单](docs/ACCEPTANCE_CHECKLIST.md)
- [部署指南](docs/DEPLOY_NETLIFY.md)
- [决策日志](docs/DECISION_LOG.md)
- [作品集包装](docs/PORTFOLIO_PACKAGE.md)

## 许可证

MIT
