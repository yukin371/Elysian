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
    "筛选、会话列表、详情与强制下线保持同一条操作链路。",
  "app.onlineSession.emptyTitle": "当前筛选条件下没有会话",
  "app.onlineSession.emptyDescription":
    "当前账号暂时没有更多可见会话。可以保留当前页面，等下一次登录或刷新后再回来查看。",
  "app.onlineSession.filteredEmptyTitle": "当前筛选条件下没有会话",
  "app.onlineSession.filteredEmptyDescription":
    "当前筛选条件把所有可见会话都排除了。",
  "app.onlineSession.filteredRecoveryHint":
    "先清空筛选，再回到完整会话列表里选择当前设备或其他设备。",
  "app.onlineSession.searchPlaceholder": "搜索会话",
  "app.onlineSession.countLabel": "当前显示 {visible} 条，共 {total} 条",
  "app.onlineSession.statsHint": "当前用户可见会话数",
  "app.onlineSession.tabsHint": "{count} 个会话",
  "app.onlineSession.detailEyebrow": "会话详情",
  "app.onlineSession.detailEmptyTitle": "尚未选择会话",
  "app.onlineSession.detailEmptyDescription":
    "从左侧会话列表中选择一条记录，查看设备、IP 和过期时间。",
  "app.onlineSession.detailEmptyNextStep":
    "下一步：先用范围筛选定位当前会话，或直接从列表选择另一个设备。",
  "app.onlineSession.panelTitle.detailFallback": "会话详情",
  "app.onlineSession.panelDesc.detail": "详情与动作只围绕当前会话。",
  "app.onlineSession.currentBadge": "当前会话",
  "app.onlineSession.currentSessionTitle": "你正在查看当前浏览器使用中的会话",
  "app.onlineSession.currentSessionDescription":
    "在这里下线会立即结束当前浏览器会话，并触发重新登录恢复流程。",
  "app.onlineSession.otherSessionTitle": "这是另一台设备或较早的历史会话",
  "app.onlineSession.otherSessionDescription":
    "下线它不会影响当前浏览器，只会移除所选设备的访问资格。",
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
  "app.onlineSession.action.revokeCurrentDisabled": "当前会话不能在这里下线",
  "app.onlineSession.action.confirmRevoke": "确认下线该会话",
  "app.onlineSession.action.cancelRevoke": "保留该会话",
  "app.onlineSession.action.clearFilters": "清空筛选",
  "app.onlineSession.confirmationTitle": "确认下线所选会话",
  "app.onlineSession.confirmationDescription":
    "该动作会移除 {device}（{ip}）的访问资格，不会让当前浏览器退出登录。",
  "app.onlineSession.revokeCurrentHint":
    "当前工作区会保护正在使用的浏览器会话；如果确实要退出，请走全局退出登录路径。",
  "app.onlineSession.revokeOtherHint":
    "用它下线所选设备，不会让当前浏览器退出登录。",
  "app.onlineSession.revokeOtherConfirmHint":
    "确认前先核对设备和 IP。确认后会立即让所选会话失效。",
}
