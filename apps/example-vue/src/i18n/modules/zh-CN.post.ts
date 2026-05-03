import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const zhCNPostLocaleMessages: VueLocaleMessages = {
  "app.post.sectionTitle": "岗位管理工作区",
  "app.post.sectionCopy":
    "系统岗位页先收敛到真实列表、详情与基础编辑，不提前扩成用户岗位关系编排或组织设计器。",
  "app.post.shellTitle": "岗位工作区",
  "app.post.shellDescription":
    "列表与详情直接消费系统岗位接口，当前只做最小闭环，不在本轮扩写用户岗位绑定或层级编排。",
  "app.post.workspaceEyebrow": "真实模块工作区",
  "app.post.workspaceTitle": "系统岗位清单",
  "app.post.workspaceDescription":
    "主区只承接查询与岗位列表，右侧聚焦当前岗位详情与基础编辑，避免在两侧重复堆叠主体信息。",
  "app.post.emptyTitle": "当前筛选条件下没有岗位",
  "app.post.emptyDescription": "清空条件或调整关键字后重试。",
  "app.post.detailEyebrow": "岗位详情",
  "app.post.detailEmptyDescription":
    "请选择一条岗位记录查看详情，或直接新建岗位。",
  "app.post.detailLoading": "正在刷新当前岗位详情...",
  "app.post.field.id": "ID",
  "app.post.field.code": "编码",
  "app.post.field.name": "名称",
  "app.post.field.sort": "排序",
  "app.post.field.status": "状态",
  "app.post.field.remark": "备注",
  "app.post.field.createdAt": "创建时间",
  "app.post.field.updatedAt": "更新时间",
  "app.post.status.active": "启用",
  "app.post.status.disabled": "停用",
  "app.post.query.codePlaceholder": "按编码搜索",
  "app.post.query.namePlaceholder": "按名称搜索",
  "app.post.query.remarkPlaceholder": "按备注搜索",
  "app.post.action.create": "新建岗位",
  "app.post.action.edit": "编辑岗位",
  "app.post.countLabel": "当前显示 {visible} 条，共 {total} 条",
  "app.post.panelTitle.create": "新建岗位",
  "app.post.panelTitle.edit": "编辑岗位",
  "app.post.panelTitle.detailFallback": "岗位详情",
  "app.post.panelDesc.create":
    "创建流程直接调用系统岗位模块接口，示例页只装配表单状态与交互。",
  "app.post.panelDesc.edit":
    "编辑模式继续复用 schema 派生字段，并保持岗位状态与备注在同一表单内收口。",
  "app.post.panelDesc.detail":
    "右侧详情与动作保持围绕当前岗位，不在主区重复堆叠编辑入口。",
}
