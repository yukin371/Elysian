# 系统设计 v2：Phase 7+ 产品需求文档

> 创建日期：2026-04-24
> 状态：PRD 定稿
> 范围：Phase 7（企业业务平台）、Phase 8（AI 智能化与蓝图）、Phase 9（平台扩展与生态）
> 前置：Phase 6B（多租户与数据权限）完成

---

## 1. 设计背景与动机

Elysian 已完成 Phase 1–6A 的交付，Phase 6B（多租户 + 数据权限）正在进行。当前平台具备了：

- 完整的认证鉴权体系（RBAC + JWT）
- 11 个标准企业模块
- 代码生成器（schema → 前后端代码）
- AI 辅助 schema 生成（P5A）
- 生产基线（Docker、E2E、可观测性、安全加固）

但这些能力仍停留在"开发平台"层面。企业客户从"能用"到"好用"的关键差距在于：

1. **工作流引擎**：OA、审批、订单流转等场景的刚需，是承载复杂业务的前提
2. **安全合规**：等保二级/三级要求（密码策略、登录锁定、审计完整性）是政企客户的准入门槛
3. **统一消息**：站内信/邮件/实时推送是系统联通的基础
4. **蓝图复用**：解决"相同模块重复搭建"的效率瓶颈
5. **AI 智能化**：从单点辅助进化到多 Agent 全自动流水线
6. **多框架/生态**：扩大技术覆盖面，吸引开发者共建

本文档重新定义 Phase 7–9 的范围、拆分和依赖关系，取代原 Phase 7 的初步定义。

---

## 2. 阶段总览

```text
Phase 6B (进行中)          Phase 7 (新)              Phase 8 (新)           Phase 9 (新)
多租户 + 数据权限  ──→  企业业务平台  ──→  AI 智能化与蓝图  ──→  平台扩展与生态
```

| 阶段 | 主题 | 优先级 | 核心交付 |
|---|---|---|---|
| **Phase 7** | 企业业务平台 | P0 + P1 | 工作流 DAG 引擎、安全合规（等保）、统一消息中心 |
| **Phase 8** | AI 智能化与蓝图 | P1 + P3 | 蓝图 + Studio 控制台、多 Agent 编排、AI 审计工具 |
| **Phase 9** | 平台扩展与生态 | P2 + P4 | 多框架适配、i18n/主题、社区/插件/模板市场 |

### 依赖关系图

```text
Phase 6B (租户隔离)
  │
  └──→ Phase 7
         │
         ├── P7A 工作流引擎 (DAG)
         │     │
         │     ├──→ P7C 统一消息中心 (工作流事件驱动消息路由)
         │     │
         │     └──→ P8A 蓝图 (蓝图可包含工作流定义)
         │
         ├── P7B 安全合规 (可与 P7A 并行)
         │
         └──→ Phase 8
               │
               ├── P8A 蓝图 + Studio
               │     │
               │     └──→ P9C 社区生态 (市场需要蓝图基础)
               │
               ├── P8B 多 Agent 编排 (依赖 P5B/C)
               │     │
               │     └──→ P8C AI 审计工具
               │
               └──→ Phase 9
                     │
                     ├── P9A 多框架适配
                     │     │
                     │     └──→ P9B i18n + 主题
                     │
                     └── P9C 社区生态
```

---

## 3. Phase 7：企业业务平台

> **目标**：让 Elysian 从"开发平台"升级为可承载复杂业务的企业平台
> **前置条件**：Phase 6B 完成（租户隔离 + 数据权限）
> **预计周期**：2–3 个月

### 3.1 P7A：工作流引擎

#### 目标

构建全功能 DAG 编排引擎，支持审批链和通用 DAG 编排两种模式。参考 warm-flow 的轻量化思路，避免 Flowable 的过度复杂。

#### 参考对象

| 框架 | 借鉴点 |
|---|---|
| warm-flow | 轻量化设计、不依赖流程图规范、审批链 + 状态机双模式 |
| Flowable / Camunda | DAG 编排、并行网关、条件分支、定时器节点的成熟模式 |
| RuoYi-Vue-Plus | warm-flow 集成实践、审批流与业务表单的绑定模式 |

#### 核心设计

##### 流程定义 Schema

