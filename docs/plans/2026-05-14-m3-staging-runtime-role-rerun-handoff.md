# 2026-05-14 M3 Staging Runtime Role 重跑交接单

本单用于解除当前 `M3` 唯一 blocker：`cross-tenant isolation=false`。

适用范围：

- 目标环境：`staging`
- 当前候选 release tag：`v1.0.0`
- 当前应用修复提交：`c6d06d6`

不在本单中处理：

- migration 变更
- 业务代码再次修改
- 额外 go-live gate 规则调整

## 当前结论

`M1`、`M2` 已通过。

`M3` 当前仅剩一项失败：

- `cross-tenant isolation=false`

当前根因已确认：

- server runtime 使用了 table owner 连接数据库
- PostgreSQL RLS 对 table owner 默认不生效
- 即使开启 `FORCE ROW LEVEL SECURITY`，当前连接身份仍会导致跨租户读取

仓库内修复已提交：

- `c6d06d6` `fix(tenant): prefer runtime db url for server rls enforcement`

修复后的运行约束：

- server runtime 优先使用 `DATABASE_RUNTIME_URL`
- migration / seed / admin 路径继续使用 `DATABASE_URL`

## 环境侧必须满足的事实

`DATABASE_RUNTIME_URL` 对应的数据库角色必须：

- 不是 table owner
- 不是 superuser
- 不带 `BYPASSRLS`

建议与现有 tenant E2E 演练保持同一约束：

- `LOGIN`
- `NOSUPERUSER`
- `NOCREATEDB`
- `NOCREATEROLE`
- `NOINHERIT`
- `NOBYPASSRLS`

参考实现：

- [scripts/e2e-tenant-isolation.ts](/E:/Github/Elysian/scripts/e2e-tenant-isolation.ts:424)
- [apps/server/src/index.ts](/E:/Github/Elysian/apps/server/src/index.ts:19)
- [packages/persistence/src/config.ts](/E:/Github/Elysian/packages/persistence/src/config.ts:33)

## DBA 执行模板

以下 SQL 为最小模板。执行前只替换角色名、密码和数据库名，不要把角色建成 owner。

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'elysian_runtime') THEN
    EXECUTE 'DROP OWNED BY ' || quote_ident('elysian_runtime');
    EXECUTE 'DROP ROLE ' || quote_ident('elysian_runtime');
  END IF;
END
$$;

CREATE ROLE elysian_runtime
WITH LOGIN
PASSWORD '<replace-with-secret>'
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
NOINHERIT
NOBYPASSRLS;

GRANT CONNECT ON DATABASE elysian TO elysian_runtime;
GRANT USAGE ON SCHEMA public TO elysian_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO elysian_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO elysian_runtime;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO elysian_runtime;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO elysian_runtime;
```

若 `staging` 数据库名不是 `elysian`，替换为真实库名。

## 环境变量注入模板

server runtime 必须同时区分两条连接串：

```text
DATABASE_URL=postgres://<owner-or-migration-user>:<password>@<host>:<port>/<db>
DATABASE_RUNTIME_URL=postgres://elysian_runtime:<password>@<host>:<port>/<db>
```

规则：

- `DATABASE_URL` 保留给 migration / seed / admin 路径
- `DATABASE_RUNTIME_URL` 只给 server runtime 使用
- 不要把 `DATABASE_RUNTIME_URL` 配回 `postgres` 或当前表 owner

## 发布执行顺序

1. DBA 创建或更新 runtime 受限角色。
2. 环境 owner 在 `staging` 注入 `DATABASE_RUNTIME_URL`。
3. 重启 server，使 [apps/server/src/index.ts](/E:/Github/Elysian/apps/server/src/index.ts:19) 重新读取 runtime 连接串。
4. 先验证：
   - `GET /health`
   - `GET /metrics`
5. 再重跑 `M3` tenant 附加验证，至少包含：
   - super-admin `/system/tenants`
   - tenant admin denied `/system/tenants`
   - non-default tenant login
   - cross-tenant isolation
6. 回填 `ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED=true`
7. 重跑：
   - `bun run go-live:report`
   - `bun run go-live:gate`

## 回填块

若重跑通过，可直接把以下块回填到临时 env：

```text
ELYSIAN_GO_LIVE_HEALTH_VERIFIED=true
ELYSIAN_GO_LIVE_METRICS_VERIFIED=true
ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED=true
ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED=true
ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED=true
ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED=true
```

## 失败时的停止条件

出现以下任一情况，不要继续推进 `M4`：

- `DATABASE_RUNTIME_URL` 仍指向 owner / superuser / `BYPASSRLS` 角色
- 重启后 `/health` 或 `/metrics` 失败
- tenant B 仍可读取 tenant A 数据
- tenant admin 权限边界回归异常

当前默认处理：

- 保持 `M3=blocked`
- 继续由应用 owner + DBA 联合排查
- 不进入 release 放行结论
