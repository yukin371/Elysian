# menu

`menu` 负责系统菜单树、菜单权限码和菜单-角色关联的最小后端闭环。

## Owns

- `/system/menus` 的列表、详情、创建、更新。
- 菜单树父子关系与环路校验。
- 菜单 `permissionCode` 和 `roleIds` 的引用有效性检查。

## Must Not Own

- 菜单渲染、路由跳转和前端导航布局。
- 权限码定义 owner 本身。
- 跨模块的通用树服务。

## Depends On

- `../auth`：权限点 `system:menu:list/update`。
- `@elysian/persistence`：menus、role_menus、permission lookup、role lookup。
- `@elysian/schema`：菜单记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/menus] --> B[module.ts]
  B --> C[service.ts\ncode/name/parent/permission/roles]
  C --> D[repository.ts]
  D --> E[menus]
  D --> F[role_menus / permissions / roles]
```

## Validation

- `service.ts` 已确认 `code/name` 非空且 `code` 唯一。
- `service.ts` 已确认 `parentId` 不存在、自指或成环都会被拦截。
- `service.ts` 已确认 `permissionCode` 必须能在既有权限集合中找到，`roleIds` 也必须全部存在。
- `repository.ts` 已确认菜单-角色替换仍在 persistence owner 内完成。
