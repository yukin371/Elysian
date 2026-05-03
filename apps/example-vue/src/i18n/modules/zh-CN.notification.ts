import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const zhCNNotificationLocaleMessages: VueLocaleMessages = {
  "app.notification.sectionTitle": "通知管理工作区",
  "app.notification.sectionCopy":
    "通知页先收敛到真实列表、详情、创建与已读闭环，不提前扩成消息中心、外部投递编排或第二套收件箱。",
  "app.notification.shellTitle": "通知工作区",
  "app.notification.shellDescription":
    "列表与详情直接消费系统通知接口，当前保持站内通知最小闭环，不扩写成多通道消息中心。",
  "app.notification.workspaceEyebrow": "站内通知",
  "app.notification.workspaceTitle": "通知列表",
  "app.notification.workspaceDescription":
    "主区聚焦通知列表与筛选，右侧承接详情、已读动作与新建入口，避免重复展示第二份列表。",
  "app.notification.emptyTitle": "当前没有通知",
  "app.notification.emptyDescription":
    "调整筛选条件，或从右侧新建一条站内通知。",
  "app.notification.countLabel": "当前显示 {visible} 条，共 {total} 条通知",
  "app.notification.tabsHint": "当前可见 {count} 条通知",
  "app.notification.statsHint": "通知工作区保持列表、详情、创建与已读闭环。",
  "app.notification.detailEyebrow": "通知详情",
  "app.notification.detailLoading": "正在加载通知详情...",
  "app.notification.detailEmptyDescription":
    "从左侧列表中选择一条通知，或直接新建站内通知。",
  "app.notification.panelTitle.create": "新建通知",
  "app.notification.panelTitle.detailFallback": "通知详情",
  "app.notification.panelDesc.create":
    "创建范围只限站内通知，不在本轮扩写模板、短信、邮件或批量投递。",
  "app.notification.panelDesc.detail":
    "详情面板用于承接已读动作与关键信息，不再重复渲染第二份主列表。",
  "app.notification.field.id": "ID",
  "app.notification.field.recipientUserId": "接收用户",
  "app.notification.field.title": "标题",
  "app.notification.field.content": "内容",
  "app.notification.field.level": "级别",
  "app.notification.field.status": "状态",
  "app.notification.field.createdByUserId": "创建人",
  "app.notification.field.readAt": "已读时间",
  "app.notification.field.createdAt": "创建时间",
  "app.notification.query.recipientUserIdPlaceholder": "按接收用户查询",
  "app.notification.query.titlePlaceholder": "按标题查询",
  "app.notification.query.contentPlaceholder": "按内容查询",
  "app.notification.query.levelPlaceholder": "选择通知级别",
  "app.notification.query.statusPlaceholder": "选择通知状态",
  "app.notification.status.unread": "未读",
  "app.notification.status.read": "已读",
  "app.notification.level.info": "提示",
  "app.notification.level.success": "成功",
  "app.notification.level.warning": "警告",
  "app.notification.level.error": "错误",
  "app.notification.readAtEmpty": "尚未已读",
  "app.notification.meta.status": "状态",
  "app.notification.meta.level": "级别",
  "app.notification.meta.readAt": "已读时间",
  "app.notification.action.create": "新建通知",
  "app.notification.action.markRead": "标记已读",
}