```yaml
# 流程定义示例（YAML 格式，也支持 JSON）
key: expense-approval
name: 报销审批流
version: 1
tenant_id: default

nodes:
  - id: submit
    type: start
    name: 提交申请

  - id: manager-review
    type: approval
    name: 主管审批
    assignee: ${dept_manager}
    multi_instance: sequential  # sequential | parallel
    timeout:
      duration: 24h
      action: auto-approve | escalate | notify

  - id: amount-check
    type: condition
    name: 金额判断
    conditions:
      - expression: "${amount > 5000}"
        target: finance-review
      - expression: "default"
        target: end-approved

  - id: finance-review
    type: approval
    name: 财务审批
    assignee: role:finance
    timeout:
      duration: 48h

  - id: end-approved
    type: end
    name: 审批通过

  - id: end-rejected
    type: end
    name: 审批驳回

edges:
  - from: submit
    to: manager-review
  - from: manager-review
    to: amount-check
  - from: finance-review
    to: end-approved
```

##### 节点类型

| 类型 | 说明 | 行为 |
|---|---|---|
| `start` | 开始节点 | 触发流程实例创建 |
| `end` | 结束节点 | 标记流程结束 |
| `approval` | 审批节点 | 分配任务给指定人/角色，等待审批操作 |
| `condition` | 条件节点 | 根据表达式路由到不同分支 |
| `parallel` | 并行网关 | 分支/汇聚，所有分支完成后才继续 |
| `timer` | 定时器节点 | 延迟执行或定时触发 |
| `script` | 脚本节点 | 执行自定义逻辑（受限沙箱） |
| `notification` | 通知节点 | 触发消息推送（与 P7C 消息中心联动） |
| `subprocess` | 子流程 | 嵌入另一个流程定义 |

##### 流程实例状态机

```
created → running → suspended → running（可恢复）
                  → completed
                  → terminated（可终止）
```

任务状态：`pending → claimed → completed / rejected / transferred / delegated`

##### 租户感知

- 流程定义按 `tenant_id` 隔离
- 流程实例继承发起人的租户上下文
- 审批任务的候选人查询受数据权限约束

#### Schema 变更

##### workflow_definitions 表

```sql
CREATE TABLE workflow_definitions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        VARCHAR(128) NOT NULL,
  name       VARCHAR(256) NOT NULL,
  version    INTEGER NOT NULL DEFAULT 1,
  definition JSONB NOT NULL,          -- 完整流程定义
  status     VARCHAR(16) NOT NULL DEFAULT 'active',  -- active | disabled
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, version, tenant_id)
);
```

##### workflow_instances 表

```sql
CREATE TABLE workflow_instances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id   UUID NOT NULL REFERENCES workflow_definitions(id),
  definition_key  VARCHAR(128) NOT NULL,
  business_key    VARCHAR(256),              -- 关联业务表单 ID
  business_type   VARCHAR(64),               -- 业务类型（如 "expense"）
  status          VARCHAR(16) NOT NULL DEFAULT 'running',
  variables       JSONB,                     -- 流程变量
  initiator_id    UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);
```

##### workflow_tasks 表

