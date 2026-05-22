# Project Brief - 相亲嘴替

## 项目目标

构建一个可部署上线的 AI 整活工具站。用户输入相亲对象的一句离谱、尴尬、冒犯、查户口、普信、油腻或价值观冲突类发言，网站调用 AI API，生成几种"嘴替式回复"。

这不是严肃婚恋咨询产品，而是作品集 Demo：
- 展示 AI 产品设计能力
- 展示 Prompt Engineering 能力
- 展示前端交互能力
- 展示 Serverless API 代理能力
- 展示内容安全边界设计能力

## 项目目的

- [x] Portfolio / job-search
- [ ] Internal tool
- [ ] Learning project
- [ ] Product MVP
- [ ] Automation workflow
- [ ] Research prototype

## 目标用户

- 相亲场景中遇到尴尬发言的年轻人
- 需要"嘴替"来应对不合理提问的用户
- 寻找娱乐化 AI 工具的用户

## 非目标

- 不做严肃婚恋咨询产品
- 不做大型本地内容库（100-200条）
- 不做用户登录系统
- 不接数据库
- 不做复杂后端
- 不做性别对立内容

## 成功标准

- [ ] npm install 成功
- [ ] npm run dev 成功，页面无白屏
- [ ] npm run build 成功
- [ ] 输入框可输入，示例按钮可填入
- [ ] 场景、视角、强度可选择
- [ ] 点击生成有 loading 状态
- [ ] 成功后显示 4 张回复卡片
- [ ] 每张卡片有复制按钮
- [ ] 移动端和桌面端布局可用
- [ ] 前端不暴露 API Key
- [ ] API 未配置时有明确错误提示
- [ ] 文档齐全

## MVP 边界

### Ships in v1

1. Hero 区展示产品信息
2. 输入框 + 示例按钮
3. 场景选择（12种场景）
4. 用户视角选择（不指定/男生/女生）
5. 冒犯强度选择（温和/有刺/抽象）
6. 生成按钮 + loading 状态
7. 4张回复卡片输出
8. 复制按钮功能
9. Netlify Functions 后端代理
10. DeepSeek API 接入

### Deferred

- 用户登录系统
- 历史记录保存
- 内容库扩展
- 多语言支持
- 深色模式

## 风险列表

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| AI 生成内容不可控 | 可能出现违规内容 | 严格的 Prompt 约束 + 安全边界设计 |
| API 调用成本 | 频繁调用产生费用 | 前端冷却 + max_tokens 限制 + 可选访问码 |
| 内容安全风险 | 可能出现性别对立/人身攻击 | Prompt 明确禁止 + 降级处理 |
| 部署复杂度 | Netlify Functions 配置 | 提供详细部署文档 |

## 技术栈

- **前端**: React + Vite + Tailwind CSS + JavaScript
- **后端**: Netlify Functions
- **AI**: DeepSeek API / OpenAI-compatible API
- **部署**: Netlify

## 下一步

1. 创建项目结构
2. 实现前端组件
3. 实现后端函数
4. 编写文档
5. 本地测试
6. 部署到 Netlify

## 决策日志参考

技术决策详见 `docs/DECISION_LOG.md`

---

*Last updated: 2026-05-23*
