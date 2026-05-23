# Decision Log - 相亲嘴替

## 决策记录

### DEC-001: 不做大型内容库

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Product

**Context**: 需要决定是否构建100-200条本地内容库

**Options Considered**:
1. 构建大型内容库：预置大量回复模板，减少API调用
2. 直接接API：每次动态生成，保持新鲜感
3. 混合方案：少量示例 + API生成

**Decision**: 直接接API，只保留少量风格示例

**Rationale**:
- 作品集Demo重点展示AI能力，不是内容运营
- 大型内容库需要持续维护，增加复杂度
- API生成能展示Prompt Engineering能力
- 少量示例足够说明风格

**Trade-offs**: 每次调用都需要API，有成本

---

### DEC-002: 直接接DeepSeek API

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Technical

**Context**: 需要选择AI模型接入方式

**Options Considered**:
1. DeepSeek API：国内访问快，成本低
2. OpenAI API：国际知名，但国内访问需代理
3. 本地模型：无需API，但效果有限

**Decision**: DeepSeek API / OpenAI-compatible API

**Rationale**:
- DeepSeek国内访问稳定，成本可控
- 使用OpenAI-compatible接口，未来可切换
- 符合项目需求

**Trade-offs**: 需要用户配置API Key

---

### DEC-003: 选择Netlify Functions

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Technical

**Context**: 需要Serverless后端代理API请求

**Options Considered**:
1. Netlify Functions：免费额度，部署简单
2. Vercel Functions：类似方案，但需要Vercel账户
3. 自建后端：完全控制，但复杂度高

**Decision**: Netlify Functions

**Rationale**:
- 免费二级域名xxx.netlify.app
- 部署简单，推送到GitHub即可
- 配合Vite构建，工作流顺畅
- 免费额度足够Demo使用

**Trade-offs**: 冷启动可能有延迟

---

### DEC-004: API Key不放前端

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Security

**Context**: 需要保护API Key安全

**Options Considered**:
1. 前端直连API：简单，但暴露Key
2. Serverless代理：安全，但多一层
3. 环境变量+代理：最佳实践

**Decision**: API Key只存在服务端环境变量

**Rationale**:
- 防止API Key被滥用
- 防止被爬取和盗用
- 符合安全最佳实践
- 可以做访问控制

**Trade-offs**: 需要Serverless层

---

### DEC-005: 保留邀请码开关

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Product

**Context**: 需要控制Demo访问权限

**Options Considered**:
1. 无邀请码：任何人都能用，可能被滥用
2. 固定邀请码：所有人用同一个码
3. 可选邀请码：设置了才启用，不设置不阻塞

**Decision**: 可选邀请码 DEMO_INVITE_CODE

**Rationale**:
- 可以控制Demo访问范围
- 不设置时不阻塞使用，方便测试
- 灵活性高

**Trade-offs**: 需要前端携带邀请码

---

### DEC-006: 限制高门槛编程梗

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Product

**Context**: 需要决定内容风格边界

**Options Considered**:
1. 允许所有梗：包括编程、数学等
2. 限制高门槛梗：只保留大众能理解的
3. 完全禁止技术梗：只用生活常识

**Decision**: 限制高门槛编程梗，保留基础数学梗

**Rationale**:
- 用户群体是大众，不是程序员
- 保留"绝对值"等大众能理解的符号错位
- 避免"死装"的感觉
- 保持低门槛

**Trade-offs**: 牺牲了一些程序员群体的笑点

---

### DEC-007: 使用JavaScript而非TypeScript

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Technical

**Context**: 需要决定是否使用TypeScript

**Options Considered**:
1. TypeScript：类型安全，但增加复杂度
2. JavaScript：简单直接，开发快
3. 混合：部分用TS

**Decision**: JavaScript，不强制TypeScript

**Rationale**:
- 作品集Demo重点是功能和设计
- JavaScript开发更快
- 减少配置复杂度
- 用户明确说"不强制TypeScript"

**Trade-offs**: 牺牲了类型安全

---

*Add new decisions below this line*

---

### DEC-008: 将 DEEPSEEK_* 环境变量改为 MODEL_* 通用命名

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Technical

**Context**: 项目需要接入 Mimo API，不应绑定单一供应商名称

**Options Considered**:
1. 保持 DEEPSEEK_* 命名：简单，但绑定供应商
2. 改为 MODEL_* 通用命名：通用，但需要迁移
3. 混合方案：新变量 + 旧变量 fallback