```sql
CREATE TABLE workflow_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id     UUID NOT NULL REFERENCES workflow_instances(id),
  node_id         VARCHAR(128) NOT NULL,
  node_name       VARCHAR(256),
  task_type       VARCHAR(32) NOT NULL,      -- approval | script | notification
  status          VARCHAR(16) NOT NULL DEFAULT 'pending',
  assignee_id     UUID REFERENCES users(id), -- 单人
  candidate_users UUID[],                    -- 多候选人
  candidate_roles VARCHAR[],                 -- 候选角色
  variables       JSONB,
  outcome         VARCHAR(32),               -- approved | rejected
  comment         TEXT,
  due_at          TIMESTAMPTZ,
  claimed_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### API 设计

| 接口 | 说明 |
|---|---|
| `POST /workflow/definitions` | 创建流程定义 |
| `GET /workflow/definitions` | 流程定义列表 |
| `GET /workflow/definitions/:id` | 流程定义详情 |
| `PUT /workflow/definitions/:id` | 更新流程定义（生成新版本） |
| `POST /workflow/instances` | 发起流程实例 |
| `GET /workflow/instances` | 流程实例列表（支持按状态/业务类型筛选） |
| `GET /workflow/instances/:id` | 流程实例详情（含当前节点 + 历史） |
| `POST /workflow/instances/:id/cancel` | 终止流程 |
| `POST /workflow/instances/:id/suspend` | 挂起流程 |
| `POST /workflow/instances/:id/resume` | 恢复流程 |
| `GET /workflow/tasks/todo` | 我的待办 |
| `GET /workflow/tasks/done` | 我的已办 |
| `POST /workflow/tasks/:id/claim` | 认领任务 |
| `POST /workflow/tasks/:id/complete` | 完成任务（审批通过/驳回） |
| `POST /workflow/tasks/:id/transfer` | 转办任务 |
| `POST /workflow/tasks/:id/delegate` | 委派任务 |

#### 权限点

| 权限码 | 说明 |
|---|---|
| `workflow:definition:list` | 查看流程定义 |
| `workflow:definition:create` | 创建流程定义 |
| `workflow:definition:update` | 更新流程定义 |
| `workflow:instance:start` | 发起流程 |
| `workflow:instance:cancel` | 终止流程 |
| `workflow:task:complete` | 完成任务 |
| `workflow:task:transfer` | 转办任务 |
| `workflow:task:delegate` | 委派任务 |

#### WBS

| WP | 目标 | 输出物 | 验证方式 |
|---|---|---|---|
| WP-1 | 流程定义 CRUD | `workflow_definitions` 表、定义管理 API | 创建/查询/版本管理流程定义 |
| WP-2 | DAG 执行引擎 | DAG 解析器、节点执行器、状态机 | 串行/并行/条件分支流程可执行 |
| WP-3 | 任务中心 | `workflow_tasks` 表、待办/已办 API、任务操作 | 审批/转办/委派/超时自动处理 |
| WP-4 | 业务集成 | `business_key` 关联、流程变量注入、回调机制 | 真实业务场景（如报销审批）跑通 |
| WP-5 | 租户隔离 | 流程定义和实例的租户过滤、RLS 策略 | 不同租户流程互不可见 |
| WP-6 | Seed 与测试 | 示例流程定义、E2E 审批流测试 | `bun run test` + `bun run e2e:smoke` 通过 |

#### Exit Gate

- [ ] DAG 流程可定义、可执行、可查询
- [ ] 审批/条件/并行/定时器 4 种核心节点类型可用
- [ ] 任务待办/已办/转办/委派可用
- [ ] 流程定义和实例按租户隔离
- [ ] 超时自动处理（自动通过/升级/通知）可用
- [ ] `bun run test` + `bun run check` 通过
- [ ] `bun run e2e:smoke` 通过

---

### 3.2 P7B：安全合规加固

#### 目标

在 P6A 安全基线之上，补充等保二级/三级核心要求，实现"安全合规开箱即用"。

#### 参考对象

| 框架 | 借鉴点 |
|---|---|
| RuoYi-SpringBoot3-Pro | 密码策略、登录锁定、IP 黑名单实现 |
| 等保二级要求 | 密码复杂度 + 定期更换、登录失败锁定、审计日志完整性、会话管理 |

#### 功能清单

##### 密码策略

| 策略 | 配置项 | 默认值 |
|---|---|---|
| 最小长度 | `password.minLength` | 8 |
| 复杂度要求 | `password.complexity` | 大写+小写+数字+特殊字符中的 3 种 |
| 有效期（天） | `password.expireDays` | 90 |
| 历史密码检查 | `password.historyCount` | 5（不能重复最近 5 次密码） |
| 首次登录强制修改 | `password.forceChangeOnFirstLogin` | true |

Schema 变更：
```sql
ALTER TABLE users ADD COLUMN password_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN force_password_change BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE user_password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(256) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

##### 登录锁定

| 策略 | 配置项 | 默认值 |
|---|---|---|
| 最大失败次数 | `login.maxFailAttempts` | 5 |
| 锁定时长（分钟） | `login.lockDuration` | 30 |
| 验证码触发次数 | `login.captchaAfterFailures` | 3 |

Schema 变更：
```sql
ALTER TABLE users ADD COLUMN login_fail_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMPTZ;
```

##### IP 黑白名单

- 全局 IP 白名单：只允许指定 IP 段访问
- 全局 IP 黑名单：拒绝指定 IP 访问
- 租户级 IP 限制（可选）
- 配置存储在 `system_settings`，中间件层拦截

##### 审计日志完整性

- 审计日志追加写入（不可修改、不可删除）
- 关键字段哈希校验（防篡改）
- 审计日志独立查询 API（区别于操作日志）

