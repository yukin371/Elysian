import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const zhCNWorkflowLocaleMessages: VueLocaleMessages = {
  "app.workflow.sectionTitle": "流程定义管理",
  "app.workflow.sectionCopy":
    "用于查看、筛选和追踪当前租户的流程定义版本。它不是流程发起页，也不是流程设计器。",
  "app.workflow.shellTitle": "流程定义管理",
  "app.workflow.shellDescription": "查看、筛选和追踪流程定义版本。",
  "app.workflow-definition.sectionTitle": "流程定义管理",
  "app.workflow-definition.sectionCopy":
    "用于查看、筛选和追踪当前租户的流程定义版本。它不是流程发起页，也不是流程设计器。",
  "app.workflow-definition.shellTitle": "流程定义管理",
  "app.workflow-definition.shellDescription": "查看、筛选和追踪流程定义版本。",
  "app.message.customerModuleOffline":
    "`customer` 模块尚未注册。请配置 `DATABASE_URL`，执行迁移与 seed 后重启服务。",
  "app.message.signInToLoad": "请先登录，再加载受保护的客户数据。",
  "app.message.workspaceNoListPermission":
    "当前身份可以进入工作区，但没有 `customer:customer:list` 权限。",
  "app.message.departmentModuleOffline":
    "`department` 模块尚未注册。请确认服务端已启用系统部门模块后再重试。",
  "app.message.departmentSignInToLoad": "请先登录，再加载受保护的部门数据。",
  "app.message.departmentNoListPermission":
    "当前身份可以进入工作区，但没有 `system:department:list` 权限。",
  "app.message.postModuleOffline":
    "`post` 模块尚未注册。请确认服务端已启用系统岗位模块后再重试。",
  "app.message.postSignInToLoad": "请先登录，再加载受保护的岗位数据。",
  "app.message.postNoListPermission":
    "当前身份可以进入工作区，但没有 `system:post:list` 权限。",
  "app.message.onlineSessionModuleOffline":
    "`auth` 模块尚未注册。请确认服务端已启用认证模块后再重试。",
  "app.message.onlineSessionSignInToLoad":
    "请先登录，再加载当前用户的在线会话。",
  "app.message.onlineSessionNoAccess":
    "当前状态下无法进入在线会话工作区，请先恢复登录会话。",
  "app.message.menuModuleOffline":
    "`menu` 模块尚未注册。请确认服务端已启用系统菜单模块后再重试。",
  "app.message.menuSignInToLoad": "请先登录，再加载受保护的菜单数据。",
  "app.message.menuNoListPermission":
    "当前身份可以进入工作区，但没有 `system:menu:list` 权限。",
  "app.message.roleModuleOffline":
    "`role` 模块尚未注册。请确认服务端已启用系统角色模块后再重试。",
  "app.message.roleSignInToLoad": "请先登录，再加载受保护的角色数据。",
  "app.message.roleNoListPermission":
    "当前身份可以进入工作区，但没有 `system:role:list` 权限。",
  "app.message.settingModuleOffline":
    "`setting` 模块尚未注册。请确认服务端已启用配置项模块后再重试。",
  "app.message.settingSignInToLoad": "请先登录，再加载受保护的配置项数据。",
  "app.message.settingNoListPermission":
    "当前身份可以进入工作区，但没有 `system:setting:list` 权限。",
  "app.message.tenantModuleOffline":
    "`tenant` 模块尚未注册。请确认服务端已启用系统租户模块后再重试。",
  "app.message.tenantSignInToLoad": "请先登录，再加载受保护的租户数据。",
  "app.message.tenantNoListPermission":
    "当前身份可以进入工作区，但没有 `system:tenant:list` 权限。",
  "app.message.tenantSuperAdminRequired":
    "租户管理仅对 super-admin 开放，普通管理员不会在示例页伪装成可操作态。",
  "app.message.dictionaryModuleOffline":
    "`dictionary` 模块尚未注册。请确认服务端已启用系统字典模块后再重试。",
  "app.message.dictionarySignInToLoad": "请先登录，再加载受保护的字典数据。",
  "app.message.dictionaryNoListPermission":
    "当前身份可以进入工作区，但没有 `system:dictionary:list` 权限。",
  "app.message.operationLogModuleOffline":
    "`operation-log` 模块尚未注册。请确认服务端已启用系统操作日志模块后再重试。",
  "app.message.operationLogSignInToLoad":
    "请先登录，再加载受保护的操作日志数据。",
  "app.message.operationLogNoListPermission":
    "当前身份可以进入工作区，但没有 `system:operation-log:list` 权限。",
  "app.message.userModuleOffline":
    "`user` 模块尚未注册。请确认服务端已启用系统用户模块后再重试。",
  "app.message.userSignInToLoad": "请先登录，再加载受保护的用户数据。",
  "app.message.userNoListPermission":
    "当前身份可以进入工作区，但没有 `system:user:list` 权限。",
  "app.message.workflowModuleOffline":
    "`workflow` 模块尚未注册，流程定义工作区暂不可用。",
  "app.message.workflowSignInToLoad": "请先登录，再加载受保护的流程定义数据。",
  "app.message.workflowNoListPermission":
    "当前身份可以进入工作区，但没有 `workflow:definition:list` 权限。",
  "app.workflow.loading": "正在加载流程定义...",
  "app.workflow.empty": "当前租户下还没有流程定义。",
  "app.workflow.listEyebrow": "流程定义管理",
  "app.workflow.listTitle": "流程定义清单",
  "app.workflow.filter.searchLabel": "搜索定义",
  "app.workflow.filter.searchPlaceholder": "按名称、编码或 ID 搜索",
  "app.workflow.filter.all": "全部",
  "app.workflow.filter.active": "启用",
  "app.workflow.filter.disabled": "停用",
  "app.workflow.filter.reset": "清空筛选",
  "app.workflow.pagination.empty": "共 0 条",
  "app.workflow.pagination.summary":
    "第 {page}/{totalPages} 页，{start}-{end} / {total} 条",
  "app.workflow.pagination.previous": "上一页",
  "app.workflow.pagination.next": "下一页",
  "app.workflow.detailEyebrow": "流程定义详情",
  "app.workflow.detailDescription":
    "详情弹窗保持聚焦，只展示当前定义的结构、状态与版本元数据。",
  "app.workflow.detailEmpty": "请选择一条流程定义查看结构详情。",
  "app.workflow.detailEmptyTitle": "尚未选择流程定义",
  "app.workflow.detailLoading": "正在刷新当前流程定义详情...",
  "app.workflow.emptyFiltered": "当前筛选条件下没有匹配的流程定义。",
  "app.workflow.meta.status": "状态",
  "app.workflow.meta.key": "编码",
  "app.workflow.meta.version": "版本",
  "app.workflow.meta.structure": "结构规模",
  "app.workflow.meta.updatedAt": "更新时间",
  "app.workflow.meta.nodes": "节点",
  "app.workflow.meta.edges": "连线",
  "app.workflow.versionHistoryTitle": "版本历史",
  "app.workflow.nodeFlowTitle": "节点流转",
  "app.workflow.status.active": "启用",
  "app.workflow.status.disabled": "停用",
  "app.workflow.nodeType.start": "开始",
  "app.workflow.nodeType.approval": "审批",
  "app.workflow.nodeType.condition": "条件",
  "app.workflow.nodeType.end": "结束",
  "app.workflow.node.assignee": "处理人",
  "app.workflow.node.conditions": "{count} 个条件分支",
  "app.workflow.statsHint": "当前流程定义条目数",
  "app.workflow.tabsHint": "{count} 条流程定义",
  "app.generatorPreview.sectionTitle": "生成预览工作区",
  "app.generatorPreview.sectionCopy":
    "从模块草稿开始生成预览，先审查文件、权限和 SQL 提案，再决定是否应用到 staging。",
  "app.generatorPreview.shellTitle": "生成预览工作区",
  "app.generatorPreview.shellDescription":
    "从新建生成、最近结果到生成结果形成一条可审查、可回放、可应用的操作路径。",
  "app.generatorPreview.workspaceEyebrow": "生成预览",
  "app.generatorPreview.workspaceTitle": "生成结果",
  "app.generatorPreview.workspaceDescription":
    "先配置模块草稿和前端目标，再查看文件计划、差异摘要、SQL 提案与应用证据。",
  "app.generatorPreview.resultListSummary": "当前结果共 {count} 个产物。",
  "app.generatorPreview.resultListHint":
    "下一步：从列表里选择一份文件，查看差异、源码和 SQL 证据。",
  "app.generatorPreview.resultListKeyboardHint":
    "支持 / 聚焦文件搜索；聚焦结果列表后，可用 ↑ ↓ 快速切换文件。",
  "app.generatorPreview.message.localOnly":
    "当前工作区只做本地预览，不会写入生成目录，也不会替代 CLI 的真实 apply/preview 报告。",
  "app.generatorPreview.message.runtimeBacked":
    "当前工作区由后端生成记录驱动；你看到的是预览报告、冲突状态与应用证据。",
  "app.generatorPreview.message.blockingConflicts":
    "存在阻塞冲突，先处理冲突再应用到 staging。",
  "app.generatorPreview.blockedTitle": "阻塞冲突明细",
  "app.generatorPreview.blockedCount": "{count} 个文件当前无法直接应用",
  "app.generatorPreview.blockedDescription":
    "先打开这些阻塞文件，确认冲突原因和差异后，再决定是否重新生成或调整已有文件处理方式。",
  "app.generatorPreview.blockedAction": "查看该文件差异",
  "app.generatorPreview.blockedRecoverySummary":
    "当前还有 {count} 个阻塞文件，先从第一份开始处理。",
  "app.generatorPreview.blockedPrimaryAction": "查看第一个阻塞文件",
  "app.generatorPreview.message.pendingReview": "先审核，再应用到 staging。",
  "app.generatorPreview.message.operationNoSession":
    "请先生成预览结果，再执行审核或应用到 staging。",
  "app.generatorPreview.message.operationLoading":
    "正在生成预览结果，当前操作会在生成完成后可用。",
  "app.generatorPreview.message.operationBusy":
    "当前已有审核或 apply 操作在执行，请等待操作完成。",
  "app.generatorPreview.message.confirmReject":
    "再次点击确认拒绝会结束本次会话；如需继续审核，可取消本次确认。",
  "app.generatorPreview.message.confirmApply":
    "再次点击确认应用会写入 staging；请先确认文件差异与 SQL 草案已完成审核。",
  "app.generatorPreview.message.rejectCommentRequired":
    "请填写拒绝原因，便于后续重新生成时明确要调整什么。",
  "app.generatorPreview.message.operationApplied":
    "当前结果已应用到 staging，无需重复应用。",
  "app.generatorPreview.message.operationApplyUnavailable":
    "当前结果暂不可应用，请先确认清单，再确认没有阻塞冲突。",
  "app.generatorPreview.errorRecoveryTitle": "下一步建议",
  "app.generatorPreview.errorRecoveryStep.fixSchema":
    "先检查 Schema JSON、模块标识和模块名称，修正字段结构后再重新生成预览。",
  "app.generatorPreview.errorRecoveryStep.changeConflictStrategy":
    "检查已有文件处理方式；如果冲突是预期的，改用更合适的冲突策略后再试。",
  "app.generatorPreview.errorRecoveryStep.retryPreview":
    "确认输入无误后，再次点击“生成预览”重试当前操作。",
  "app.generatorPreview.errorRecoveryStep.manualReview":
    "如果仍然失败，保留当前草稿和最近结果，再交给开发排查生成器或目标文件状态。",
  "app.generatorPreview.message.reviewApproved":
    "本次预览已完成审核通过，审核时间：{value}。",
  "app.generatorPreview.message.reviewRejected":
    "本次预览已被审核拒绝，审核时间：{value}。",
  "app.generatorPreview.message.rejected": "本次预览已拒绝，请重新生成。",
  "app.generatorPreview.message.applied":
    "本次预览已完成 staging apply，应用时间：{value}。",
  "app.generatorPreview.progress.generatingTitle": "正在生成预览",
  "app.generatorPreview.progress.regeneratingTitle": "正在重新生成预览",
  "app.generatorPreview.progress.generatingDescription":
    "当前阶段会刷新最近结果和文件计划。你可以留在页面等待，也可以稍后回来从“最近结果”继续查看。",
  "app.generatorPreview.progress.reviewingTitle": "正在提交审核结果",
  "app.generatorPreview.progress.reviewingDescription":
    "当前阶段会更新审核状态和后续动作。可以稍后回到“最近结果”继续处理。",
  "app.generatorPreview.progress.confirmingTitle": "正在记录确认清单",
  "app.generatorPreview.progress.confirmingDescription":
    "当前阶段会写入确认凭据并切换到 apply 前状态。可以稍后回来继续。",
  "app.generatorPreview.progress.applyingTitle": "正在应用到 staging",
  "app.generatorPreview.progress.applyingDescription":
    "当前阶段会写入 staging 并更新应用证据。请等待状态刷新，或稍后从“最近结果”回看结果。",
  "app.generatorPreview.resultRecoveryTitle": "当前结果的下一步建议",
  "app.generatorPreview.resultRecoveryStep.refreshDrift":
    "目标文件可能已经变化。先重新生成预览，再重新审核或应用，避免沿用过期结果。",
  "app.generatorPreview.resultRecoveryStep.reviewBlockedFiles":
    "先查看阻塞文件和冲突原因，再决定是否调整已有文件处理方式。",
  "app.generatorPreview.resultRecoveryStep.recheckChecklist":
    "回到确认清单，重新核对目标目录、文件数量、SQL proposal 和人工确认项。",
  "app.generatorPreview.resultRecoveryStep.restoreSession":
    "如果你离开过当前路径，可以先从“最近结果”恢复同一次会话，再继续处理。",
  "app.generatorPreview.resultRecoveryStep.regenerate":
    "如果当前结果已经不可信，直接重新生成预览，避免在旧证据上继续推进。",
  "app.generatorPreview.filter.schemaLabel": "模块",
  "app.generatorPreview.filter.conflictLabel": "已有文件处理方式",
  "app.generatorPreview.filter.frontendLabel": "前端目标",
  "app.generatorPreview.filter.searchLabel": "搜索产物",
  "app.generatorPreview.filter.searchPlaceholder": "搜索文件",
  "app.generatorPreview.filter.sessionLabel": "查看最近结果",
  "app.generatorPreview.filter.sessionPlaceholder": "恢复会话",
  "app.generatorPreview.recentSessionBadge.current": "当前配置",
  "app.generatorPreview.recentSessionBadge.blocking": "阻塞冲突",
  "app.generatorPreview.filter.reset": "清空筛选",
  "app.generatorPreview.filter.schemaSummary": "Schema: {value}",
  "app.generatorPreview.filter.frontendSummary": "前端: {value}",
  "app.generatorPreview.filter.conflictSummary": "策略: {value}",
  "app.generatorPreview.filter.querySummary": "关键词: {value}",
  "app.generatorPreview.detailEyebrow": "预览详情",
  "app.generatorPreview.detailDescription":
    "详情卡片保持聚焦，只展示当前文件、生成记录元数据与 SQL preview，避免重复铺开文件列表。",
  "app.generatorPreview.detailEmptyTitle": "尚未选择生成文件",
  "app.generatorPreview.detailEmptyDescription":
    "从左侧产物列表中选择一项，查看源码、会话信息与 SQL preview。",
  "app.generatorPreview.action.closeFileDetail": "返回结果列表",
  "app.generatorPreview.detailCloseHint": "按 Esc 也可以关闭当前文件详情。",
  "app.generatorPreview.emptyDetailArtifactCount": "当前结果共 {count} 个产物",
  "app.generatorPreview.emptyDetailNextStep":
    "下一步：先从生成结果里选择一份文件查看证据。",
  "app.generatorPreview.emptyFiltered": "当前筛选条件下没有匹配的生成文件。",
  "app.generatorPreview.emptyFilteredHint":
    "可以清空文件搜索，回到完整结果列表后再选择要查看的产物。",
  "app.generatorPreview.action.clearFileSearch": "清空文件搜索",
  "app.generatorPreview.loading": "正在生成最新预览，请稍候。",
  "app.generatorPreview.action.refresh": "生成预览",
  "app.generatorPreview.action.refreshing": "生成中",
  "app.generatorPreview.action.generatePreview": "生成预览",
  "app.generatorPreview.action.generatingPreview": "生成中",
  "app.generatorPreview.action.restoreCurrentResult": "恢复当前结果",
  "app.generatorPreview.action.regeneratePreview": "重新生成预览",
  "app.generatorPreview.action.regeneratingPreview": "重新生成中",
  "app.generatorPreview.action.loadCurrentSchemaDraft": "复制结构到当前草稿",
  "app.generatorPreview.action.expandSchemaEditor": "展开编辑",
  "app.generatorPreview.action.collapseSchemaEditor": "收起编辑",
  "app.generatorPreview.action.showAdvancedOptions": "展开高级项",
  "app.generatorPreview.action.hideAdvancedOptions": "收起高级项",
  "app.generatorPreview.input.templateLabel": "公共模板",
  "app.generatorPreview.input.templateHint":
    "先载入一个基础模板，再按需要展开 Schema JSON。",
  "app.generatorPreview.input.validationDetails": "校验详情",
  "app.generatorPreview.action.approve": "审核通过",
  "app.generatorPreview.action.reject": "拒绝",
  "app.generatorPreview.action.confirmReject": "确认拒绝",
  "app.generatorPreview.action.cancelRejectConfirm": "取消拒绝",
  "app.generatorPreview.action.confirmChecklist": "确认清单",
  "app.generatorPreview.action.apply": "应用到 staging",
  "app.generatorPreview.action.confirmApply": "确认应用到 staging",
  "app.generatorPreview.action.cancelApplyConfirm": "取消确认",
  "app.generatorPreview.action.applying": "应用中",
  "app.generatorPreview.action.copyCommands": "复制命令",
  "app.generatorPreview.action.copyCommandsDone": "已复制",
  "app.generatorPreview.action.copyCommandsFailed": "复制失败",
  "app.generatorPreview.action.copySnippet": "复制片段",
  "app.generatorPreview.action.copySnippetDone": "已复制",
  "app.generatorPreview.action.copySnippetFailed": "复制失败",
  "app.generatorPreview.next.refresh": "下一步：生成预览",
  "app.generatorPreview.next.refreshing": "下一步：等待生成完成",
  "app.generatorPreview.next.review": "下一步：审核通过或拒绝",
  "app.generatorPreview.next.reviewing": "下一步：等待审核完成",
  "app.generatorPreview.next.confirmReject": "下一步：确认拒绝或取消",
  "app.generatorPreview.next.confirmChecklist": "下一步：确认清单后再应用",
  "app.generatorPreview.next.apply": "下一步：应用到 staging",
  "app.generatorPreview.next.confirmApply": "下一步：确认 apply 或取消",
  "app.generatorPreview.next.applying": "下一步：等待 apply 完成",
  "app.generatorPreview.next.resolveConflicts": "下一步：处理阻塞冲突",
  "app.generatorPreview.next.done": "下一步：已完成",
  "app.generatorPreview.next.wait": "下一步：等待状态更新",
  "app.generatorPreview.flow.configure": "新建生成",
  "app.generatorPreview.flow.review": "审核差异",
  "app.generatorPreview.flow.confirm": "确认清单",
  "app.generatorPreview.flow.apply": "应用到 staging",
  "app.generatorPreview.flow.done": "已完成",
  "app.generatorPreview.action.editConfig": "重新生成",
  "app.generatorPreview.action.closeConfig": "收起新建生成",
  "app.generatorPreview.reviewCommentLabel": "审核备注",
  "app.generatorPreview.reviewCommentPlaceholder": "备注（可选）",
  "app.generatorPreview.status.pendingReview": "待审核",
  "app.generatorPreview.status.ready": "待应用",
  "app.generatorPreview.status.rejected": "已拒绝",
  "app.generatorPreview.status.applied": "已应用",
  "app.generatorPreview.status.notGenerated": "未生成",
  "app.generatorPreview.message.confirmedReady":
    "已审核通过，尚未应用到 staging。请确认目标、已有文件处理方式和文件数量后再应用。",
  "app.generatorPreview.message.confirmationEvidenceCaptured":
    "已记录确认凭据，包含 {count} 条确认清单项。",
  "app.generatorPreview.message.confirmationEvidenceDetailed":
    "已记录确认凭据：{count} 条清单，report={reportPath}，snapshot={snapshotPath}，恢复状态={recoveryStatus}。",
  "app.generatorPreview.confirmationChecklistTitle": "应用前确认清单",
  "app.generatorPreview.checklist.fileActions":
    "文件动作：共 {total} 个产物，{changed} 个有变更；新增 {create}、覆盖 {overwrite}、跳过 {skip}、阻塞 {block}。",
  "app.generatorPreview.checklist.fileActionsMissing":
    "文件动作：当前没有可用的差异摘要，请先重新生成预览。",
  "app.generatorPreview.checklist.conflictClear":
    "冲突状态：当前没有阻塞冲突。",
  "app.generatorPreview.checklist.conflictBlocking":
    "冲突状态：仍存在阻塞冲突，不能直接应用。",
  "app.generatorPreview.checklist.targetStaging":
    "目标位置：本次只应用到 staging。",
  "app.generatorPreview.checklist.conflictStrategy":
    "已有文件处理方式：{value}。",
  "app.generatorPreview.checklist.sqlProposalReady":
    "SQL proposal：已生成 review-only 提案，需要人工确认后再正式接入。",
  "app.generatorPreview.checklist.sqlProposalUnsupported":
    "SQL proposal：当前模块暂不支持自动提案，请按 handoff 说明人工处理。",
  "app.generatorPreview.checklist.sqlProposalMissing":
    "SQL proposal：当前结果没有可用提案，请确认是否需要人工数据库变更。",
  "app.generatorPreview.checklist.manualConfirmation":
    "人工确认：确认文件差异、SQL proposal、权限与菜单影响都已审查。",
  "app.generatorPreview.summary.changed": "变更文件",
  "app.generatorPreview.summary.create": "新增",
  "app.generatorPreview.summary.overwrite": "覆盖",
  "app.generatorPreview.summary.skip": "跳过",
  "app.generatorPreview.summary.block": "阻塞",
  "app.generatorPreview.actionLabel.create": "新增",
  "app.generatorPreview.actionLabel.overwrite": "覆盖",
  "app.generatorPreview.actionLabel.skip": "跳过",
  "app.generatorPreview.actionLabel.block": "阻塞",
  "app.generatorPreview.sessionTitle": "最近结果",
  "app.generatorPreview.emptyResultTitle": "这里会显示最新一次生成结果",
  "app.generatorPreview.emptyResultDescription":
    "点击“生成预览”后，这里会出现文件状态、审核进度和应用到 staging 的后续动作。",
  "app.generatorPreview.fileDecisionTitle": "文件说明",
  "app.generatorPreview.diffTitle": "差异摘要",
  "app.generatorPreview.fileDiffTitle": "当前文件差异",
  "app.generatorPreview.lineDiffTitle": "行级 Diff",
  "app.generatorPreview.reviewTitle": "审核证据",
  "app.generatorPreview.applyTitle": "Apply 证据",
  "app.generatorPreview.sqlProposalTitle": "SQL 提案",
  "app.generatorPreview.sqlDraftTitle": "SQL 草案",
  "app.generatorPreview.sqlProposalDrizzleImportTitle": "Drizzle 导入片段",
  "app.generatorPreview.sqlProposalDrizzleSchemaTitle": "Drizzle Schema 片段",
  "app.generatorPreview.sqlHandoffTitle": "正式接入规范",
  "app.generatorPreview.migrationProposalSnapshotTitle": "迁移提案快照",
  "app.generatorPreview.sqlConfirmationTitle": "人工确认清单",
  "app.generatorPreview.migrationProposalRecovery.rebuiltFromMissing":
    "快照缺失，已按当前 report 重新生成并落盘。",
  "app.generatorPreview.migrationProposalRecovery.rebuiltFromCorrupt":
    "快照已从损坏副本重建，原始文件已归档到",
  "app.generatorPreview.sourceTitle": "生成源码",
  "app.generatorPreview.currentSourceTitle": "目标目录当前内容",
  "app.generatorPreview.sqlTitle": "SQL Preview",
  "app.generatorPreview.frontendImpactTitle": "前端注册与权限影响",
  "app.generatorPreview.meta.schemaName": "Schema",
  "app.generatorPreview.meta.frontendTarget": "前端目标",
  "app.generatorPreview.meta.status": "当前状态",
  "app.generatorPreview.meta.mergeStrategy": "合并策略",
  "app.generatorPreview.meta.fileAction": "计划动作",
  "app.generatorPreview.meta.changed": "是否有变更",
  "app.generatorPreview.meta.changedYes": "是",
  "app.generatorPreview.meta.changedNo": "否",
  "app.generatorPreview.meta.lines": "行数",
  "app.generatorPreview.meta.moduleCode": "模块标识",
  "app.generatorPreview.meta.routePath": "路由路径",
  "app.generatorPreview.meta.permissionPrefix": "权限前缀",
  "app.generatorPreview.meta.surfaceKind": "页面形态",
  "app.generatorPreview.meta.sessionId": "Session ID",
  "app.generatorPreview.meta.absolutePath": "绝对路径",
  "app.generatorPreview.meta.exists": "目标文件已存在",
  "app.generatorPreview.meta.managed": "目标文件受管",
  "app.generatorPreview.meta.reportPath": "预览报告路径",
  "app.generatorPreview.meta.outputDir": "输出目录",
  "app.generatorPreview.meta.targetPreset": "目标位置",
  "app.generatorPreview.meta.addedLines": "新增行",
  "app.generatorPreview.meta.removedLines": "删除行",
  "app.generatorPreview.meta.unchangedLines": "未变更行",
  "app.generatorPreview.meta.createdAt": "创建时间",
  "app.generatorPreview.meta.actor": "发起人",
  "app.generatorPreview.meta.sourceType": "来源类型",
  "app.generatorPreview.meta.sourceValue": "来源值",
  "app.generatorPreview.meta.conflictStrategy": "冲突策略",
  "app.generatorPreview.meta.confirmedAt": "确认时间",
  "app.generatorPreview.meta.confirmedBy": "确认人",
  "app.generatorPreview.meta.templateReason": "模板用途",
  "app.generatorPreview.meta.plannedReason": "本次决策原因",
  "app.generatorPreview.meta.proposalStatus": "提案状态",
  "app.generatorPreview.meta.generatedAt": "生成时间",
  "app.generatorPreview.meta.canonicalOwner": "规范 owner",
  "app.generatorPreview.meta.reviewMode": "接入模式",
  "app.generatorPreview.meta.generatedOnly": "仅生成",
  "app.generatorPreview.meta.schemaDir": "Schema 目录",
  "app.generatorPreview.meta.drizzleDir": "迁移目录",
  "app.generatorPreview.meta.schemaIndexFile": "Schema 索引文件",
  "app.generatorPreview.meta.persistenceIndexFile": "Persistence 索引文件",
  "app.generatorPreview.meta.reviewedAt": "审核时间",
  "app.generatorPreview.meta.reviewDecision": "审核结果",
  "app.generatorPreview.meta.reviewComment": "审核备注",
  "app.generatorPreview.meta.appliedAt": "应用时间",
  "app.generatorPreview.meta.manifestPath": "Manifest 路径",
  "app.generatorPreview.meta.requestId": "请求 ID",
  "app.generatorPreview.sourceType.registeredSchema": "现有模块结构",
  "app.generatorPreview.sourceType.manualSchemaJson": "Schema JSON",
  "app.generatorPreview.inputTitle": "新建生成",
  "app.generatorPreview.startHeadline": "先回答“这次要生成什么”",
  "app.generatorPreview.startDescription":
    "先用最少必要字段完成起稿，再按需展开高级 JSON 和已有文件处理方式，不让首屏被技术项抢走。",
  "app.generatorPreview.startNextStepLabel": "下一步会进入",
  "app.generatorPreview.startNextStepValue":
    "生成结果检查与下一步判断，而不是直接把你推进高级配置。",
  "app.generatorPreview.inputModeLabel": "起稿方式",
  "app.generatorPreview.inputTemplateLabel": "复制现有模块结构",
  "app.generatorPreview.inputSchemaLabel": "Schema 模板",
  "app.generatorPreview.inputMode.registeredSchema": "选择已注册 Schema",
  "app.generatorPreview.inputMode.manualSchemaJson": "粘贴 Schema JSON",
  "app.generatorPreview.draftSource.template": "公共模板",
  "app.generatorPreview.draftSource.reference": "复制现有模块结构",
  "app.generatorPreview.draftSource.json": "高级 JSON",
  "app.generatorPreview.referenceSearchPlaceholder": "搜索要复制结构的模块",
  "app.generatorPreview.referenceSearchEmpty": "没有匹配的模块",
  "app.generatorPreview.referenceSearchEmptyHint":
    "可以改用公共模板开始，或展开 Schema JSON 直接编辑当前草稿。",
  "app.generatorPreview.referenceSearchMore":
    "还有 {count} 个模块，继续搜索可缩小范围",
  "app.generatorPreview.referenceCopyHint":
    "只把已有模块结构复制到当前草稿，不会重新生成或覆盖原模块。",
  "app.generatorPreview.advancedTitle": "高级项",
  "app.generatorPreview.advancedDescription":
    "已有文件处理方式和完整 JSON 保持次级入口，只有需要时再展开。",
  "app.generatorPreview.input.moduleNameLabel": "模块标识",
  "app.generatorPreview.input.moduleNamePlaceholder": "例如 supplier",
  "app.generatorPreview.input.moduleNameHelper":
    "用于生成目录名、模块代码，以及默认的路由和权限前缀。",
  "app.generatorPreview.input.moduleLabelLabel": "模块名称",
  "app.generatorPreview.input.moduleLabelPlaceholder": "例如 供应商",
  "app.generatorPreview.input.moduleLabelHelper":
    "用于页面标题、列表文案和默认表单标题，尽量直接写业务名称。",
  "app.generatorPreview.input.manualSchemaDraftLabel": "Schema JSON",
  "app.generatorPreview.input.manualSchemaDraftPlaceholder":
    "需要时再展开并直接修改完整 Schema JSON",
  "app.generatorPreview.input.manualSchemaDraftHelper":
    "先选输入方式，再生成预览。",
  "app.generatorPreview.input.manualSchemaDraftEmpty":
    "请先填写 Schema JSON 草稿。",
  "app.generatorPreview.input.manualSchemaDraftInvalidJson":
    "Schema JSON 不是有效的 JSON。",
  "app.generatorPreview.input.manualSchemaDraftInvalid":
    "Schema JSON 校验失败：{value}",
  "app.generatorPreview.input.manualSchemaDraftSuggestionEnum":
    "下一步建议：给 enum 字段补 `options` 数组，或填写 `dictionaryTypeCode`。",
  "app.generatorPreview.input.manualSchemaDraftSuggestionId":
    "下一步建议：补一个 `id` 字段，并设置 `kind: \"id\"`、`required: true`。",
  "app.generatorPreview.input.manualSchemaDraftSuggestionKind":
    "下一步建议：把字段类型改成支持的 kind，例如 `string`、`number`、`enum` 或 `datetime`。",
  "app.generatorPreview.conflictStrategy.skip": "跳过已有文件",
  "app.generatorPreview.conflictStrategy.overwrite": "覆盖已有文件",
  "app.generatorPreview.conflictStrategy.overwrite-generated-only":
    "仅覆盖生成文件",
  "app.generatorPreview.conflictStrategy.fail": "遇冲突停止",
  "app.generatorPreview.conflictStrategyDescription.skip":
    "已有文件保持不动，只生成缺失文件。",
  "app.generatorPreview.conflictStrategyDescription.overwrite":
    "目标文件按本次结果直接覆盖。",
  "app.generatorPreview.conflictStrategyDescription.overwrite-generated-only":
    "只覆盖之前由生成器产出的文件。",
  "app.generatorPreview.conflictStrategyDescription.fail":
    "命中已有文件就停止，先让你检查风险。",
  "app.generatorPreview.frontendTargetDescription.vue":
    "生成 Vue 工作区与页面骨架。",
  "app.generatorPreview.frontendTargetDescription.react":
    "生成 React 工作区与页面骨架。",
  "app.generatorPreview.input.schemaFieldCountLabel": "字段数",
  "app.generatorPreview.sqlProposal.status.ready": "可审核",
  "app.generatorPreview.sqlProposal.status.unsupported": "暂不支持自动提案",
  "app.generatorPreview.statsHint": "文件数",
  "app.generatorPreview.tabsHint": "预览 {count} 个产物",
  "app.demoHub.sectionTitle": "Demo Hub 原型页",
  "app.demoHub.sectionCopy":
    "这里专门承载页面原型与交互试稿，不接真实接口、不改真实模块，先把用户流程打磨清楚再进入正式实现。",
  "app.demoHub.shellTitle": "Demo Hub",
  "app.demoHub.shellDescription":
    "集中验证页面信息架构、表单步骤、反馈文案和下一步引导，只保留本地原型交互。",
  "app.demoHub.statsHint": "原型稿数",
  "app.demoHub.tabsHint": "{count} 个原型场景",
  "app.demoHub.badge.prototypeOnly": "仅原型",
  "app.demoHub.badge.formFirst": "表单优先",
  "app.demoHub.badge.noApi": "无真实接口",
  "app.demoHub.heroEyebrow": "页面原型总线",
  "app.demoHub.heroTitle": "先在 Demo Hub 把流程讲清楚，再进入真实实现。",
  "app.demoHub.heroDescription":
    "每个原型都只回答三件事：用户先看见什么、下一步点什么、提交后得到什么反馈。复杂设置收在次级层，不把用户一开始就推进高级配置。",
  "app.demoHub.scenarioLabel": "原型场景",
  "app.demoHub.prototypeTitle": "当前试稿",
  "app.demoHub.prototypeDescription":
    "主区展示目标页面的推荐主流程，所有输入只在本地内存里变化，用来快速比较信息密度与步骤顺序。",
  "app.demoHub.prototypeAudience": "目标用户",
  "app.demoHub.prototypeEntry": "进入方式",
  "app.demoHub.prototypeGoal": "一次完成目标",
  "app.demoHub.prototypePrimaryAction": "主动作",
  "app.demoHub.prototypeFields": "先填这些",
  "app.demoHub.prototypeFeedback": "提交后反馈",
  "app.demoHub.prototypeChecklist": "进入正式开发前确认",
  "app.demoHub.formSectionTitle": "表单主流程试稿",
  "app.demoHub.formSectionDescription":
    "默认用表单承接“我要做什么”，把高级 JSON、结构草稿和派生配置降到次级入口，避免用户一开始就遇到技术表述。",
  "app.demoHub.formModuleCode": "模块标识",
  "app.demoHub.formModuleLabel": "模块名称",
  "app.demoHub.formScenario": "页面目标",
  "app.demoHub.formVariant": "起稿方式",
  "app.demoHub.formVariant.reference": "复制现有模块",
  "app.demoHub.formVariant.template": "从模板开始",
  "app.demoHub.formVariant.manual": "稍后再开高级 JSON",
  "app.demoHub.formNextAction": "下一步会进入",
  "app.demoHub.formNextActionValue": "字段确认与页面预览，而不是直接切到高级 JSON。",
  "app.demoHub.formLocalHint":
    "这些字段只用于原型体验，不会写入模块、路由或生成记录。",
  "app.demoHub.ruleTitle": "Demo Hub 使用规则",
  "app.demoHub.ruleDescription":
    "后续页面优化先落到这里，通过评审后再改真实 workspace，避免边看边改真实模块导致交互回退。",
  "app.demoHub.rule1":
    "不接 server、不落持久化、不调用真实生成或 CRUD 接口。",
  "app.demoHub.rule2":
    "原型应直接表达主流程，次级和高级能力默认折叠，不抢第一屏注意力。",
  "app.demoHub.rule3":
    "如果原型需要跨路由、跨权限或跨模块协调，先在这里验证信息架构，再决定真实 owner。",
  "app.demoHub.handoffTitle": "从原型到实现",
  "app.demoHub.handoffDescription":
    "只有当主流程、字段顺序、反馈文案和空态都稳定后，才允许把结论迁移到真实 workspace。",
  "app.demoHub.handoffStep1": "在 Demo Hub 先形成单页主流程。",
  "app.demoHub.handoffStep2": "补齐需要保留的边界说明与验收点。",
  "app.demoHub.handoffStep3": "确认 canonical owner 后，再改真实页面。",
  "app.demoHub.panelTitle": "原型边界",
  "app.demoHub.panelDescription":
    "这个侧栏只说明边界、评审标准和移交规则，不承载任何真实详情或运行时诊断。",
  "app.demoHub.prototype.stage.start": "起稿原型",
  "app.demoHub.prototype.stage.review": "结果原型",
  "app.demoHub.prototype.stage.apply": "确认原型",
  "app.demoHub.prototype.start.title": "Generator Start",
  "app.demoHub.prototype.start.summary":
    "把起稿第一页收成目标明确的表单，不让用户一上来就落进高级 JSON。",
  "app.demoHub.prototype.review.title": "Generator Review",
  "app.demoHub.prototype.review.summary":
    "先展示结果结论、阻塞判断和下一步，而不是先铺技术证据。",
  "app.demoHub.prototype.apply.title": "Apply Checklist",
  "app.demoHub.prototype.apply.summary":
    "把 apply 前判断做成短确认页，只回答能否继续和还差什么。",
  "app.demoHub.start.headline": "先回答“这次要生成什么”",
  "app.demoHub.start.goal.default": "标准列表管理",
  "app.demoHub.formFrontendTarget": "前端目标",
  "app.demoHub.start.mode.reference":
    "适合结构相近的模块，先选参考对象，再确认字段差异。",
  "app.demoHub.start.mode.template":
    "从基础模板开始，先把页面目标讲清楚，再补字段。",
  "app.demoHub.start.mode.manual":
    "仍从表单主流程开始，需要时再展开高级 JSON。",
  "app.demoHub.start.primaryAction": "继续下一步",
  "app.demoHub.start.highlight.first": "首屏只保留最少必要字段和一个主动作。",
  "app.demoHub.start.highlight.second":
    "复制现有模块后停留在表单主流程，不自动切进高级 JSON。",
  "app.demoHub.start.highlight.third":
    "当前页只整理草稿，下一步进入字段确认或页面预览。",
  "app.demoHub.start.checklist.first": "起稿方式是否一眼能选",
  "app.demoHub.start.checklist.second": "首屏是否没有技术噪音",
  "app.demoHub.start.checklist.third": "继续下一步是否是唯一强动作",
  "app.demoHub.review.stateLabel": "结果判断",
  "app.demoHub.review.headline": "先回答“结果值不值得继续推进”",
  "app.demoHub.review.description":
    "结果页先给状态结论、阻塞判断和主动作，再让用户按需查看文件级细节。",
  "app.demoHub.review.toggle.blocking": "存在阻塞",
  "app.demoHub.review.toggle.ready": "待审核",
  "app.demoHub.review.toggle.failed": "结果不可用",
  "app.demoHub.review.summaryLabel": "当前结论",
  "app.demoHub.review.summary.blocking.title": "当前不能继续 apply",
  "app.demoHub.review.summary.blocking.description":
    "还有阻塞文件未处理，当前页应优先把用户带到第一个阻塞点，而不是继续确认清单。",
  "app.demoHub.review.summary.blocking.next": "下一步：先看阻塞文件",
  "app.demoHub.review.summary.ready.title": "结果已准备好进入审核",
  "app.demoHub.review.summary.ready.description":
    "没有阻塞冲突时，主任务应切到审核判断，而不是立刻 apply。",
  "app.demoHub.review.summary.ready.next": "下一步：进入审核",
  "app.demoHub.review.summary.failed.title": "当前结果不可继续",
  "app.demoHub.review.summary.failed.description":
    "失败时页面应明确建议回到草稿或重新生成，不继续停留在审核心智里。",
  "app.demoHub.review.summary.failed.next": "下一步：返回修改草稿",
  "app.demoHub.review.action.inspectBlocked": "查看第一个阻塞文件",
  "app.demoHub.review.action.enterReview": "进入审核",
  "app.demoHub.review.action.retry": "重新生成预览",
  "app.demoHub.review.listTitle": "生成结果列表",
  "app.demoHub.review.detailTitle": "当前文件详情",
  "app.demoHub.review.diffTitle": "差异摘要",
  "app.demoHub.review.hasChanges": "当前文件有变更",
  "app.demoHub.review.noChanges": "当前文件没有变更",
  "app.demoHub.review.reason.blocked":
    "当前文件已存在人工改动，若继续覆盖会丢失非生成内容，因此先阻断并要求人工判断。",
  "app.demoHub.review.reason.overwrite":
    "当前文件属于生成面，可在确认范围后直接覆盖到新结构。",
  "app.demoHub.review.reason.create":
    "当前文件还不存在，属于新模块接入所需产物，可以直接新增。",
  "app.demoHub.review.reason.skip":
    "当前文件没有有效差异，结果页只需要说明跳过原因，不要抢占用户注意力。",
  "app.demoHub.review.reason.retry":
    "当前结果已过期或失败，建议直接回到起稿重新生成，而不是继续读旧结果。",
  "app.demoHub.review.diff.blocked":
    "- 发现已存在人工字段映射\n- 当前模板会覆盖现有动作列\n- 应先决定保留还是迁移旧实现",
  "app.demoHub.review.diff.overwrite":
    "+ 新增 query summary 区块\n- 删除旧版双栏说明\n~ 调整主动作顺序为“查询 -> 选择 -> 编辑”",
  "app.demoHub.review.diff.create":
    "+ 注册 supplier workspace kind\n+ 写入 route / moduleCode / permissionPrefix\n+ 同步 workspace 标题文案",
  "app.demoHub.review.diff.skip":
    "当前文件与目标结构一致，页面只需保留“为什么没动”的解释。",
  "app.demoHub.review.diff.retry":
    "当前结果不可继续，结果区应收起证据，把用户带回更安全的重生成入口。",
  "app.demoHub.review.checklist.first": "结果列表默认选中最需要先看的文件。",
  "app.demoHub.review.checklist.second": "阻塞状态下只有一个强主动作：先处理阻塞。",
  "app.demoHub.review.checklist.third": "详情区先解释处理原因，再展示 diff 和源码。",
  "app.demoHub.review.actionLabel.block": "阻塞",
  "app.demoHub.review.actionLabel.overwrite": "覆盖",
  "app.demoHub.review.actionLabel.create": "新增",
  "app.demoHub.review.actionLabel.skip": "跳过",
  "app.demoHub.apply.stateLabel": "应用前确认",
  "app.demoHub.apply.headline": "先回答“为什么现在能继续 apply”",
  "app.demoHub.apply.description":
    "确认页只保留短结论、短清单和唯一主动作，不把它做成第二份技术报告。",
  "app.demoHub.apply.toggle.ready": "可继续 apply",
  "app.demoHub.apply.toggle.missing": "仍有未完成项",
  "app.demoHub.apply.toggle.stale": "结果可能过期",
  "app.demoHub.apply.summaryLabel": "当前是否可继续",
  "app.demoHub.apply.summaryHint": "确认页只服务当前决策",
  "app.demoHub.apply.summary.ready.title": "当前结果满足 apply 前条件",
  "app.demoHub.apply.summary.ready.description":
    "页面应直接告诉用户“现在可以继续”，而不是让用户自己从长说明里推断。",
  "app.demoHub.apply.summary.missing.title": "当前还不能继续 apply",
  "app.demoHub.apply.summary.missing.description":
    "页面应明确缺哪一项，例如仍有阻塞、审核未完成或确认项未勾齐。",
  "app.demoHub.apply.summary.stale.title": "当前结果可能已经过期",
  "app.demoHub.apply.summary.stale.description":
    "当目标文件可能已变化时，应先建议重新生成，而不是继续推进旧结果。",
  "app.demoHub.apply.action.confirm": "确认并继续 apply",
  "app.demoHub.apply.action.backToReview": "返回结果检查",
  "app.demoHub.apply.action.regenerate": "重新生成预览",
  "app.demoHub.apply.checklistTitle": "确认清单",
  "app.demoHub.apply.item.files": "文件动作已经确认",
  "app.demoHub.apply.item.blocking": "当前没有阻塞冲突",
  "app.demoHub.apply.item.staging": "本次只 apply 到 staging",
  "app.demoHub.apply.item.sql": "SQL proposal 已确认处理方式",
  "app.demoHub.apply.item.permission": "权限和菜单影响已审查",
  "app.demoHub.apply.item.fresh": "当前结果不是过期结果",
  "app.demoHub.apply.riskTitle": "风险摘要",
  "app.demoHub.apply.risk.first": "阻塞风险要在结果页先处理，不留到确认页再解释。",
  "app.demoHub.apply.risk.second": "SQL proposal 只提示是否需要人工处理，不在这里铺全文。",
  "app.demoHub.apply.risk.third": "结果一旦可能过期，应优先回到重新生成，而不是继续 apply。",
  "app.demoHub.panelPrototypeTitle": "本轮原型范围",
  "app.demoHub.panelPrototypeStart": "Generator Start：起稿第一页怎么更轻松开始。",
  "app.demoHub.panelPrototypeReview":
    "Generator Review：结果页先给结论，再给文件级证据。",
  "app.demoHub.panelPrototypeApply":
    "Apply Checklist：只回答能不能继续和还差什么。",
  "app.demoHub.panelMigrationTitle": "回落到真实实现前",
  "app.demoHub.panelMigrationFirst":
    "先确认哪些按钮主次、折叠规则和状态文案已经稳定。",
  "app.demoHub.panelMigrationSecond":
    "再判断哪些 mock 状态只是原型辅助，不能直接搬进真实 workspace。",
  "app.demoHub.panelMigrationThird":
    "最后才把稳定结论迁回 generator preview 正式页。",
  "app.error.restoreSession": "恢复会话失败",
  "app.error.loadCustomers": "加载客户列表失败",
  "app.error.loadDepartments": "加载部门列表失败",
  "app.error.loadDepartmentDetail": "加载部门详情失败",
  "app.error.exportDepartments": "导出部门列表失败",
  "app.error.exportPosts": "导出岗位列表失败",
  "app.error.loadMenus": "加载菜单列表失败",
  "app.error.loadMenuDetail": "加载菜单详情失败",
  "app.error.exportMenus": "导出菜单列表失败",
  "app.error.loadRoles": "加载角色列表失败",
  "app.error.loadRoleDetail": "加载角色详情失败",
  "app.error.exportRoles": "导出角色列表失败",
  "app.error.loadSettings": "加载配置项列表失败",
  "app.error.exportSettings": "导出配置项失败",
  "app.error.loadSettingDetail": "加载配置项详情失败",
  "app.error.loadTenants": "加载租户列表失败",
  "app.error.loadTenantDetail": "加载租户详情失败",
  "app.error.exportTenants": "导出租户列表失败",
  "app.error.loadDictionaries": "加载字典类型列表失败",
  "app.error.exportDictionaryTypes": "导出字典类型失败",
  "app.error.exportDictionaryItems": "导出字典条目失败",
  "app.error.loadDictionaryDetail": "加载字典详情失败",
  "app.error.loadOperationLogs": "加载操作日志列表失败",
  "app.error.loadOperationLogDetail": "加载操作日志详情失败",
  "app.error.exportOperationLogs": "导出操作日志失败",
  "app.error.loadUsers": "加载用户列表失败",
  "app.error.loadUserDetail": "加载用户详情失败",
  "app.error.exportUsers": "导出用户列表失败",
  "app.error.signIn": "登录失败",
  "app.error.signOut": "退出登录失败",
  "app.error.createCustomer": "创建客户失败",
  "app.error.createDepartment": "创建部门失败",
  "app.error.createMenu": "创建菜单失败",
  "app.error.createRole": "创建角色失败",
  "app.error.createSetting": "创建配置项失败",
  "app.error.createTenant": "创建租户失败",
  "app.error.createDictionary": "创建字典类型失败",
  "app.error.createUser": "创建用户失败",
  "app.error.updateCustomer": "更新客户失败",
  "app.error.updateDepartment": "更新部门失败",
  "app.error.updateMenu": "更新菜单失败",
  "app.error.updateRole": "更新角色失败",
  "app.error.updateSetting": "更新配置项失败",
  "app.error.updateTenant": "更新租户失败",
  "app.error.updateTenantStatus": "切换租户状态失败",
  "app.error.updateDictionary": "更新字典类型失败",
  "app.error.updateUser": "更新用户失败",
  "app.error.deleteCustomer": "删除客户失败",
  "app.error.resetUserPassword": "重置用户密码失败",
  "app.error.loadWorkflowDefinitions": "加载流程定义失败",
  "app.error.loadPlatform": "加载平台视图失败",
  "app.error.customerNameRequired": "客户名称不能为空",
  "app.error.departmentCodeRequired": "部门编码不能为空",
  "app.error.departmentNameRequired": "部门名称不能为空",
  "app.error.menuCodeRequired": "菜单编码不能为空",
  "app.error.menuNameRequired": "菜单名称不能为空",
  "app.error.roleCodeRequired": "角色编码不能为空",
  "app.error.roleNameRequired": "角色名称不能为空",
  "app.error.settingKeyRequired": "配置键不能为空",
  "app.error.settingValueRequired": "配置值不能为空",
  "app.error.tenantCodeRequired": "租户编码不能为空",
  "app.error.tenantNameRequired": "租户名称不能为空",
  "app.error.dictionaryCodeRequired": "字典编码不能为空",
  "app.error.dictionaryNameRequired": "字典名称不能为空",
  "app.error.userUsernameRequired": "用户名不能为空",
  "app.error.userDisplayNameRequired": "显示名称不能为空",
  "app.error.userPasswordRequired": "密码不能为空",
  "app.message.notificationModuleOffline":
    "`notification` 模块尚未注册。请确认服务端已启用系统通知模块后再重试。",
  "app.message.notificationSignInToLoad": "请先登录，再加载受保护的通知数据。",
  "app.message.notificationNoListPermission":
    "当前身份可以进入工作区，但没有 `system:notification:list` 权限。",
  "app.error.loadNotifications": "通知列表加载失败",
  "app.error.loadNotificationDetail": "通知详情加载失败",
  "app.error.createNotification": "通知创建失败",
  "app.error.markNotificationRead": "通知标记已读失败",
  "app.error.markNotificationsRead": "当前通知批量标记已读失败",
  "app.error.exportNotifications": "导出通知列表失败",
  "app.error.notificationRecipientRequired": "接收用户不能为空",
  "app.error.notificationTitleRequired": "通知标题不能为空",
  "app.error.notificationContentRequired": "通知内容不能为空",
  "app.message.fileModuleOffline":
    "`file` 模块尚未注册。请确认服务端已启用系统文件模块后再重试。",
  "app.message.fileSignInToLoad": "请先登录，再加载受保护的文件数据。",
  "app.message.fileNoListPermission":
    "当前身份没有 `system:file:list` 权限；若仍具备上传权限，可以直接上传文件。",
  "app.error.loadFiles": "文件列表加载失败",
  "app.error.loadFileDetail": "文件详情加载失败",
  "app.error.uploadFile": "文件上传失败",
  "app.error.downloadFile": "文件下载失败",
  "app.error.deleteFile": "文件删除失败",
  "app.error.deleteFiles": "当前筛选文件批量删除失败",
  "app.error.exportFiles": "导出文件列表失败",
  "app.error.fileRequired": "请先选择一个要上传的文件",
  "app.error.loadPosts": "岗位列表加载失败",
  "app.error.loadPostDetail": "岗位详情加载失败",
  "app.error.createPost": "岗位创建失败",
  "app.error.updatePost": "岗位更新失败",
  "app.error.loadOnlineSessions": "在线会话加载失败",
  "app.error.revokeOnlineSession": "会话强制下线失败",
  "app.error.postCodeRequired": "岗位编码不能为空",
  "app.error.postNameRequired": "岗位名称不能为空",
}
