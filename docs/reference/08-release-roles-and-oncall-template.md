# 发布角色与值守模板

更新时间：`2026-05-06`

本文档用于把一次正式上线的角色分工、前 30 分钟值守和首日升级路径固定成可执行记录。

## 使用规则

- 每次真实 `go-live` 前都应复制并填写一次
- 若角色未明确，不应继续推进发布
- 若多个角色由同一人承担，也要显式写明，不要留空

## 角色模板

```text
release environment:
release commit / tag / PR:
release date window:

release coordinator:
application owner:
dba / environment owner:
frontend release owner:
server release owner:

first 30m oncall:
first day oncall:
escalation manager:

log access owner:
metrics access owner:
proxy / tls owner:

incident channel:
escalation path:
fallback contact:

stop decision owner:
rollback coordination owner:

notes:
```

## 上线后前 30 分钟观察项

```text
- /health
- /metrics
- login
- core workspace list
- core write action
- 401 / 403 / 5xx
- database connection anomalies
```

## 首日持续观察项

```text
- tenant isolation anomalies
- file upload / download anomalies
- workflow runtime anomalies
- repeated auth refresh / session issues
```

## 阻断条件

出现以下任一项，不应进入正式上线：

- 发布负责人未明确
- 首 30 分钟值守人未明确
- 首日值守人未明确
- 异常升级路径未明确
- 数据库恢复 owner 未明确

## 建议归档位置

- 发布记录
- 值班表
- 变更单
- 或 `docs/plans/*` 下当前轮次的发布收尾文档