Schema 变更：
```sql
-- 审计日志追加表（INSERT ONLY）
CREATE TABLE audit_trail (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action     VARCHAR(64) NOT NULL,
  resource   VARCHAR(128) NOT NULL,
  resource_id VARCHAR(128),
  actor_id   UUID REFERENCES users(id),
  actor_name VARCHAR(128),
  detail     JSONB,
  checksum   VARCHAR(64) NOT NULL,  -- SHA-256 防篡改
  ip_address VARCHAR(45),
  user_agent TEXT,
  tenant_id  UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 防止 UPDATE/DELETE 的触发器
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit trail records cannot be modified';
END;
$$ LANGUAGE plpgsql;
```

#### WBS

| WP | 目标 | 输出物 | 验证方式 |
|---|---|---|---|
| WP-1 | 密码策略 | 密码复杂度校验、过期提醒、历史检查、首次登录强制修改 | 弱密码被拒绝、过期密码需重置 |
| WP-2 | 登录锁定 | 失败计数、自动锁定、自动解锁 | 连续 5 次失败后锁定 30 分钟 |
| WP-3 | IP 黑白名单 | 全局 IP 中间件、配置管理 API | 黑名单 IP 被拒绝，白名单外 IP 被拒绝 |
| WP-4 | 审计日志完整性 | `audit_trail` 表、防篡改触发器、哈希校验 | 审计记录不可修改/删除，篡改可检测 |
| WP-5 | Seed 与测试 | 安全策略 seed、测试覆盖 | `bun run test` + `bun run check` 通过 |

#### Exit Gate

- [ ] 密码复杂度/过期/历史检查全部可用
- [ ] 登录失败锁定 + 自动解锁可用
- [ ] IP 黑白名单拦截可用
- [ ] 审计日志不可修改/删除
- [ ] `bun run test` + `bun run check` 通过

---

### 3.3 P7C：统一消息中心

#### 目标

扩展现有通知模块（P3.9），统一站内信、邮件、WebSocket/SSE 推送，建立可配置的多通道消息体系。

#### 设计原则

- **扩展现有模块**：不重建，在 `notifications` 基础上扩展通道和模板
- **事件驱动**：消息由工作流事件、系统事件、业务事件触发
- **模板化**：消息内容通过模板渲染，支持变量替换
- **实时优先**：WebSocket/SSE 用于实时推送，站内信作为持久化兜底

#### 参考对象

| 框架 | 借鉴点 |
|---|---|
| RuoYi / RuoYi-Plus | 站内信 + 邮件 + 短信多通道通知 |
| Supabase Realtime | WebSocket 频道订阅模式 |
| Bun 能力 | 利用 Bun 的流式处理实现 SSE/WebSocket |

#### 核心设计

##### 消息通道

| 通道 | 实现方式 | 适用场景 |
|---|---|---|
| `station` | 站内信（现有 `notifications` 表） | 所有通知的持久化存储 |
| `email` | SMTP 发送 | 重要通知、报表、审批提醒 |
| `websocket` | WebSocket 频道推送 | 实时在线通知、协作消息 |
| `sse` | Server-Sent Events | 轻量实时推送（不需要双向通信时） |

##### 消息模板

```typescript
interface MessageTemplate {
  id: string
  key: string               // 模板标识，如 "workflow.task-assigned"
  channel: string           // 适用通道
  subject: string           // 标题模板
  body: string              // 内容模板（支持变量插值）
  tenantId: string
}
```

示例：
```
key: workflow.task-assigned
subject: 您有一条新的审批任务：${processName}
body: ${initiatorName} 提交的 ${processName} 需要您审批，请及时处理。
```

##### 消息路由

```typescript
interface MessageRoute {
  event: string             // 事件标识（如 "workflow.task.created"）
  channels: string[]        // 投递通道（如 ["station", "websocket"]）
  templateKey: string       // 关联模板
  recipientResolver: string // 收件人解析策略
}
```

##### Schema 变更

