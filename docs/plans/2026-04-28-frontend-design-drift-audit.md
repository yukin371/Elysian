# 2026-04-28 Frontend Design Drift Audit

## 目标

- 按最新 `DESIGN.md` 约束盘点当前前端页面的显性风格漂移。
- 固定“C 端和 B 端可以不同，但单个应用内部必须一致”的执行口径。
- 为后续页面回收提供最小问题清单，不在本文件内直接扩大实现范围。

## 审计范围

- `packages/ui-enterprise-vue`
- `apps/example-vue`
- `apps/example-uniapp`

## 审计口径

重点只看以下几类偏差：

1. 研发态文案是否仍暴露给默认界面
2. 同一应用内是否存在第二套主题色/圆角/阴影体系
3. 容器语义是否混乱到影响应用内一致性
4. 是否有局部实现绕开 `DESIGN.md`

## 当前结论

### A. `apps/example-uniapp`

当前首轮 4 个页面与 `apps/example-uniapp/DESIGN.md` 基本一致：

- 主色已统一回 `#2457d6`
- 主面板、按钮、输入框和状态胶囊语义已统一
- 默认可见文案已清理 `骨架 / 占位 / 后续接入`

当前未发现新的明显设计漂移 blocker。

### B. `apps/example-vue`

当前首轮显性漂移回收已完成，剩余事项转为后续观察项。

#### B1. 默认可见或默认可达文案的研发态措辞已完成首轮回收

本轮已回收的示例：

- [apps/example-vue/src/i18n.ts](/E:/Github/Elysian/apps/example-vue/src/i18n.ts:115)
- [apps/example-vue/src/i18n.ts](/E:/Github/Elysian/apps/example-vue/src/i18n.ts:117)
- [apps/example-vue/src/i18n.ts](/E:/Github/Elysian/apps/example-vue/src/i18n.ts:731)
- [apps/example-vue/src/i18n.ts](/E:/Github/Elysian/apps/example-vue/src/i18n.ts:751)
- [apps/example-vue/src/i18n.ts](/E:/Github/Elysian/apps/example-vue/src/i18n.ts:767)

当前已改为：

- `页面说明`
- `接入中`
- `接入说明`
- `real workspace loop / informational page`

#### B2. 应用外层展示壳已收回到较克制的应用级差异

示例：

- [apps/example-vue/src/style.css](/E:/Github/Elysian/apps/example-vue/src/style.css:54)
- [apps/example-vue/src/style.css](/E:/Github/Elysian/apps/example-vue/src/style.css:60)

本轮前存在：

- `20px` 大圆角
- `0 18px 42px` 的较重阴影

当前已收回为：

- `16px` 主面板圆角
- `0 14px 32px` 的轻量阴影

同时已在 [apps/example-vue/DESIGN.md](/E:/Github/Elysian/apps/example-vue/DESIGN.md:1) 明确：`example-vue` 可以保留深色玻璃感外层壳，但不得继续扩大圆角和阴影强度。

#### B3. workspace 层局部半径与阴影漂移已完成首轮回收

本轮已回收的示例包括：

- [apps/example-vue/src/components/workspaces/file/FileWorkspaceMain.vue](/E:/Github/Elysian/apps/example-vue/src/components/workspaces/file/FileWorkspaceMain.vue:470)
- [apps/example-vue/src/components/workspaces/file/FileWorkspacePanel.vue](/E:/Github/Elysian/apps/example-vue/src/components/workspaces/file/FileWorkspacePanel.vue:1157)
- [apps/example-vue/src/components/workspaces/menu/MenuWorkspaceMain.vue](/E:/Github/Elysian/apps/example-vue/src/components/workspaces/menu/MenuWorkspaceMain.vue:574)
- [apps/example-vue/src/components/workspaces/workflow/WorkflowWorkspaceMain.vue](/E:/Github/Elysian/apps/example-vue/src/components/workspaces/workflow/WorkflowWorkspaceMain.vue:936)
- [apps/example-vue/src/components/workspaces/workflow/WorkflowWorkspacePanel.vue](/E:/Github/Elysian/apps/example-vue/src/components/workspaces/workflow/WorkflowWorkspacePanel.vue:1296)

本轮后复查结果：

- `apps/example-vue/src/components/workspaces` 内未再发现 `14px / 18px` 的局部圆角漂移
- 仅剩 [apps/example-vue/src/style.css](/E:/Github/Elysian/apps/example-vue/src/style.css:60) 的 `0 14px 32px` 外层壳阴影
- 该阴影已属于应用级差异，并已在 `apps/example-vue/DESIGN.md` 文档化，不再视为未控漂移

### C. `packages/ui-enterprise-vue`

共享预设当前整体仍保持在单一蓝色主轴与 `12/16/999` 半径体系附近，未发现新的显著漂移。

注意项：

- [packages/ui-enterprise-vue/src/components/ElyPreviewSkeleton.vue](/E:/Github/Elysian/packages/ui-enterprise-vue/src/components/ElyPreviewSkeleton.vue:1) 组件名仍带 `Skeleton`

这本身不一定要改，因为它是实现名而非默认用户文案；当前问题主要在“默认可见文字”，不是内部代码命名。

## 后续观察项

1. 若 `apps/example-vue` 后续继续扩展页面，再按当前 `DESIGN.md` 审查是否重新引入局部容器语义漂移
2. 评估是否需要把 `example-vue` 外层壳差异进一步收敛为更显式的应用级 token，但当前不作为立即改造项
3. 在后续功能回归窗口中补浏览器级视觉回归，确认文案、圆角、阴影与容器层级没有再漂移

## 本轮不建议做的事

- 不因为这次审计就把所有工作区样式抽成新的 shared token 包
- 不先做大规模全应用样式重写
- 不把 `MODULE.md` 与 `DESIGN.md` 职责重新混写
