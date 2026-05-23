# 部署到 Cloudflare Pages

本文档说明如何将相亲嘴替项目部署到 Cloudflare Pages + Pages Functions。

## 前提条件

- GitHub 仓库：https://github.com/MartinKuai/XiangqinMouthpiece
- Cloudflare 账户
- Mimo API Key（或其他 OpenAI-compatible API Key）

## Cloudflare Dashboard 部署步骤

### 1. 创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Connect to Git**
6. 选择 GitHub 仓库：`MartinKuai/XiangqinMouthpiece`

### 2. 配置构建设置

| 配置项 | 值 |
|--------|-----|
| Project name | `xiangqin-mouthpiece` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

### 3. 配置环境变量

普通变量已由 `wrangler.toml` 的 `[vars]` 管理，部署时自动注入：
- `MODEL_PROVIDER` = `mimo`
- `MODEL_BASE_URL` = `https://api.xiaomimimo.com/v1`
- `MODEL_NAME` = `mimo-v2.5-pro`
- `MODEL_TEMPERATURE` = `0.85`
- `MODEL_MAX_TOKENS` = `700`

**只需要在 Dashboard 中添加 Secret：**

在 **Settings** → **Environment variables** 中配置（标记为 Encrypted）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MODEL_API_KEY` | 你的 Mimo API Key | **必须，Secret** |
| `DEMO_ACCESS_CODE` | 演示访问码 | **可选但建议，Secret** |

> **重要**：`MODEL_API_KEY` 和 `DEMO_ACCESS_CODE` 必须标记为加密/Secret，不能暴露在前端代码中。

### 4. 部署

点击 **Save and Deploy**，等待构建完成。

构建成功后，你会获得一个 `*.pages.dev` 域名，例如：
`https://xiangqin-mouthpiece.pages.dev`

## 环境变量说明

| 变量名 | 必填 | 说明 | 来源 | 是否敏感 |
|--------|------|------|------|----------|
| `MODEL_PROVIDER` | 否 | 模型提供商标识 | wrangler.toml `[vars]` | 否 |
| `MODEL_BASE_URL` | 是 | OpenAI-compatible Base URL | wrangler.toml `[vars]` | 否 |
| `MODEL_NAME` | 是 | 模型名称 | wrangler.toml `[vars]` | 否 |
| `MODEL_TEMPERATURE` | 否 | 生成温度（0~2） | wrangler.toml `[vars]` | 否 |
| `MODEL_MAX_TOKENS` | 否 | 最大 token 数 | wrangler.toml `[vars]` | 否 |
| `MODEL_API_KEY` | 是 | Mimo API Key | Dashboard Secret | **是** |
| `DEMO_ACCESS_CODE` | 否 | 演示访问码 | Dashboard Secret | **是** |

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地环境变量

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars`，填入真实值：

```
MODEL_PROVIDER=mimo
MODEL_API_KEY=你的API Key
MODEL_BASE_URL=https://api.xiaomimimo.com/v1
MODEL_NAME=mimo-v2.5-pro
MODEL_TEMPERATURE=0.85
MODEL_MAX_TOKENS=700
DEMO_ACCESS_CODE=你的访问码（可选）
```

### 3. 启动本地开发服务器

```bash
# 构建前端
npm run build

# 启动 Cloudflare Pages 本地开发
npx wrangler pages dev dist
```

访问 http://localhost:8788

### 4. 仅前端开发（不测试 API）

```bash
npm run dev
```

访问 http://localhost:5173

> 注意：`npm run dev` 只启动前端，无法调用后端 API。如需测试生成功能，请使用 `wrangler pages dev`。

## 测试 API

### 测试 /api/generate 端点

```bash
curl -X POST http://localhost:8788/api/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "你工资多少？"}'
```

### 测试访问码校验

如果设置了 `DEMO_ACCESS_CODE`：

```bash
# 错误访问码 → 返回 401
curl -X POST http://localhost:8788/api/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "你工资多少？", "accessCode": "wrong"}'

# 正确访问码 → 正常生成
curl -X POST http://localhost:8788/api/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "你工资多少？", "accessCode": "正确访问码"}'
```

### 验证访问码是否生效

1. 在 Cloudflare Dashboard 中设置 `DEMO_ACCESS_CODE`
2. 不携带访问码访问 → 返回 401 错误
3. 携带错误访问码 → 返回 401 错误
4. 携带正确访问码 → 正常生成回复

## 从 Netlify 切换到 Cloudflare

### 迁移步骤

1. 在 Cloudflare Dashboard 完成上述部署配置
2. 确认 Cloudflare 部署成功并可访问
3. 测试所有功能正常
4. 在 Netlify Dashboard 中停止自动构建（可选）
5. 将 Cloudflare 域名作为主域名

### 保留 Netlify 配置

项目保留了 Netlify 相关文件（`netlify.toml`、`netlify/functions/`），作为历史兼容。Cloudflare 部署不影响 Netlify 配置。

## 故障排查

### 构建失败

- 检查 `npm run build` 是否成功
- 确认 `dist` 目录存在

### API 返回 500 错误

- 检查环境变量是否正确配置
- 确认 `MODEL_API_KEY` 已设置为 Secret

### 访问码校验不生效

- 确认 `DEMO_ACCESS_CODE` 已在 Cloudflare Dashboard 中配置
- 确认前端传递的字段名是 `accessCode`

---

*Last updated: 2026-05-23*