**Decision**: 改为 MODEL_* 通用命名，保留 DEEPSEEK_* fallback

**Rationale**:
- 项目本质依赖 OpenAI-compatible API，不应绑定单一供应商名称
- 当前决定接入 Mimo API
- 通用命名便于后续切换 DeepSeek、Mimo、OpenRouter 或其他服务
- 保留 DEEPSEEK_* fallback 只是为了兼容旧配置

**Trade-offs**: 旧部署环境需要更新环境变量

---

### DEC-009: 最小侵入式邀请码保护

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Security

**Context**: 需要保护演示站点不被滥用，但不引入复杂认证系统

**Options Considered**:
1. 无邀请码：任何人都能用，可能被滥用
2. 固定邀请码：所有人用同一个码
3. 可选邀请码：设置了才启用，不设置不阻塞

**Decision**: 可选邀请码 DEMO_INVITE_CODE，未设置时不阻塞

**Rationale**:
- 可以控制 Demo 访问范围
- 不设置时不阻塞使用，方便测试
- 灵活性高，适合作品集展示
- 最小侵入式，不引入登录/注册系统

**Trade-offs**: 需要前端携带邀请码

**Implementation**:
- 后端读取 `process.env.DEMO_INVITE_CODE`
- 如果为空或未设置，跳过校验
- 如果设置了，必须完全匹配，否则返回 401
- 邀请码错误时不调用 Mimo API

---

### DEC-010: Netlify 部署策略优化

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Operations

**Context**: Netlify Free plan credits 消耗较快，production deploy 每次会消耗 15 credits

**Decision**: 默认只做本地修改和本地验收，不自动执行 production deploy

**Rationale**:
- Netlify Free plan credits 已消耗 75%
- production deploy 每次消耗 15 credits
- 本项目由 GitHub 仓库导入 Netlify，push 到 main 分支会触发自动部署

**Deployment Rules**:
1. 默认只做本地修改和本地验收
2. 本地运行 `npm run build`
3. 本地测试 `netlify dev`
4. 没有用户明确说"部署到 production"，不执行 `netlify deploy --prod`
5. README、docs、文案类修改默认只 commit，不 push，不部署
6. 只有以下情况才建议 production deploy：
   - Function 逻辑修复完成
   - 页面核心功能修复完成
   - 用户要对外展示最终版本
   - 用户明确授权部署
7. 每次准备 push 前必须提醒："GitHub push 可能触发 Netlify 自动部署并消耗 credits，是否确认？"
8. 每次准备 production deploy 前必须提醒："production deploy 可能消耗 Netlify credits，是否确认？"
9. 如果只是为了保存本地修改，优先 git commit，不要 push
10. 如果必须 push 但不希望触发 Netlify build，可考虑在 commit message 中加入 `[skip netlify]`，但仍需用户确认
11. 更稳妥的做法是在 Netlify 后台 Stop builds 后再 push

**Forbidden Operations** (without explicit user confirmation):
- `git push`
- `netlify deploy --prod`
- `netlify deploy`
- `netlify sites:create`
- `netlify unlink`
- `netlify link`
- Any API request that modifies Netlify site configuration

**Trade-offs**: 增加本地验证步骤，但节省 credits

---

### DEC-011: 迁移到 Cloudflare Pages 作为主部署平台

**Date**: 2026-05-23
**Status**: Accepted
**Category**: Operations

**Context**: Netlify Free plan credits 消耗较快，需要选择更经济的部署方案

**Options Considered**:
1. 继续使用 Netlify：credits 消耗快，免费额度有限
2. 迁移到 Cloudflare Pages：免费额度充足，冷启动更快
3. 迁移到 Vercel：类似方案，但免费额度有限

**Decision**: 迁移到 Cloudflare Pages + Pages Functions 作为主部署平台

**Rationale**:
- Cloudflare Pages 免费额度充足（无限构建、无限请求）
- Cloudflare Pages Functions 冷启动更快（边缘计算）
- 保留 Netlify 配置作为历史兼容
- 未来可随时切换回 Netlify

**Implementation**:
- 新增 `functions/api/generate.js`（Cloudflare Pages Function）
- 前端请求路径改为 `/api/generate`
- 新增 `wrangler.toml` 配置
- 本地开发使用 `wrangler pages dev dist`

**Trade-offs**: 需要学习新的部署流程

---

*Add new decisions below this line*
