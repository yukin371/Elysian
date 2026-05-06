# 数据库备份与恢复责任模板

更新时间：`2026-05-06`

本文档用于把 `go-live` 前的数据库备份、恢复点和恢复责任固化成可归档记录。

## 适用场景

- 首次正式上线
- 触及 migration 的版本发布
- 触及 tenant / RLS / `tenant_id` / seed / bootstrap 的变更

## 使用规则

- 该模板只记录“目标环境这一次发布”的真实状态
- 未确认的项保持空白或写 `blocked`
- 不要把本地验证结果直接冒充目标环境恢复证据

## 责任模板

```text
release environment:
release commit / tag / PR:
release date window:

database owner:
dba / environment owner:
release coordinator:

database engine:
database host / cluster:
affected databases / schemas:

migration list:
- 

backup strategy:
- snapshot / dump / platform backup / other:

backup ready:
- true / false

backup created at:
backup created by:
backup id / snapshot id:
backup storage location:

restore point target:
restore point description:

restore owner:
restore command / platform action:
restore expected duration:

rollback decision owner:
rollback stop condition:

post-restore validation owner:
post-restore validation steps:
- 

notes:
```

## 最小证据要求

至少应留下：

- 备份时间
- 备份 ID、快照 ID 或等价定位符
- 恢复执行人
- 恢复动作说明
- 回滚判定人

## 阻断条件

出现以下任一项，不应进入正式上线：

- 无法确认备份是否完成
- 无法确认恢复点
- 无法确认恢复执行 owner
- migration 已锁定，但回滚路径仍不明确

## 建议归档位置

- 发布记录
- 变更单
- 值班记录
- 或 `docs/plans/*` 下当前轮次的发布收尾文档
