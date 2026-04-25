# 2026-04-26 Round Regression Closeout

更新时间：`2026-04-26`

## 目标

收敛最近两笔主线改动的回归状态，避免：

- `P7A Round-1` 工作流后端与 `TDesign` 前端迁移分别维护、状态分散
- 自动化回归已通过，但清单、roadmap、项目画像仍停留在旧表述
- 后续继续推进时误把“自动化已收口”和“真实环境 / 手工验证已完成”混为一谈

## 本轮回归范围

- `070da8b feat: 完成P7A工作流最小闭环与权限收口`
- `2f95e1d feat(vue): 完成TDesign预设迁移并切换Husky`

涉及模块：

- `apps/server`
- `packages/schema`
- `packages/persistence`
- `packages/frontend-vue`
- `packages/ui-enterprise-vue`
- `apps/example-vue`

## 当前边界

- `P7A Round-1` 仍保持“agent 自编排辅助工具”的简化工作流定位
- 本轮不把 workflow 扩成通用 BPM / agent orchestrator
- `ui-core` 继续保持中立协议，不反向吸收 `TDesign` 组件语义
- 示例端已切到 `zh-CN` 默认语言，并保留 `en-US` 回退；当前仅代表示例级 i18n 基线，不代表全仓已完成国际化

## 自动化回归结果

### 已执行并通过

- `bun run check`
- `bun run test apps/server/src/app.test.ts packages/schema/src/index.test.ts packages/persistence/src/seed.test.ts`
- `bun run build:vue`

### 通过要点

- 全量 `242` 个测试通过，`0` 失败
- workflow Round-1 相关 contract、server、tenant 隔离与权限 403 覆盖通过
- Vue 企业预设相关测试通过，权限 gate 与 locale fallback 行为通过
- `apps/example-vue` 生产构建通过，当前构建输出已收敛为 `vendor-vue` + 业务分块，不再出现独立 `vendor-tdesign` 大包
- `husky` 已接管本地 hooks，且水印检测规则已修正为只检查新增行，避免规则文档误判

## 未完成的验证

### 环境阻塞

- 未执行 `bun run e2e:smoke:full`
- 未执行 `bun run e2e:tenant:full`

原因：

- 当前工作区缺少 `.env`
- 因而无法确认本机 `DATABASE_URL` 与 `ACCESS_TOKEN_SECRET` 是否可用于真实环境回归

### 手工验证空缺

- 未完成浏览器手工 walkthrough
- 未逐项复核 `apps/example-vue` 登录后壳层、导航、查询、创建、编辑、详情、删除交互
- 未对 `zh-CN / en-US` 切换做浏览器级文案巡检

## 回归结论

- 自动化回归：已收口
- 文档一致性：已补齐
- 真实环境回归：待补
- 手工 UI 回归：待补

当前可以把本轮视为：

- `P7A Round-1` 后端最小闭环的自动化回归已通过
- `TDesign` 迁移与 `husky` 替换的代码级回归已通过
- 后续进入下一轮前，若要作为“完整阶段出口”使用，仍建议补一次真实环境与手工 UI 验证

## 建议下一步

1. 在补齐 `.env` 后执行 `bun run e2e:smoke:full`
2. 若本机具备 PostgreSQL，再执行 `bun run e2e:tenant:full`
3. 对 `apps/example-vue` 做一次浏览器级手工巡检，重点覆盖：
   - 角色管理 / 菜单管理 / 部门管理左侧列表
   - 标题两行场景，如 `bun-first` / `11 个节点`
   - `zh-CN / en-US` 切换与回退文案
4. 若以上通过，再评估 `P7A Round-1` 是否进入下一轮