```sql
-- 消息模板表
CREATE TABLE message_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        VARCHAR(128) NOT NULL,
  channel    VARCHAR(32) NOT NULL,
  subject    VARCHAR(512) NOT NULL,
  body       TEXT NOT NULL,
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, channel, tenant_id)
);

-- 消息路由表
CREATE TABLE message_routes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event               VARCHAR(128) NOT NULL,
  channels            JSONB NOT NULL,          -- ["station", "websocket"]
  template_key        VARCHAR(128) NOT NULL,
  recipient_resolver  VARCHAR(64) NOT NULL,    -- initiator | assignee | role | all
  enabled             BOOLEAN NOT NULL DEFAULT true,
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event, tenant_id)
);

-- 现有 notifications 表扩展
ALTER TABLE notifications ADD COLUMN channel VARCHAR(32) NOT NULL DEFAULT 'station';
ALTER TABLE notifications ADD COLUMN message_template_id UUID REFERENCES message_templates(id);
```

#### API 设计

| 接口 | 说明 |
|---|---|
| `GET /messages/templates` | 消息模板列表 |
| `POST /messages/templates` | 创建消息模板 |
| `PUT /messages/templates/:id` | 更新消息模板 |
| `GET /messages/routes` | 消息路由列表 |
| `POST /messages/routes` | 创建消息路由 |
| `PUT /messages/routes/:id` | 更新消息路由 |
| `GET /messages/channels` | 可用通道列表 |
| `POST /messages/send` | 手动发送消息（指定通道和收件人） |
| `WebSocket /ws/messages` | 实时消息推送 |
| `GET /messages/sse` | SSE 消息流 |

#### WBS

| WP | 目标 | 输出物 | 验证方式 |
|---|---|---|---|
| WP-1 | 消息模板 | `message_templates` 表、模板 CRUD API、变量渲染 | 模板可创建并正确渲染变量 |
| WP-2 | 消息路由 | `message_routes` 表、路由 CRUD API、事件→通道分发 | 事件触发后消息按路由投递到正确通道 |
| WP-3 | 邮件通道 | SMTP 集成、邮件发送、发送记录 | 邮件可发送并送达 |
| WP-4 | WebSocket 通道 | WebSocket 服务、频道订阅、实时推送 | 在线用户实时收到通知 |
| WP-5 | SSE 通道 | SSE 端点、事件流 | SSE 客户端收到实时推送 |
| WP-6 | 工作流集成 | 工作流事件（任务创建/完成/超时）触发消息 | 审批任务自动发送通知 |
| WP-7 | Seed 与测试 | 默认模板和路由 seed、E2E 测试 | `bun run test` + `bun run check` 通过 |

#### Exit Gate

- [ ] 站内信 + 邮件 + WebSocket + SSE 4 个通道可用
- [ ] 消息模板可配置、变量可渲染
- [ ] 消息路由可按事件自动分发到指定通道
- [ ] 工作流事件可自动触发消息推送
- [ ] WebSocket 在线用户可实时收到通知
- [ ] `bun run test` + `bun run check` 通过
- [ ] `bun run e2e:smoke` 通过

---

## 4. Phase 8：AI 智能化与蓝图体系

> **目标**：让 AI 从"辅助生成"升级为"智能编排"，同时建立蓝图复用体系
> **前置条件**：Phase 7 完成 + Phase 5B/C 完成
> **预计周期**：2–3 个月

### 4.1 P8A：蓝图与 Studio 控制台

#### 目标

建立蓝图管理和 Studio 控制台，实现模块的可复用、可组合、可视化管理。

#### 参考对象

| 框架 | 借鉴点 |
|---|---|
| Amplication v3.9.0 | 蓝图管理、模板一键复用、服务组合 |
| JHipster | 模块化架构选择、技术栈组合 |

#### 蓝图 Schema

```typescript
interface Blueprint {
  id: string
  key: string                    // 蓝图标识
  name: string                   // 蓝图名称
  description: string
  version: string

  modules: BlueprintModule[]     // 包含的模块列表
  integrations: Integration[]    // 模块间集成关系
  workflows: WorkflowBinding[]   // 关联的工作流定义
  permissions: PermissionSet[]   // 权限点集合
  configs: ConfigTemplate[]      // 配置模板

  tenantId: string
  createdAt: Date
  updatedAt: Date
}

interface BlueprintModule {
  schemaRef: string              // 指向 entity schema
  required: boolean              // 是否必须
  configOverrides?: Record<string, unknown>
}

interface Integration {
  from: string                   // 源模块
  to: string                     // 目标模块
  type: 'reference' | 'event' | 'workflow'
  config?: Record<string, unknown>
}

interface WorkflowBinding {
  definitionKey: string          // 工作流定义 key
  businessType: string           // 关联的业务类型
}
```

