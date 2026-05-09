# Phase 1–7A 阶段复盘

日期：`2026-05-09`

## 一、进度盘点

Elysian 已完成 7 个阶段（含子阶段），历时约 3 周（2026-04-20 ~ 2026-05-06）。

### 阶段总览

| 阶段 | 核心交付 | 状态 |
|------|---------|------|
| Phase 1 | 垂直切片闭环：schema → server → persistence → generator → frontend | ✅ 归档 |
| Phase 2 | 认证底座：JWT + refresh session、RBAC 表结构、auth guard、审计基线 | ✅ 归档 |
| Phase 3 (A/B/C + 3.10-3.12) | 13 个标准企业模块后端 + Vue 企业预设首版（ElyShell / ElyTable / ElyForm / ElyCrudWorkspace） | ✅ 归档 |
| Phase 4 (P4D/P4E) | 生成器安全写入（冲突策略 + 原子写入）+ 回归矩阵 + 报告门禁 | ✅ 归档 |
| Phase 5 (P5A) | AI → Schema 最小闭环：输入模板、校验网关、handoff / replay / corpus / acceptance | ✅ 归档 |
| Phase 6A (Round-2) | 生产基线：Docker、E2E smoke/tenant、Prometheus 指标、限流、稳定性观察窗口 | ✅ 归档 |
| Phase 6B | 企业增强：多租户 RLS、数据权限 5 档、tenant:init CLI、发布演练 | ✅ 归档 |
| Phase 7 (P7A) | 简化 workflow：定义 / 发起 / 线性审批 / 最小条件分支 / 认领 / 取消 + 审计 | ✅ 归档 |

### 模块真实完成度

- **后端 13 个模块**：全部具备 CRUD / 只读闭环。但文件只有本地存储、通知只有站内、workflow 只有线性审批。
- **前端企业预设**：6 个核心组件落地（ElyShell / ElyTable / ElyForm / ElyQueryBar / ElyCrudWorkspace / ElyPreviewSkeleton），13 个标准 CRUD surface 已从手写切换为 schema 驱动。
- **生成器**：具备 schema → preview → apply → staging 闭环，但 `generated/` 到正式模块目录的边界未定稿，且使用体验不友好（CLI 复杂、缺少交互式引导、Schema 门槛高）。
- **CI/CD**：完整的 smoke / tenant / generator / p5a E2E 链路，但只覆盖单主机 Docker 部署。

## 二、方向校准

### 当前主线

generator 可用性打磨优先，把"能生成"推进到"好用"。

### 为什么调整

原主线是"generator 自举闭环"——把链路做稳。链路已跑通，但实际使用体验差：CLI 参数复杂、报错不友好、缺少交互式操作界面、Schema 定义门槛高。项目重心从"能力建设"自然演进到"体验打磨"。

### 三个重点方向

1. **交互式生成体验**：给 Preview / Apply 流程加上渐进式引导，降低首次使用门槛
2. **CLI / 文档 / 报错体验**：简化 CLI 参数、改善错误信息可读性、补齐使用文档
3. **Schema 输入简化**：探索更轻量的 JSON → Schema 转换路径，让用户 / AI 不需要掌握完整 ModuleSchema 结构也能快速上手

### 边界放宽

- 前端交互界面（Studio 侧）可以继续推进，不再限制为"只做必要延伸"
- JSON → Schema 简化层可以作为新能力探索
- 企业后台模块继续保持"验证对象"定位，但在打磨 generator 时可以反向驱动模块改进

### 仍不进入

- 通用低代码运行时拖拽器
- 自研 SSR 元框架

## 三、风险与缺口

### 高风险（影响主线推进）

1. **generator 到正式模块目录的 apply / merge 边界未定稿**——生成产物落在 `generated/` staging，如何安全进入主工程缺最终方案
2. **Schema 定义门槛高**——ModuleSchema 结构完整但复杂，普通用户和 AI 都容易出错，校验报错不够直观
3. **生成模板覆盖场景不全**——当前模板只验证过 13 个标准 CRUD，复杂表单、树形结构、导入导出等场景未覆盖

### 中风险（不影响主线但需关注）

4. 文件模块只有本地磁盘存储——未接入对象存储，生产环境不可用
5. 通知模块只有站内通知——邮件 / 短信 / WebSocket 投递未实现
6. workflow 只是简化运行态——线性审批 + 最小条件分支，transfer / delegate 等复杂语义未进入
7. 部署只覆盖单主机 Docker——镜像仓库、自动回滚、监控告警平台未定稿

### 技术债与待清理项

8. 代码中的宽松断言——部分测试仍用裸断言而非运行时 shape 校验（已在清理中，未完成）
9. persistence 高风险查询——`data-scope.ts` 与 `auth.ts` 的复杂查询尚未做性能治理
10. E2E 覆盖缺口——generator 的交互式操作流程（Studio 侧）目前没有自动化验证

### 未确认的设计决策

11. RBAC 权限点命名是否足够支撑 generator 自动生成
12. `/auth/me` 返回结构是否已稳定到可供更多前端预设层消费
13. 本地开发数据库与测试数据库策略是否需要拆分
14. 字典模块契约是否已稳定到可供 generator 和表单联动消费

## 四、理念一致性

Elysian 声明了 6 条核心原则，对照实际演进：

| 原则 | 一致性 | 说明 |
|------|--------|------|
| 企业上线优先于炫技 | ✅ 一致 | 确实没做 SSR / 低代码搭建器；workflow 外扩倾向已及时收住 |
| 约定优于配置 | ✅ 一致 | Schema 驱动注册、buildWorkspaceRegistration、标准 CRUD surface 生成都体现了这个思路 |
| 结构化生成优于自由生成 | ✅ 一致 | 生成器围绕 ModuleSchema 构建，AI 产出经校验网关 |
| 前后端契约单一来源 | ✅ 一致 | 13 个模块已实现 schema → 后端 CRUD + 前端注册 + 权限点 + 路由 |
| AI 放大效率不削弱质量 | ✅ 一致 | P5A 完整落地：输入模板、校验、handoff / replay / corpus / acceptance |
| 代码可回收可重构可测试 | ⚠️ 部分一致 | 能力层面成立（冲突策略 + manifest），但使用门槛过高，体验层面打了折扣 |

### 核心发现

6 条原则在方向上高度一致，没有出现原则性偏移。但"代码可回收可重构可测试"在体验层面打了折扣——generator 的 CLI 参数复杂、缺少交互式引导、Schema 输入困难，导致"可回收可重构"停留在能力层面而非体验层面。

### 演进趋势

前 7 个阶段的叙事重心是"能力建设"（搭模块、铺链路、建基线），当前自然演进到"体验打磨"阶段。这不是方向变化，而是项目成熟度到了该换挡的点。

## 五、结论

Elysian 用 7 个阶段建立了一个能力完整的平台底座：13 个后端模块、企业级前端预设、schema 驱动的代码生成器、多租户、workflow、AI 辅助、生产部署基线。核心原则在方向上一致，没有偏移。

当前的真正瓶颈不是"缺什么能力"，而是"现有能力好不好用"。generator 是平台的核心使用方式，但使用体验——CLI 复杂度、交互引导缺失、Schema 输入门槛——制约了能力的实际发挥。

下一步重心：从"能做"转向"好用"，以 generator 可用性打磨为主线，带动整体体验升级。
