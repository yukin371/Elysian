# ADR-0009 多租户升级与验证策略

状态：`accepted`

日期：`2026-04-24`

## 背景

`Phase 6B / P6B1` 已经把多租户基础能力落到真实 schema、`tenant_id`、PostgreSQL RLS、JWT `tid` 与 tenant context middleware。

`P6B3` 又补齐了：

- `/system/tenants` 租户管理接口
- `tenant:init` 非默认租户初始化 CLI
- tenant-aware setting fallback
- 真实 PostgreSQL 下的 tenant init 幂等、跨租户 customer 隔离、RLS 与 `tenant_id` 外键约束联调

到这一阶段，多租户能力已经不再只是“功能实现问题”，而是进入了“升级路径和持续验证策略必须稳定”的阶段。

如果继续把这些边界只留在临时计划或单次修复里，后续很容易出现：

- 把默认租户初始化和非默认租户初始化混在一起
- 把 `tenant_id` fallback 当成正常写路径，掩盖服务层漏传 `tenantId`
- 只依赖 in-memory test 或单次本地验证，误判真实隔离已经稳定
- 后续 migration、seed、tenant bootstrap、CI 验证各自漂移，重复定义升级规则

因此需要把“多租户升级与验证”的长期有效边界固定成 ADR。

## 决策

### 1. 默认租户与非默认租户的初始化路径分离

- 默认租户固定由 `bun run db:seed` 负责初始化
- 非默认租户固定由 `bun run tenant:init -- --code <code> --name <name> --admin-password <password>` 负责初始化
- 不允许把默认租户交给 `tenant:init`
- 不允许把 `tenant:init` 作为全局 seed 的替代入口

### 2. tenant bootstrap 必须保持幂等且 additive

- `tenant:init` 重跑时必须复用既有 tenant
- bootstrap 只补齐缺失角色、权限、菜单、字典和 tenant admin
- 不覆盖已存在 tenant 记录
- 不把 tenant admin 升级为 super admin
- 不向 tenant admin 暴露 `system:tenant:*` 权限或 `/system/tenants` 菜单

### 3. 多租户写路径必须显式传递 tenant identity

- server 写入业务数据时，必须从认证身份显式透传 `identity.user.tenantId`
- `packages/persistence` 中的 `tenantId ?? DEFAULT_TENANT_ID` fallback 只作为兼容兜底，不得被视为正常多租户写路径
- 后续新增租户感知模块时，必须优先验证“服务层是否把 tenant identity 传到底”

### 4. PostgreSQL RLS 验证必须使用非 superuser、非 bypassrls 运行时角色

- 真实隔离验证不得使用 superuser 直接代替业务运行时
- 用于 tenant e2e 的数据库角色必须显式为：
  - `NOSUPERUSER`
  - `NOBYPASSRLS`
- 只有在这种运行时语义下，RLS、FK、tenant context 与写路径错误才会真实暴露

### 5. 多租户变更的最低真实验证基线固定

凡是触及以下任一项的变更：

- `tenant_id` schema / migration
- RLS policy
- tenant context SQL
- `tenant:init` / `db:seed`
- 租户感知写路径
- 超管跨租户管理边界

在收口前至少要通过一次真实 PostgreSQL 验证，覆盖：

- `tenant:init` 首次初始化
- `tenant:init` 重跑幂等
- super-admin 可见 `/system/tenants`
- tenant admin 不可管理 `/system/tenants`
- 至少一个真实业务实体的跨租户写入与读取隔离
- persistence 层 RLS 隔离
- `tenant_id` 外键约束

当前基线命令固定为：

- `bun run e2e:tenant`
- `bun run e2e:tenant:full`

### 6. 连接生命周期属于多租户升级稳定性的一部分

- `db:seed`
- `tenant:init`
- 真实 PostgreSQL tenant e2e harness

以上执行路径都必须显式回收数据库连接，避免重复执行后出现 `too many clients`，从而把环境噪音误判为租户逻辑故障。

### 7. canonical owner 不变

- 多租户 schema、migration、tenant context SQL、bootstrap 逻辑继续由 `packages/persistence` 持有
- 租户 HTTP 管理接口、鉴权装配、identity 注入继续由 `apps/server` 持有
- 本 ADR 不引入新的 package owner
- 本 ADR 不新增第二套 tenant middleware 或第二套 bootstrap helper

## 理由

### 为什么要区分默认租户和非默认租户路径

- 默认租户是平台基线，不等同于普通业务租户
- `db:seed` 负责平台默认数据，`tenant:init` 负责 tenant 级 additive bootstrap，两者目标不同
- 路径混用会让初始化语义、冲突目标和回滚方式全部变模糊

### 为什么要把 fallback 视为兜底而不是主路径

- fallback 能保证旧调用不立即崩，但它会掩盖服务层漏传 `tenantId`
- 真实 PostgreSQL + RLS/FK 场景下，这类问题会以更昂贵的方式暴露
- 明确“显式透传优先”可以避免后续模块重复踩到同一类 bug

### 为什么必须用非 superuser 验证

- superuser 会绕过很多真实运行时边界
- 多租户最核心的价值就是“在真实业务权限下仍然隔离”
- 如果验证主体不接近生产运行时，测试通过并不能说明隔离真的成立

### 为什么把连接回收写进 ADR

- 这不是单纯的脚本实现细节，而是多租户升级链路的稳定性前提
- 如果 migration / seed / bootstrap / e2e 在重复执行时持续泄漏连接，后续阶段会频繁把环境问题误诊为 RLS 或 migration 问题

## 不选其他路线的原因

- 不选择“只靠 in-memory test + code review”：
  无法证明 PostgreSQL RLS、FK 和 runtime role 语义真的成立。
- 不选择“所有租户都统一走 db:seed”：
  会把平台默认数据和 tenant 级 bootstrap 混成一个入口，削弱幂等和责任边界。
- 不选择“所有 tenant 规则都在 `apps/server` 兜底”：
  tenant schema、migration、bootstrap 和 SQL context 的 canonical owner 已经在 `packages/persistence`，不应漂移。
- 不选择“先不固定验证门槛，等 CI 再说”：
  那会导致本地通过标准和阶段退出标准继续摇摆。

## 影响

- 后续多租户相关改动在收口前必须至少执行一次真实 PostgreSQL tenant e2e
- `tenant:init` 与 `db:seed` 的职责边界正式固定
- 新增租户感知写路径时，代码审查必须显式检查 tenant identity 是否透传
- 后续若将 `e2e:tenant:full` 接入 CI，应视为本 ADR 的执行延伸，而不是新决策

## 暂不决策项

- 是否立即把 `e2e:tenant:full` 接入 CI 强制门禁
- tenant e2e 的运行频率、触发矩阵和时长阈值
- 多租户大规模数据回填或历史单租户升级脚本的具体发布节奏
- 是否补独立的租户运维 runbook

这些内容在后续实施文档或 CI/发布相关 ADR 中继续细化，但不影响当前先固定升级与验证边界。