#### 内置蓝图

| 蓝图 | 包含模块 | 适用场景 |
|---|---|---|
| OA 审批系统 | 用户 + 部门 + 角色 + 工作流 + 消息 + 文件 | 企业 OA、审批管理 |
| CRM 客户管理 | 客户 + 用户 + 角色 + 字典 + 通知 | 客户关系管理 |
| 资产管理 | 资产实体 + 部门 + 角色 + 工作流 + 文件 | 固定资产/IT 资产 |
| 项目管理 | 项目实体 + 用户 + 角色 + 工作流 + 消息 | 项目协作 |

#### Studio 控制台

基于 Vue 3 + Arco Design 的 Web 管理控制台：

| 功能模块 | 说明 |
|---|---|
| 仪表盘 | 租户概览、用户活跃度、系统健康、最近操作 |
| 模块管理 | 查看/启停/配置已安装模块 |
| 生成预览 | 可视化预览 generator 输出（文件列表 + diff） |
| 蓝图管理 | 蓝图 CRUD、从蓝图一键生成项目 |
| 工作流管理 | 流程定义可视化编辑、实例监控 |
| 消息管理 | 模板编辑、路由配置、推送统计 |

#### Schema 变更

```sql
-- 蓝图表
CREATE TABLE blueprints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(128) NOT NULL,
  name        VARCHAR(256) NOT NULL,
  description TEXT,
  version     VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  definition  JSONB NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT false,  -- 官方蓝图
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, tenant_id)
);

-- 蓝图应用记录
CREATE TABLE blueprint_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id  UUID NOT NULL REFERENCES blueprints(id),
  applied_by    UUID NOT NULL REFERENCES users(id),
  status        VARCHAR(16) NOT NULL DEFAULT 'applied',
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id)
);
```

#### WBS

| WP | 目标 | 输出物 | 验证方式 |
|---|---|---|---|
| WP-1 | 蓝图 Schema 与 CRUD | `blueprints` 表、蓝图管理 API | 蓝图可创建/查询/更新/删除 |
| WP-2 | 内置蓝图 | OA、CRM、资产管理、项目管理 4 个官方蓝图 | 从蓝图一键生成可运行项目 |
| WP-3 | Studio 仪表盘 | 租户概览、系统健康、最近操作 | Studio 可访问并展示实时数据 |
| WP-4 | Studio 模块管理 | 模块列表、启停、配置 | 模块可通过 Studio 管理 |
| WP-5 | Studio 生成预览 | 生成文件列表、diff 预览 | Studio 可预览 generator 输出 |
| WP-6 | Studio 蓝图管理 | 蓝图浏览、应用、历史 | Studio 可管理蓝图全生命周期 |
| WP-7 | Seed 与测试 | 蓝图 seed、Studio E2E 测试 | `bun run test` + `bun run e2e:smoke` 通过 |

#### Exit Gate

- [ ] 蓝图可定义、可复用、可从蓝图生成完整项目
- [ ] 4 个内置蓝图可一键生成可运行项目
- [ ] Studio 控制台可访问，仪表盘/模块/蓝图管理可用
- [ ] Studio 生成预览可展示 diff
- [ ] `bun run test` + `bun run check` 通过

---

### 4.2 P8B：多 Agent 编排

#### 目标

构建 LangGraph 式的 Agent DAG 编排系统，实现代码生成 + Lint 修复 + 测试生成的全自动流水线。

#### 参考对象

| 框架 | 借鉴点 |
|---|---|
| LangGraph | Agent DAG 图、状态机、条件分支、人机协作节点 |
| Claude Code | 多 Agent 协同、Agent 调度模式 |

#### Agent DAG 设计

```typescript
interface AgentDag {
  id: string
  name: string
  nodes: AgentNode[]
  edges: AgentEdge[]
}

interface AgentNode {
  id: string
  type: 'agent' | 'human' | 'condition' | 'parallel'
  agent?: string                // Agent 标识（如 "codegen", "lint", "testgen"）
  config?: Record<string, unknown>
  timeout?: number
}

interface AgentEdge {
  from: string
  to: string
  condition?: string            // 条件表达式
}
```

#### 内置 Agent

