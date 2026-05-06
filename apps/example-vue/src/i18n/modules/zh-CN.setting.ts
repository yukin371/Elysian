import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const zhCNSettingLocaleMessages: VueLocaleMessages = {
  "app.setting.sectionTitle": "系统配置工作区",
  "app.setting.sectionCopy":
    "系统配置页先收敛到真实列表、详情与基础编辑，不提前扩成多环境对比或版本管理器。",
  "app.setting.shellTitle": "系统配置工作区",
  "app.setting.shellDescription":
    "列表与详情直接消费系统配置接口，当前只做最小闭环，不在本轮扩写环境覆盖或版本能力。",
  "app.setting.workspaceEyebrow": "真实模块工作区",
  "app.setting.workspaceTitle": "系统配置清单",
  "app.setting.workspaceDescription":
    "查询、配置列表、详情与基础编辑保持同一条操作链路。",
  "app.setting.emptyTitle": "当前筛选条件下没有系统配置",
  "app.setting.emptyDescription": "清空条件或调整关键字后重试。",
  "app.setting.detailEyebrow": "配置详情",
  "app.setting.detailEmptyTitle": "尚未选择配置",
  "app.setting.detailEmptyDescription": "请选择一条配置记录查看详情。",
  "app.setting.detailLoading": "正在刷新当前配置详情...",
  "app.setting.field.id": "ID",
  "app.setting.field.key": "配置键",
  "app.setting.field.value": "配置值",
  "app.setting.field.description": "描述",
  "app.setting.field.status": "状态",
  "app.setting.field.createdAt": "创建时间",
  "app.setting.field.updatedAt": "更新时间",
  "app.setting.status.active": "启用",
  "app.setting.status.disabled": "停用",
  "app.setting.query.keyPlaceholder": "按配置键搜索",
  "app.setting.query.valuePlaceholder": "按配置值搜索",
  "app.setting.query.descriptionPlaceholder": "按描述搜索",
  "app.setting.action.create": "新建配置",
  "app.setting.action.edit": "编辑配置",
  "app.setting.countLabel": "当前显示 {visible} 条，共 {total} 条",
  "app.setting.statsHint": "当前可见系统配置条目数",
  "app.setting.tabsHint": "{count} 个系统配置",
  "app.setting.panelTitle.create": "新建配置",
  "app.setting.panelTitle.edit": "编辑配置",
  "app.setting.panelTitle.detailFallback": "配置详情",
  "app.setting.panelDesc.create":
    "创建流程直接调用系统配置模块接口，示例页只装配表单状态与交互。",
  "app.setting.panelDesc.edit":
    "编辑模式继续复用 schema 派生字段，不额外引入第二套表单 owner。",
  "app.setting.panelDesc.detail": "详情与动作保持围绕当前配置。",
}
