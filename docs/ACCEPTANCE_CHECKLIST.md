# Acceptance Checklist - 相亲嘴替

## 验收标准

### 基础运行

- [ ] AC-001: npm install 成功
- [ ] AC-002: npm run dev 成功，页面无白屏
- [ ] AC-003: npm run build 成功

### 前端功能

- [ ] AC-F01: 输入框可输入文本
- [ ] AC-F02: 示例按钮可填入输入框
- [ ] AC-F03: 场景可选择（12种场景）
- [ ] AC-F04: 用户视角可选择（不指定/男生/女生）
- [ ] AC-F05: 冒犯强度可选择（温和/有刺/抽象）
- [ ] AC-F06: 点击生成有 loading 状态
- [ ] AC-F07: 成功后显示 4 张回复卡片
- [ ] AC-F08: 每张卡片有复制按钮
- [ ] AC-F09: 移动端布局可用
- [ ] AC-F10: 桌面端布局可用
- [ ] AC-F11: 输入超长时有提示（120字限制）
- [ ] AC-F12: 输入为空时有提示

### API 功能

- [ ] AC-A01: 前端请求 Cloudflare Pages Function (/api/generate)
- [ ] AC-A02: 服务端读取环境变量
- [ ] AC-A03: API Key 不出现在前端 bundle
- [ ] AC-A04: API 未配置时有明确错误
- [ ] AC-A05: 访问码设置后能校验
- [ ] AC-A06: 访问码未设置时不阻塞使用
- [ ] AC-A07: 访问码错误时返回 401 且不调用 Mimo API
- [ ] AC-A08: DEMO_ACCESS_CODE 建议标记为 secret
- [ ] AC-A09: 所有错误返回都是 JSON

### 内容质量

- [ ] AC-C01: 生成内容不是严肃说教
- [ ] AC-C02: 生成内容不是纯鸡汤
- [ ] AC-C03: 生成内容有短句反转
- [ ] AC-C04: 至少一张卡片体现"日常脑回路错位"
- [ ] AC-C05: 不大量使用编程梗
- [ ] AC-C06: 不使用高阶数学/物理/化学梗
- [ ] AC-C07: 不出现脏话
- [ ] AC-C08: 不做人身攻击
- [ ] AC-C09: 不制造性别对立
- [ ] AC-C10: 抽象整活版标明"仅供整活"或"不建议真实发送"

### 文档

- [ ] AC-D01: docs 文件齐全
- [ ] AC-D02: README.md 说明如何本地运行
- [ ] AC-D03: DEPLOY_CLOUDFLARE.md 说明如何部署到 Cloudflare Pages
- [ ] AC-D04: DEPLOY_NETLIFY.md 保留历史兼容部署说明
- [ ] AC-D05: PORTFOLIO_PACKAGE.md 可直接用于作品集说明

## 验证日志

| 日期 | 标准 | 状态 | 证据 | 验证人 |
|------|------|------|------|--------|
| | | | | |

## 演示就绪状态

**整体状态**: READY

**阻塞项**: 无

**最后检查**: 2026-05-23
**检查人**: qa-verifier

---

*Customized for 相亲嘴替 (portfolio demo project)*