| Agent | 输入 | 输出 | 说明 |
|---|---|---|---|
| `schema-analyzer` | 自然语言需求 | 结构化 schema | 从需求提取实体定义 |
| `codegen` | Entity schema | 前后端代码 | 生成完整 CRUD 代码 |
| `lint-fix` | 生成的代码 | Lint 通过的代码 | 自动修复 Lint 问题 |
| `testgen` | Entity schema + 代码 | 单元测试 + 集成测试 | 生成测试用例 |
| `reviewer` | 代码 + 变更 | 审查报告 | 代码质量审查 |

#### Agent 产出追踪

```sql
CREATE TABLE agent_runs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dag_id     VARCHAR(128) NOT NULL,
  dag_name   VARCHAR(256),
  status     VARCHAR(16) NOT NULL DEFAULT 'running',
  inputs     JSONB,
  outputs    JSONB,
  steps      JSONB,          -- 每个节点的输入/输出/状态
  triggered_by UUID REFERENCES users(id),
  tenant_id  UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);
```

#### WBS

| WP | 目标 | 输出物 | 验证方式 |
|---|---|---|---|
| WP-1 | Agent DAG 执行引擎 | DAG 解析器、Agent 调度器、状态机 | 简单 DAG（schema→codegen→lint）可执行 |
| WP-2 | 内置 Agent 实现 | 5 个内置 Agent | 各 Agent 独立可运行 |
| WP-3 | 人机协作节点 | 暂停/确认/回退机制 | DAG 可在关键节点暂停等待人工 |
| WP-4 | 产出追踪 | `agent_runs` 表、运行历史 API | 每次运行可追溯 |
| WP-5 | 测试 | Agent DAG E2E 测试 | `bun run test` 通过 |

#### Exit Gate

- [ ] Agent DAG 可定义、可执行
- [ ] 5 个内置 Agent 可独立运行
- [ ] 人机协作节点可暂停/确认
- [ ] 每次运行有完整追踪记录
- [ ] `bun run test` + `bun run check` 通过

---

### 4.3 P8C：AI 审计与调试工具

#### 目标

为 AI 生成的代码和设计方案提供版本对比、质量评分和依赖分析，践行"AI 只放大工程效率，不削弱工程质量"。

#### 核心功能

##### 版本对比

- Agent 产出的文件级 diff 对比
- 多版本间对比（不只是前后两个版本）
- 变更影响范围分析（哪些文件/模块受影响）

##### 质量评分

| 维度 | 指标 | 数据来源 |
|---|---|---|
| 完整性 | CRUD 是否齐全、权限点是否完整 | Schema 对比 |
| 规范性 | 是否符合代码规范、是否有 Lint 问题 | Biome + 自定义规则 |
| 测试覆盖 | 是否有测试、覆盖率多少 | Bun test |
| 安全性 | 是否有 SQL 注入/XSS 风险 | 静态分析 |
| 复用性 | 是否利用了现有组件/工具函数 | 依赖分析 |

##### 依赖分析面板

- 模块依赖关系图
- 新增依赖 vs 复用现有依赖
- 循环依赖检测

#### Schema 变更

