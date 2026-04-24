# 2026-04-24 Phase 6B Tenant Migration Release Runbook

## 目的

为当前 `Phase 6B` 的多租户能力提供一份可执行的迁移 / 发布手册，统一以下口径：

- 何时允许把 tenant 相关改动从阶段实现推进到发布准备
- 数据库迁移、默认租户基线与非默认租户初始化的执行顺序
- 发布前后最小验证点
- 失败时的停机、回退与重新观察路径

## 当前适用前提

本手册只反映仓库当前真实状态，不假设尚未落地的生产平台能力：

- 仓库已有标准分支发布流转，见 [07-release-workflow.md](../07-release-workflow.md)
- 多租户长期边界已固定在 [ADR-0009](../decisions/ADR-0009-tenant-upgrade-and-validation-strategy.md)
- 已有 tenant 升级执行评审手册，见 [2026-04-24-phase-6b-tenant-upgrade-runbook.md](./2026-04-24-phase-6b-tenant-upgrade-runbook.md)
- 生产部署平台、自动化回滚平台、云数据库快照编排当前仍为 `TBD`

因此，本手册只定义“当前人工可执行的发布顺序与门槛”，不虚构平台命令。

## 适用范围

适用于触及以下任一项且准备进入 `dev -> main` 发布评审的改动：

- `tenant_id` schema / migration
- PostgreSQL RLS policy
- tenant context SQL
- `db:seed` / `tenant:init`
- 租户感知写路径
- super-admin 跨租户管理边界
- tenant 管理接口与权限模型

## 非目标

- 不定义云厂商、容器平台或 Helm 级别的部署细节
- 不把 `db:seed` 扩写成“生产环境通用修复命令”
- 不提供历史单租户数据批量回填脚本
- 不新增新的 package owner、脚本 owner 或第二套 tenant 发布策略

## 发布前提

进入本手册前，应先满足以下条件：

1. 已通过 tenant 升级执行评审：
   - `candidate_for_next_step`
   - 观察窗口 `5/5`
   - `systemicBlockerDetected=false`
2. 若当前待发布 head 与观察窗口 head 不一致：
   - 必须对新 head 重建 `5/5` 观察窗口
3. 最小验证通过：
   - `bun run check`
   - `bun run build:vue`
   - `bun run e2e:tenant:full`
4. 文档已同步：
   - roadmap
   - 阶段计划
   - 相关 runbook

## 发布输入

发布评审时至少锁定以下输入：

- 待发布 commit / PR
- `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
- `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`
- 当前租户相关 migrations 列表
- 本次是否包含：
  - 默认租户基线初始化
  - 新增非默认租户初始化
  - 仅代码 / 配置升级

## 执行顺序

### 1. 冻结发布范围

- 仅允许包含本次多租户发布目标所需改动
- 不混入无关重构、无关 schema 调整或权限模型漂移
- 若发现 tenant 相关高风险改动仍在 `dev` 持续变化，先停止发布评审

### 2. 明确环境类型

按环境区分执行路径：

- 新环境首发：
  - 允许执行默认租户基线初始化
- 已有环境升级：
  - 默认按“迁移 + 应用升级 + 必要的非默认租户 additive bootstrap”处理
  - 不把 `db:seed` 当成常规升级命令

### 3. 数据库与运行时前置检查

发布前人工确认：

- `DATABASE_URL` 指向目标环境且与本次发布环境一致
- 应用运行时数据库角色符合 `ADR-0009`：
  - `NOSUPERUSER`
  - `NOBYPASSRLS`
- 关键 secret 已就绪：
  - `ACCESS_TOKEN_SECRET`
  - 租户管理与初始化所需环境变量
- 已具备数据库快照、备份或等价回退手段

若以上任一项不成立，停止发布。

### 4. 执行数据库迁移

先执行：

```bash
bun run db:migrate
```

要求：

- migration 只执行一次
- 先迁移，再放量应用实例
- 若 migration 失败，不继续做 tenant bootstrap 或应用切换

### 5. 处理默认租户与非默认租户

#### 新环境首发

只在“全新环境需要平台基线数据”时执行：

```bash
bun run db:seed
```

约束：

- `db:seed` 负责默认租户基线，不替代 `tenant:init`
- 若环境不是全新环境，不应把 `db:seed` 当作升级修复动作直接执行

#### 新增非默认租户

按租户逐个执行 additive bootstrap：

```bash
bun run tenant:init -- --code <tenant-code> --name <tenant-name> --admin-password <password>
```

约束：

- `tenant:init` 只用于非默认租户
- tenant bootstrap 必须保持幂等
- 不批量并发执行多个 tenant bootstrap，先逐个完成并确认结果

### 6. 切换应用版本

数据库迁移完成后，再切换应用版本或实例。

当前仓库未固定生产平台，因此这里仅保留顺序约束：

1. 先保证新版本应用使用与迁移后 schema 匹配的构建
2. 再扩大流量或完成人工切换
3. 若应用切换失败，不继续做新的 tenant bootstrap

### 7. 发布后最小验证

至少完成以下验证：

- 默认租户登录可用
- super-admin 可访问 `/system/tenants`
- tenant admin 不可管理 `/system/tenants`
- 至少一个非默认 tenant 的 tenant admin 登录可用
- 至少一个真实业务实体的跨租户隔离仍成立

建议验证顺序：

1. 先做默认租户与 super-admin 验证
2. 再做非默认 tenant 登录验证
3. 最后做跨租户实体隔离验证

### 8. 发布结论归档

发布完成后，至少记录：

- 发布 commit / PR
- 执行的 migration
- 是否执行 `db:seed`
- 是否执行 `tenant:init`
- 发布后验证结果
- 风险、未验证区域、回滚路径

## 回滚路径

### 场景 1：迁移前发现问题

- 停止发布
- 不执行 `db:migrate`
- 修复后重新走发布评审

### 场景 2：迁移失败

- 停止应用切换
- 不执行 `db:seed` / `tenant:init`
- 使用目标环境既有数据库恢复能力回退
- 修复 migration 后重新发布

### 场景 3：迁移成功，但应用切换失败

- 先停止继续放量
- 回退应用版本到上一个已验证版本
- 若 schema 已不兼容旧应用，必须优先走数据库恢复路径，而不是强行保留旧应用

### 场景 4：`tenant:init` 后发现租户级问题

- 停止继续创建新的 tenant
- 优先把受影响 tenant 标记为不可用或暂停开放
- 若问题影响已创建 tenant 的基础数据一致性，使用数据库恢复能力回退

## 禁止事项

- 禁止把 `db:seed` 用作现网常规修复命令
- 禁止把默认租户交给 `tenant:init`
- 禁止在未完成 `5/5` 观察窗口时直接宣告 tenant 改动“可发布”
- 禁止在 schema 已变更但应用尚未切换时继续执行新的 tenant bootstrap
- 禁止把 superuser / bypassrls 测试结果当成真实发布依据

## 后续待补

- 生产部署平台确定后的平台级命令与责任边界
- 历史单租户到多租户的数据迁移与回填策略
- 更高规模 tenant 样本、发布频率与灰度节奏
