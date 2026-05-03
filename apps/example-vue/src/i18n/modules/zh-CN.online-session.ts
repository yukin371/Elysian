import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const zhCNOnlineSessionLocaleMessages: VueLocaleMessages = {
  "app.onlineSession.sectionTitle": "在线会话工作区",
  "app.onlineSession.sectionCopy":
    "当前范围只收敛到当前登录用户的会话治理，不提前扩成管理员在线用户总览或第二套安全中心。",
  "app.onlineSession.shellTitle": "在线会话工作区",
  "app.onlineSession.shellDescription":
    "列表与详情直接消费当前用户会话接口，当前只做最小会话查看与单会话强制下线闭环。",
  "app.onlineSession.workspaceEyebrow": "当前用户会话",
  "app.onlineSession.workspaceTitle": "在线会话清单",
  "app.onlineSession.workspaceDescription":
    "主区只承接筛选与会话列表，右侧聚焦当前会话详情与强制下线动作，避免堆出第二个安全工作台。",
  "app.onlineSession.emptyTitle": "当前筛选条件下没有会话",
  "app.onlineSession.emptyDescription":
    "清空条件后重试，或等待下一次会话刷新。",
  "app.onlineSession.countLabel": "当前显示 {visible} 条，共 {total} 条",
  "app.onlineSession.statsHint": "当前用户可见会话数",
  "app.onlineSession.tabsHint": "{count} 个会话",
  "app.onlineSession.detailEyebrow": "会话详情",
  "app.onlineSession.detailEmptyDescription":
    "请选择一条会话记录查看详情，或直接管理当前登录会话。",
  "app.onlineSession.panelTitle.detailFallback": "会话详情",
  "app.onlineSession.panelDesc.detail":
    "右侧详情与动作只围绕当前会话，不额外扩写批量踢下线或在线用户总览。",
  "app.onlineSession.field.keyword": "关键字",
  "app.onlineSession.field.state": "状态",
  "app.onlineSession.field.scope": "范围",
  "app.onlineSession.field.device": "设备",
  "app.onlineSession.field.ip": "IP",
  "app.onlineSession.field.lastUsedAt": "最后使用时间",
  "app.onlineSession.field.expiresAt": "过期时间",
  "app.onlineSession.field.createdAt": "创建时间",
  "app.onlineSession.field.updatedAt": "更新时间",
  "app.onlineSession.field.userAgent": "User-Agent",
  "app.onlineSession.query.keywordPlaceholder": "按设备或 IP 搜索",
  "app.onlineSession.query.scopePlaceholder": "选择范围",
  "app.onlineSession.scope.all": "全部会话",
  "app.onlineSession.scope.current": "当前会话",
  "app.onlineSession.scope.history": "历史会话",
  "app.onlineSession.state.current": "当前会话",
  "app.onlineSession.state.active": "活跃",
  "app.onlineSession.state.rotated": "已轮换",
  "app.onlineSession.state.revoked": "已下线",
  "app.onlineSession.action.revoke": "强制下线",
  "app.onlineSession.action.revokeCurrent": "下线当前会话",
}
