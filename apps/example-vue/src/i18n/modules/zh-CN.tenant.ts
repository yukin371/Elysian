import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const zhCNTenantLocaleMessages: VueLocaleMessages = {
  "app.tenant.sectionTitle": "租户管理工作区",
  "app.tenant.sectionCopy":
    "租户页先收敛到真实列表、详情、基础编辑与状态切换，不提前扩成租户初始化编排台或跨租户治理中心。",
  "app.tenant.shellTitle": "租户工作区",
  "app.tenant.shellDescription":
    "列表与详情直接消费系统租户接口，当前只做最小闭环，并保持 super-admin 门禁显式可见。",
  "app.tenant.workspaceEyebrow": "真实模块工作区",
  "app.tenant.workspaceTitle": "系统租户清单",
  "app.tenant.workspaceDescription":
    "主区只承接查询与租户列表，右侧聚焦当前租户详情、基础编辑与状态切换，避免把治理动作摊成第二个主区。",
  "app.tenant.emptyTitle": "当前筛选条件下没有租户",
  "app.tenant.emptyDescription": "清空条件或调整关键字后重试。",
  "app.tenant.detailEyebrow": "租户详情",
  "app.tenant.detailEmptyTitle": "尚未选择租户",
  "app.tenant.detailEmptyDescription": "请选择一条租户记录查看详情。",
  "app.tenant.detailLoading": "正在刷新当前租户详情...",
  "app.tenant.field.id": "ID",
  "app.tenant.field.code": "租户编码",
  "app.tenant.field.name": "租户名称",
  "app.tenant.field.status": "状态",
  "app.tenant.field.createdAt": "创建时间",
  "app.tenant.field.updatedAt": "更新时间",
  "app.tenant.status.active": "启用",
  "app.tenant.status.suspended": "停用",
  "app.tenant.query.codePlaceholder": "按租户编码搜索",
  "app.tenant.query.namePlaceholder": "按租户名称搜索",
  "app.tenant.action.create": "新建租户",
  "app.tenant.action.edit": "编辑租户",
  "app.tenant.action.activate": "启用租户",
  "app.tenant.action.suspend": "停用租户",
  "app.tenant.countLabel": "当前显示 {visible} 条，共 {total} 条",
  "app.tenant.statsHint": "当前可见租户条目数",
  "app.tenant.tabsHint": "{count} 个租户",
  "app.tenant.panelTitle.create": "新建租户",
  "app.tenant.panelTitle.edit": "编辑租户",
  "app.tenant.panelTitle.detailFallback": "租户详情",
  "app.tenant.panelDesc.create":
    "创建流程直接调用系统租户模块接口，示例页只装配表单状态与交互。",
  "app.tenant.panelDesc.edit":
    "编辑模式继续复用 schema 派生字段，不额外扩出新的治理抽象层。",
  "app.tenant.panelDesc.detail":
    "右侧详情与动作保持围绕当前租户，并显式保留状态切换入口。",
}