```sql
-- AI 产出记录
CREATE TABLE ai_artifacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id  UUID NOT NULL REFERENCES agent_runs(id),
  file_path     VARCHAR(512) NOT NULL,
  content_hash  VARCHAR(64) NOT NULL,
  quality_score JSONB,           -- 各维度评分
  review_status VARCHAR(16) NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  reviewed_by   UUID REFERENCES users(id),
  tenant_id     UUID NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### WBS

| WP | 目标 | 输出物 | 验证方式 |
|---|---|---|---|
| WP-1 | 版本对比 | 文件级 diff、多版本对比 UI | 可对比 Agent 产出的不同版本 |
| WP-2 | 质量评分 | 5 维评分引擎、评分 API | 生成代码有自动质量评分 |
| WP-3 | 依赖分析 | 依赖关系图、循环检测 | 可展示模块依赖关系 |
| WP-4 | 审查工作流 | 人工审查、审批/驳回、反馈 | AI 产出可被人工审查和驳回 |

#### Exit Gate

- [ ] Agent 产出版本可对比
- [ ] 质量评分 5 维度可用
- [ ] 依赖关系可分析
- [ ] 人工审查可审批/驳回 AI 产出
- [ ] `bun run test` + `bun run check` 通过

---

## 5. Phase 9：平台扩展与生态

> **目标**：扩展技术覆盖面，建立开发者生态护城河
> **前置条件**：Phase 8 完成
> **预计周期**：2–3 个月

### 5.1 P9A：多框架适配

#### 目标

在现有 Vue 适配层基础上，正式化 React 适配层并新增 Angular 预设，实现同一 schema 生成 3 种前端框架代码。

#### 范围

| 框架 | 适配层 | 状态 | 目标 |
|---|---|---|---|
| Vue 3 | `packages/frontend-vue` + `packages/ui-enterprise-vue` | ✅ 已完成 | 持续维护 |
| React | `packages/frontend-react` | 📦 占位包 | 正式化，与 Vue 对齐 |
| Angular | 新建 `packages/frontend-angular` | ❌ 未开始 | 新增预设 |

#### WBS

| WP | 目标 | 输出物 |
|---|---|---|
| WP-1 | React 适配层正式化 | CRUD 页面生成、路由生成、状态管理、权限集成 |
| WP-2 | Angular 预设 | 项目脚手架、CRUD 页面生成、路由、权限 |
| WP-3 | Schema 多框架验证 | 同一 schema 生成 Vue/React/Angular 三套代码均可运行 |

### 5.2 P9B：国际化与主题

#### 目标

建立 i18n 框架和主题系统，使平台可适配不同语言和视觉风格。

#### 范围

| 能力 | 说明 |
|---|---|
| i18n 框架 | 后端多语言资源管理 + 前端动态切换 |
| 设计令牌 | Design Tokens 体系，支持 Arco Design 主题定制 |
| 暗色模式 | 基于设计令牌的暗色/亮色切换 |
| 移动端适配 | 响应式布局优化（不做独立移动端） |

### 5.3 P9C：社区与生态

#### 目标

建立插件机制、模板市场和贡献者体系，让外部开发者可共建生态。

#### 范围

| 能力 | 说明 |
|---|---|
| 插件机制 | 标准接入协议，第三方模块可注册到平台 |
| 模板市场 | 基于蓝图的共享平台，社区可上传/下载蓝图 |
| 贡献者路线图 | Good First Issue 标签、插件适配层接口文档 |
| 开发者文档 | 从 0 到 1 实战教程、API 文档、架构指南 |

---

## 6. 风险与关注点

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| DAG 工作流引擎复杂度过高 | P7A 延期 | 参照 warm-flow 保持轻量，DAG 节点类型分期交付 |
| WebSocket 连接管理性能 | P7C 实时推送瓶颈 | Bun 原生 WebSocket 支持好，必要时引入 Redis Pub/Sub |
| 多 Agent 产出质量不可控 | P8B 信任问题 | 质量评分 + 人工审查网关不可省略 |
| 蓝图抽象层级不当 | P8A 过度设计或不够灵活 | 先用 4 个内置蓝图验证抽象，再开放自定义 |
| React/Angular 适配层维护成本 | P9A 长期负担 | 适配层通过 ui-core 协议解耦，共享逻辑最大化 |
| Phase 7–9 周期过长 | 整体交付延迟 | 严格按 Exit Gate 控制，每个子阶段独立可用 |

---

## 7. 优先级矩阵

| 优先级 | 方向 | 阶段 | 核心价值 |
|---|---|---|---|
| **P0** | 工作流引擎 + 统一消息中心 | Phase 7 | 补齐企业级"硬菜"，从开发平台升级为企业业务承载平台 |
| **P1** | 安全合规 + 蓝图系统 | Phase 7B + Phase 8A | 缩小与若依/Amplication 的差距，等保开箱即用 |
| **P2** | 多框架适配 | Phase 9A | 扩大技术覆盖面，拉新更多开发者 |
| **P3** | 多 Agent 编排 + AI 审计 | Phase 8B/C | 持续领先的智能化体验 |
| **P4** | 社区/文档/蓝图市场 | Phase 9C | 营造生态，在开发者中建立口碑 |

---

## 8. 文档同步要求

本 PRD 定稿后，以下文档需同步更新：

- `docs/06-phased-implementation-plan.md`：更新 Phase 7/8/9 定义，替换原 Phase 7 内容
- `docs/roadmap.md`：同步当前活跃工作轨道
- `AGENTS.md`：更新阶段引用
- Phase 6B 完成后，按本 PRD 启动 Phase 7 规划
