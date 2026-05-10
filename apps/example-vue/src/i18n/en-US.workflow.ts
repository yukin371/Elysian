import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSWorkflowLocaleMessages: VueLocaleMessages = {
  "app.workflow.sectionTitle": "Workflow definition management",
  "app.workflow.sectionCopy":
    "Use this page to inspect, filter, and track workflow definition versions. It is not a start-flow page or a workflow designer.",
  "app.workflow.shellTitle": "Workflow definition management",
  "app.workflow.shellDescription":
    "Inspect, filter, and track workflow definition versions.",
  "app.workflow-definition.sectionTitle": "Workflow definition management",
  "app.workflow-definition.sectionCopy":
    "Use this page to inspect, filter, and track workflow definition versions. It is not a start-flow page or a workflow designer.",
  "app.workflow-definition.shellTitle": "Workflow definition management",
  "app.workflow-definition.shellDescription":
    "Inspect, filter, and track workflow definition versions.",
  "app.message.customerModuleOffline":
    "`customer` module is not registered yet. Add `DATABASE_URL`, run migrations and seed, then restart the server.",
  "app.message.signInToLoad": "Sign in first to load protected customer data.",
  "app.message.workspaceNoListPermission":
    "This identity can enter the workspace but does not have `customer:customer:list`.",
  "app.message.departmentModuleOffline":
    "`department` is not registered on this server yet. Enable the system-department module and try again.",
  "app.message.departmentSignInToLoad":
    "Sign in first to load protected department data.",
  "app.message.departmentNoListPermission":
    "This identity can enter the workspace but does not have `system:department:list`.",
  "app.message.postModuleOffline":
    "`post` is not registered on this server yet. Enable the system-post module and try again.",
  "app.message.postSignInToLoad": "Sign in first to load protected post data.",
  "app.message.postNoListPermission":
    "This identity can enter the workspace but does not have `system:post:list`.",
  "app.message.onlineSessionModuleOffline":
    "`auth` is not registered on this server yet. Enable the auth module and try again.",
  "app.message.onlineSessionSignInToLoad":
    "Sign in first to load the current user's online sessions.",
  "app.message.onlineSessionNoAccess":
    "The online-sessions workspace needs a live signed-in session.",
  "app.message.menuModuleOffline":
    "`menu` is not registered on this server yet. Enable the system-menu module and try again.",
  "app.message.menuSignInToLoad": "Sign in first to load protected menu data.",
  "app.message.menuNoListPermission":
    "This identity can enter the workspace but does not have `system:menu:list`.",
  "app.message.roleModuleOffline":
    "`role` is not registered on this server yet. Enable the system-role module and try again.",
  "app.message.roleSignInToLoad": "Sign in first to load protected role data.",
  "app.message.roleNoListPermission":
    "This identity can enter the workspace but does not have `system:role:list`.",
  "app.message.settingModuleOffline":
    "`setting` is not registered on this server yet. Enable the config-entry module and try again.",
  "app.message.settingSignInToLoad":
    "Sign in first to load protected config-entry data.",
  "app.message.settingNoListPermission":
    "This identity can enter the workspace but does not have `system:setting:list`.",
  "app.message.tenantModuleOffline":
    "`tenant` is not registered on this server yet. Enable the system-tenant module and try again.",
  "app.message.tenantSignInToLoad":
    "Sign in first to load protected tenant data.",
  "app.message.tenantNoListPermission":
    "This identity can enter the workspace but does not have `system:tenant:list`.",
  "app.message.tenantSuperAdminRequired":
    "Tenant management stays restricted to super-admin users. The example app does not fake an interactive state for regular admins.",
  "app.message.dictionaryModuleOffline":
    "`dictionary` is not registered on this server yet. Enable the system-dictionary module and try again.",
  "app.message.dictionarySignInToLoad":
    "Sign in first to load protected dictionary data.",
  "app.message.dictionaryNoListPermission":
    "This identity can enter the workspace but does not have `system:dictionary:list`.",
  "app.message.operationLogModuleOffline":
    "`operation-log` is not registered on this server yet. Enable the system-operation-log module and try again.",
  "app.message.operationLogSignInToLoad":
    "Sign in first to load protected operation log data.",
  "app.message.operationLogNoListPermission":
    "This identity can enter the workspace but does not have `system:operation-log:list`.",
  "app.message.userModuleOffline":
    "`user` is not registered on this server yet. Enable the system-user module and try again.",
  "app.message.userSignInToLoad": "Sign in first to load protected user data.",
  "app.message.userNoListPermission":
    "This identity can enter the workspace but does not have `system:user:list`.",
  "app.message.workflowModuleOffline":
    "`workflow` is not registered on this server yet, so the definitions workspace stays unavailable.",
  "app.message.workflowSignInToLoad":
    "Sign in first to load protected workflow definition data.",
  "app.message.workflowNoListPermission":
    "This identity can enter the workspace but does not have `workflow:definition:list`.",
  "app.workflow.loading": "Loading workflow definitions...",
  "app.workflow.empty": "No workflow definitions exist for the current tenant.",
  "app.workflow.listEyebrow": "Workflow management",
  "app.workflow.listTitle": "Workflow definitions",
  "app.workflow.filter.searchLabel": "Search definitions",
  "app.workflow.filter.searchPlaceholder": "Search by name, key, or id",
  "app.workflow.filter.all": "All",
  "app.workflow.filter.active": "Active",
  "app.workflow.filter.disabled": "Disabled",
  "app.workflow.filter.reset": "Clear filters",
  "app.workflow.pagination.empty": "0 total",
  "app.workflow.pagination.summary":
    "Page {page}/{totalPages}, {start}-{end} of {total}",
  "app.workflow.pagination.previous": "Previous",
  "app.workflow.pagination.next": "Next",
  "app.workflow.detailEyebrow": "Workflow definition detail",
  "app.workflow.detailDescription":
    "The detail dialog stays focused on structure, status, and version metadata for the selected definition.",
  "app.workflow.detailEmpty":
    "Select a workflow definition to inspect its structure.",
  "app.workflow.detailEmptyTitle": "No definition selected",
  "app.workflow.detailLoading": "Refreshing workflow definition detail...",
  "app.workflow.emptyFiltered":
    "No workflow definitions match the current filters.",
  "app.workflow.meta.status": "Status",
  "app.workflow.meta.key": "Key",
  "app.workflow.meta.version": "Version",
  "app.workflow.meta.structure": "Structure",
  "app.workflow.meta.updatedAt": "Updated at",
  "app.workflow.meta.nodes": "nodes",
  "app.workflow.meta.edges": "edges",
  "app.workflow.versionHistoryTitle": "Version history",
  "app.workflow.nodeFlowTitle": "Node flow",
  "app.workflow.status.active": "Active",
  "app.workflow.status.disabled": "Disabled",
  "app.workflow.nodeType.start": "Start",
  "app.workflow.nodeType.approval": "Approval",
  "app.workflow.nodeType.condition": "Condition",
  "app.workflow.nodeType.end": "End",
  "app.workflow.node.assignee": "Assignee",
  "app.workflow.node.conditions": "{count} condition branches",
  "app.workflow.statsHint": "Current workflow definition rows",
  "app.workflow.tabsHint": "{count} workflow definitions",
  "app.generatorPreview.sectionTitle": "Generator preview workspace",
  "app.generatorPreview.sectionCopy":
    "Start from a module draft, generate a preview, review files, permissions, and SQL proposals, then decide whether to apply to staging.",
  "app.generatorPreview.shellTitle": "Generator preview workspace",
  "app.generatorPreview.shellDescription":
    "New generation, latest result, and generated files form one reviewable and replayable operation path.",
  "app.generatorPreview.workspaceEyebrow": "Generator preview",
  "app.generatorPreview.workspaceTitle": "Generated files",
  "app.generatorPreview.workspaceDescription":
    "Configure the module draft and frontend target first, then review file plans, diff summaries, SQL proposals, and apply evidence.",
  "app.generatorPreview.resultListSummary":
    "{count} artifacts are included in the current result.",
  "app.generatorPreview.resultListHint":
    "Next: select one file from the list to review diff, source, and SQL evidence.",
  "app.generatorPreview.resultListKeyboardHint":
    "Use / to focus file search. Once the result list is focused, use ↑ ↓ to move between files.",
  "app.generatorPreview.message.localOnly":
    "This workspace is preview-only. It does not write to the generation directory and does not replace the CLI apply or preview reports.",
  "app.generatorPreview.message.runtimeBacked":
    "This workspace is driven by backend generation records, so the file plan, conflict status, and apply evidence come from preview reports.",
  "app.generatorPreview.message.blockingConflicts":
    "Blocking conflicts found. Resolve them before applying to staging.",
  "app.generatorPreview.blockedTitle": "Blocking conflicts",
  "app.generatorPreview.blockedCount":
    "{count} files cannot be applied directly right now",
  "app.generatorPreview.blockedDescription":
    "Open these blocked files first, confirm why they conflict, then decide whether to regenerate or change the existing-file handling.",
  "app.generatorPreview.blockedAction": "Open this file diff",
  "app.generatorPreview.blockedRecoverySummary":
    "{count} blocked files still need review. Start with the first one.",
  "app.generatorPreview.blockedPrimaryAction": "Review first blocked file",
  "app.generatorPreview.message.pendingReview":
    "Approve this preview before applying to staging.",
  "app.generatorPreview.message.operationNoSession":
    "Generate a preview result before reviewing or applying to staging.",
  "app.generatorPreview.message.operationLoading":
    "A preview result is being generated. Actions will be available after generation finishes.",
  "app.generatorPreview.message.operationBusy":
    "A review or apply operation is already running. Wait for it to finish.",
  "app.generatorPreview.message.confirmReject":
    "Click confirm reject again to close this session, or cancel to continue reviewing.",
  "app.generatorPreview.message.confirmApply":
    "Click confirm apply again to write to staging after reviewing file diffs and the SQL draft.",
  "app.generatorPreview.message.rejectCommentRequired":
    "Add a rejection reason so the next preview has a clear correction target.",
  "app.generatorPreview.message.operationApplied":
    "This result has already been applied to staging. It does not need to be applied again.",
  "app.generatorPreview.message.operationApplyUnavailable":
    "This result cannot be applied yet. Confirm the checklist first and make sure there are no blocking conflicts.",
  "app.generatorPreview.errorRecoveryTitle": "Suggested next steps",
  "app.generatorPreview.errorRecoveryStep.fixSchema":
    "Check the Schema JSON, module code, and module name first, then regenerate the preview after fixing the field structure.",
  "app.generatorPreview.errorRecoveryStep.changeConflictStrategy":
    "Review how existing files are handled. If the conflict is expected, switch to a more suitable conflict strategy and try again.",
  "app.generatorPreview.errorRecoveryStep.retryPreview":
    "After confirming the input is correct, click Generate preview again to retry the current operation.",
  "app.generatorPreview.errorRecoveryStep.manualReview":
    "If it still fails, keep the current draft and latest result, then hand it to engineering to inspect the generator or target-file state.",
  "app.generatorPreview.message.reviewApproved":
    "This preview passed review at {value}.",
  "app.generatorPreview.message.reviewRejected":
    "This preview was rejected at {value}.",
  "app.generatorPreview.message.rejected":
    "This preview was rejected. Generate a new one to continue.",
  "app.generatorPreview.message.applied":
    "This preview has already been applied to staging at {value}.",
  "app.generatorPreview.progress.generatingTitle": "Generating preview",
  "app.generatorPreview.progress.regeneratingTitle": "Regenerating preview",
  "app.generatorPreview.progress.generatingDescription":
    "This stage refreshes the latest result and file plan. You can stay on the page or come back later and continue from Latest result.",
  "app.generatorPreview.progress.reviewingTitle": "Submitting review decision",
  "app.generatorPreview.progress.reviewingDescription":
    "This stage updates the review status and next actions. You can come back later and continue from Latest result.",
  "app.generatorPreview.progress.confirmingTitle":
    "Recording the confirmation checklist",
  "app.generatorPreview.progress.confirmingDescription":
    "This stage stores the confirmation evidence and moves the session into the pre-apply state. You can come back later and continue.",
  "app.generatorPreview.progress.applyingTitle": "Applying to staging",
  "app.generatorPreview.progress.applyingDescription":
    "This stage writes to staging and updates apply evidence. Wait for the status refresh, or come back later and review it from Latest result.",
  "app.generatorPreview.resultRecoveryTitle":
    "Suggested next steps for the current result",
  "app.generatorPreview.resultRecoveryStep.refreshDrift":
    "The target files may have changed. Regenerate the preview first, then review or apply again instead of relying on stale evidence.",
  "app.generatorPreview.resultRecoveryStep.reviewBlockedFiles":
    "Review the blocked files and conflict reasons first, then decide whether the existing-file handling should change.",
  "app.generatorPreview.resultRecoveryStep.recheckChecklist":
    "Go back to the checklist and verify the target directory, file count, SQL proposal, and manual confirmation items again.",
  "app.generatorPreview.resultRecoveryStep.restoreSession":
    "If you left the flow, restore the same run from Latest result before continuing.",
  "app.generatorPreview.resultRecoveryStep.regenerate":
    "If the current result is no longer trustworthy, regenerate the preview instead of pushing forward on old evidence.",
  "app.generatorPreview.filter.schemaLabel": "Module",
  "app.generatorPreview.filter.conflictLabel": "How to handle existing files",
  "app.generatorPreview.filter.frontendLabel": "Frontend target",
  "app.generatorPreview.filter.searchLabel": "Search artifacts",
  "app.generatorPreview.filter.searchPlaceholder": "Search files",
  "app.generatorPreview.filter.sessionLabel": "View recent results",
  "app.generatorPreview.filter.sessionPlaceholder": "Restore session",
  "app.generatorPreview.recentSessionBadge.current": "Current setup",
  "app.generatorPreview.recentSessionBadge.blocking": "Blocking conflict",
  "app.generatorPreview.filter.reset": "Clear filters",
  "app.generatorPreview.filter.schemaSummary": "Schema: {value}",
  "app.generatorPreview.filter.frontendSummary": "Frontend: {value}",
  "app.generatorPreview.filter.conflictSummary": "Strategy: {value}",
  "app.generatorPreview.filter.querySummary": "Query: {value}",
  "app.generatorPreview.detailEyebrow": "Preview detail",
  "app.generatorPreview.detailDescription":
    "The detail cards stay focused on the selected file, generation record metadata, and SQL preview instead of duplicating the file list.",
  "app.generatorPreview.detailEmptyTitle": "No generated file selected",
  "app.generatorPreview.detailEmptyDescription":
    "Pick an artifact from the list to inspect source, session details, and SQL preview.",
  "app.generatorPreview.action.closeFileDetail": "Back to result list",
  "app.generatorPreview.detailCloseHint":
    "Press Esc to close the current file detail too.",
  "app.generatorPreview.emptyDetailArtifactCount":
    "{count} artifacts are included in the current result",
  "app.generatorPreview.emptyDetailNextStep":
    "Next: select one generated file to review the evidence.",
  "app.generatorPreview.emptyFiltered":
    "No generated files match the current filter.",
  "app.generatorPreview.emptyFilteredHint":
    "Clear the file search to return to the full result list, then choose the artifact you want to inspect.",
  "app.generatorPreview.action.clearFileSearch": "Clear file search",
  "app.generatorPreview.loading": "Generating the latest preview.",
  "app.generatorPreview.action.refresh": "Generate preview",
  "app.generatorPreview.action.refreshing": "Generating",
  "app.generatorPreview.action.generatePreview": "Generate preview",
  "app.generatorPreview.action.generatingPreview": "Generating",
  "app.generatorPreview.action.restoreCurrentResult": "Restore current result",
  "app.generatorPreview.action.regeneratePreview": "Regenerate preview",
  "app.generatorPreview.action.regeneratingPreview": "Regenerating",
  "app.generatorPreview.action.loadCurrentSchemaDraft":
    "Copy structure into draft",
  "app.generatorPreview.action.expandSchemaEditor": "Edit JSON",
  "app.generatorPreview.action.collapseSchemaEditor": "Hide JSON",
  "app.generatorPreview.input.templateLabel": "Public templates",
  "app.generatorPreview.input.templateHint":
    "Load a base template first, then expand Schema JSON only when needed.",
  "app.generatorPreview.input.validationDetails": "Validation details",
  "app.generatorPreview.action.approve": "Approve",
  "app.generatorPreview.action.reject": "Reject",
  "app.generatorPreview.action.confirmReject": "Confirm reject",
  "app.generatorPreview.action.cancelRejectConfirm": "Cancel reject",
  "app.generatorPreview.action.confirmChecklist": "Confirm checklist",
  "app.generatorPreview.action.apply": "Apply to staging",
  "app.generatorPreview.action.confirmApply": "Confirm staging apply",
  "app.generatorPreview.action.cancelApplyConfirm": "Cancel confirm",
  "app.generatorPreview.action.applying": "Applying",
  "app.generatorPreview.action.copyCommands": "Copy commands",
  "app.generatorPreview.action.copyCommandsDone": "Copied",
  "app.generatorPreview.action.copyCommandsFailed": "Copy failed",
  "app.generatorPreview.action.copySnippet": "Copy snippet",
  "app.generatorPreview.action.copySnippetDone": "Copied",
  "app.generatorPreview.action.copySnippetFailed": "Copy failed",
  "app.generatorPreview.next.refresh": "Next: generate preview",
  "app.generatorPreview.next.refreshing": "Next: wait for generation",
  "app.generatorPreview.next.review": "Next: approve or reject",
  "app.generatorPreview.next.reviewing": "Next: wait for review",
  "app.generatorPreview.next.confirmReject": "Next: confirm reject or cancel",
  "app.generatorPreview.next.confirmChecklist":
    "Next: confirm checklist before apply",
  "app.generatorPreview.next.apply": "Next: apply to staging",
  "app.generatorPreview.next.confirmApply": "Next: confirm apply or cancel",
  "app.generatorPreview.next.applying": "Next: wait for apply",
  "app.generatorPreview.next.resolveConflicts":
    "Next: resolve blocking conflicts",
  "app.generatorPreview.next.done": "Next: complete",
  "app.generatorPreview.next.wait": "Next: wait for status update",
  "app.generatorPreview.flow.configure": "New generation",
  "app.generatorPreview.flow.review": "Review diff",
  "app.generatorPreview.flow.confirm": "Confirm checklist",
  "app.generatorPreview.flow.apply": "Apply to staging",
  "app.generatorPreview.flow.done": "Done",
  "app.generatorPreview.action.editConfig": "Regenerate",
  "app.generatorPreview.action.closeConfig": "Hide new generation",
  "app.generatorPreview.reviewCommentLabel": "Review comment",
  "app.generatorPreview.reviewCommentPlaceholder": "Comment (optional)",
  "app.generatorPreview.status.pendingReview": "Pending review",
  "app.generatorPreview.status.ready": "Ready",
  "app.generatorPreview.status.rejected": "Rejected",
  "app.generatorPreview.status.applied": "Applied",
  "app.generatorPreview.status.notGenerated": "Not generated",
  "app.generatorPreview.message.confirmedReady":
    "Review is approved, but this result has not been applied to staging yet. Confirm the target, existing-file handling, and file count before applying.",
  "app.generatorPreview.message.confirmationEvidenceCaptured":
    "Confirmation evidence captured with {count} checklist items.",
  "app.generatorPreview.message.confirmationEvidenceDetailed":
    "Confirmation evidence captured: {count} checklist items, report={reportPath}, snapshot={snapshotPath}, recovery={recoveryStatus}.",
  "app.generatorPreview.confirmationChecklistTitle":
    "Pre-apply confirmation checklist",
  "app.generatorPreview.checklist.fileActions":
    "File actions: {total} artifacts, {changed} changed; create {create}, overwrite {overwrite}, skip {skip}, block {block}.",
  "app.generatorPreview.checklist.fileActionsMissing":
    "File actions: no diff summary is available. Regenerate the preview first.",
  "app.generatorPreview.checklist.conflictClear":
    "Conflict status: no blocking conflicts are present.",
  "app.generatorPreview.checklist.conflictBlocking":
    "Conflict status: blocking conflicts are still present and cannot be applied directly.",
  "app.generatorPreview.checklist.targetStaging":
    "Target: this result applies only to staging.",
  "app.generatorPreview.checklist.conflictStrategy":
    "Existing-file handling: {value}.",
  "app.generatorPreview.checklist.sqlProposalReady":
    "SQL proposal: a review-only proposal is available and still needs manual confirmation before formal integration.",
  "app.generatorPreview.checklist.sqlProposalUnsupported":
    "SQL proposal: automatic proposal is unsupported for this module; handle it manually from the handoff guide.",
  "app.generatorPreview.checklist.sqlProposalMissing":
    "SQL proposal: no proposal is available for this result; confirm whether a manual database change is required.",
  "app.generatorPreview.checklist.manualConfirmation":
    "Manual confirmation: file diffs, SQL proposal, permissions, and menu impact have been reviewed.",
  "app.generatorPreview.summary.changed": "Changed files",
  "app.generatorPreview.summary.create": "Create",
  "app.generatorPreview.summary.overwrite": "Overwrite",
  "app.generatorPreview.summary.skip": "Skip",
  "app.generatorPreview.summary.block": "Block",
  "app.generatorPreview.actionLabel.create": "Create",
  "app.generatorPreview.actionLabel.overwrite": "Overwrite",
  "app.generatorPreview.actionLabel.skip": "Skip",
  "app.generatorPreview.actionLabel.block": "Block",
  "app.generatorPreview.sessionTitle": "Latest result",
  "app.generatorPreview.emptyResultTitle":
    "The latest generation result will appear here",
  "app.generatorPreview.emptyResultDescription":
    "After you click Generate preview, this area shows file status, review progress, and the next apply-to-staging actions.",
  "app.generatorPreview.fileDecisionTitle": "File rationale",
  "app.generatorPreview.diffTitle": "Diff summary",
  "app.generatorPreview.fileDiffTitle": "Current file diff",
  "app.generatorPreview.lineDiffTitle": "Line diff",
  "app.generatorPreview.reviewTitle": "Review evidence",
  "app.generatorPreview.applyTitle": "Apply evidence",
  "app.generatorPreview.sqlProposalTitle": "SQL proposal",
  "app.generatorPreview.sqlDraftTitle": "SQL draft",
  "app.generatorPreview.sqlProposalDrizzleImportTitle":
    "Drizzle import snippet",
  "app.generatorPreview.sqlProposalDrizzleSchemaTitle":
    "Drizzle schema snippet",
  "app.generatorPreview.sqlHandoffTitle": "Formal handoff guide",
  "app.generatorPreview.migrationProposalSnapshotTitle":
    "Migration proposal snapshot",
  "app.generatorPreview.sqlConfirmationTitle": "Manual confirmation checklist",
  "app.generatorPreview.migrationProposalRecovery.rebuiltFromMissing":
    "Snapshot was missing and has been regenerated from the current report.",
  "app.generatorPreview.migrationProposalRecovery.rebuiltFromCorrupt":
    "Snapshot was rebuilt from the corrupted copy, and the original file was archived to",
  "app.generatorPreview.sourceTitle": "Generated source",
  "app.generatorPreview.currentSourceTitle": "Current target contents",
  "app.generatorPreview.sqlTitle": "SQL preview",
  "app.generatorPreview.frontendImpactTitle":
    "Frontend registration and permission impact",
  "app.generatorPreview.meta.schemaName": "Schema",
  "app.generatorPreview.meta.frontendTarget": "Frontend target",
  "app.generatorPreview.meta.status": "Current status",
  "app.generatorPreview.meta.mergeStrategy": "Merge strategy",
  "app.generatorPreview.meta.fileAction": "Planned action",
  "app.generatorPreview.meta.changed": "Has changes",
  "app.generatorPreview.meta.changedYes": "Yes",
  "app.generatorPreview.meta.changedNo": "No",
  "app.generatorPreview.meta.lines": "lines",
  "app.generatorPreview.meta.moduleCode": "Module code",
  "app.generatorPreview.meta.routePath": "Route path",
  "app.generatorPreview.meta.permissionPrefix": "Permission prefix",
  "app.generatorPreview.meta.surfaceKind": "Surface kind",
  "app.generatorPreview.meta.sessionId": "Session ID",
  "app.generatorPreview.meta.absolutePath": "Absolute path",
  "app.generatorPreview.meta.exists": "Target file exists",
  "app.generatorPreview.meta.managed": "Target file is managed",
  "app.generatorPreview.meta.reportPath": "Preview report path",
  "app.generatorPreview.meta.outputDir": "Output directory",
  "app.generatorPreview.meta.targetPreset": "Target",
  "app.generatorPreview.meta.addedLines": "Added lines",
  "app.generatorPreview.meta.removedLines": "Removed lines",
  "app.generatorPreview.meta.unchangedLines": "Unchanged lines",
  "app.generatorPreview.meta.createdAt": "Created at",
  "app.generatorPreview.meta.actor": "Actor",
  "app.generatorPreview.meta.sourceType": "Source type",
  "app.generatorPreview.meta.sourceValue": "Source value",
  "app.generatorPreview.meta.conflictStrategy": "Conflict strategy",
  "app.generatorPreview.meta.confirmedAt": "Confirmed at",
  "app.generatorPreview.meta.confirmedBy": "Confirmed by",
  "app.generatorPreview.meta.templateReason": "Template purpose",
  "app.generatorPreview.meta.plannedReason": "Decision reason",
  "app.generatorPreview.meta.proposalStatus": "Proposal status",
  "app.generatorPreview.meta.generatedAt": "Generated at",
  "app.generatorPreview.meta.canonicalOwner": "Canonical owner",
  "app.generatorPreview.meta.reviewMode": "Handoff mode",
  "app.generatorPreview.meta.generatedOnly": "Generated only",
  "app.generatorPreview.meta.schemaDir": "Schema directory",
  "app.generatorPreview.meta.drizzleDir": "Migration directory",
  "app.generatorPreview.meta.schemaIndexFile": "Schema index",
  "app.generatorPreview.meta.persistenceIndexFile": "Persistence index",
  "app.generatorPreview.meta.reviewedAt": "Reviewed at",
  "app.generatorPreview.meta.reviewDecision": "Review decision",
  "app.generatorPreview.meta.reviewComment": "Review comment",
  "app.generatorPreview.meta.appliedAt": "Applied at",
  "app.generatorPreview.meta.manifestPath": "Manifest path",
  "app.generatorPreview.meta.requestId": "Request ID",
  "app.generatorPreview.sourceType.registeredSchema":
    "Existing module structure",
  "app.generatorPreview.sourceType.manualSchemaJson": "Schema JSON",
  "app.generatorPreview.inputTitle": "New generation",
  "app.generatorPreview.inputModeLabel": "Starting point",
  "app.generatorPreview.inputTemplateLabel": "Copy existing module structure",
  "app.generatorPreview.inputSchemaLabel": "Schema template",
  "app.generatorPreview.inputMode.registeredSchema": "Use registered schema",
  "app.generatorPreview.inputMode.manualSchemaJson": "Paste schema JSON",
  "app.generatorPreview.draftSource.template": "Public templates",
  "app.generatorPreview.draftSource.reference": "Copy existing module structure",
  "app.generatorPreview.draftSource.json": "Advanced JSON",
  "app.generatorPreview.referenceSearchPlaceholder":
    "Search modules whose structure should be copied",
  "app.generatorPreview.referenceSearchEmpty": "No matching modules",
  "app.generatorPreview.referenceSearchEmptyHint":
    "Switch to a public template, or expand Schema JSON to edit the current draft directly.",
  "app.generatorPreview.referenceSearchMore":
    "{count} more modules are hidden. Keep searching to narrow them down",
  "app.generatorPreview.referenceCopyHint":
    "This only copies the existing module structure into the current draft. It does not regenerate or overwrite the source module.",
  "app.generatorPreview.input.moduleNameLabel": "Module code",
  "app.generatorPreview.input.moduleNamePlaceholder": "For example supplier",
  "app.generatorPreview.input.moduleNameHelper":
    "Used for generated directories, module code, and the default route and permission prefix.",
  "app.generatorPreview.input.moduleLabelLabel": "Module name",
  "app.generatorPreview.input.moduleLabelPlaceholder": "For example Supplier",
  "app.generatorPreview.input.moduleLabelHelper":
    "Used for page titles, list copy, and default form titles. Keep it as the business-facing name.",
  "app.generatorPreview.input.manualSchemaDraftLabel": "Schema JSON",
  "app.generatorPreview.input.manualSchemaDraftPlaceholder":
    "Expand this section only when you need to edit the full Schema JSON",
  "app.generatorPreview.input.manualSchemaDraftHelper":
    "Choose an input mode, then refresh the preview.",
  "app.generatorPreview.input.manualSchemaDraftEmpty":
    "Fill in the schema JSON draft first.",
  "app.generatorPreview.input.manualSchemaDraftInvalidJson":
    "The schema JSON is not valid JSON.",
  "app.generatorPreview.input.manualSchemaDraftInvalid":
    "Schema JSON validation failed: {value}",
  "app.generatorPreview.input.manualSchemaDraftSuggestionEnum":
    "Next step: add an `options` array for the enum field, or fill in `dictionaryTypeCode`.",
  "app.generatorPreview.input.manualSchemaDraftSuggestionId":
    "Next step: add an `id` field and set `kind: \"id\"` with `required: true`.",
  "app.generatorPreview.input.manualSchemaDraftSuggestionKind":
    "Next step: change the field kind to a supported value such as `string`, `number`, `enum`, or `datetime`.",
  "app.generatorPreview.conflictStrategy.skip": "Skip existing files",
  "app.generatorPreview.conflictStrategy.overwrite": "Overwrite existing files",
  "app.generatorPreview.conflictStrategy.overwrite-generated-only":
    "Overwrite generated only",
  "app.generatorPreview.conflictStrategy.fail": "Stop on conflict",
  "app.generatorPreview.conflictStrategyDescription.skip":
    "Keep existing files untouched and generate only the missing ones.",
  "app.generatorPreview.conflictStrategyDescription.overwrite":
    "Replace the target files with this preview result.",
  "app.generatorPreview.conflictStrategyDescription.overwrite-generated-only":
    "Replace only files that were previously generated.",
  "app.generatorPreview.conflictStrategyDescription.fail":
    "Stop as soon as an existing file is hit so you can review the risk.",
  "app.generatorPreview.frontendTargetDescription.vue":
    "Generate the Vue workspace and page scaffold.",
  "app.generatorPreview.frontendTargetDescription.react":
    "Generate the React workspace and page scaffold.",
  "app.generatorPreview.input.schemaFieldCountLabel": "Field count",
  "app.generatorPreview.sqlProposal.status.ready": "Ready for review",
  "app.generatorPreview.sqlProposal.status.unsupported":
    "Unsupported for auto proposal",
  "app.generatorPreview.statsHint": "File count",
  "app.generatorPreview.tabsHint": "{count} preview artifacts",
  "app.error.restoreSession": "Failed to restore session",
  "app.error.loadCustomers": "Failed to load customers",
  "app.error.loadDepartments": "Failed to load departments",
  "app.error.loadDepartmentDetail": "Failed to load department detail",
  "app.error.exportDepartments": "Failed to export departments",
  "app.error.exportPosts": "Failed to export posts",
  "app.error.loadMenus": "Failed to load menus",
  "app.error.loadMenuDetail": "Failed to load menu detail",
  "app.error.exportMenus": "Failed to export menus",
  "app.error.loadRoles": "Failed to load roles",
  "app.error.loadRoleDetail": "Failed to load role detail",
  "app.error.exportRoles": "Failed to export roles",
  "app.error.loadSettings": "Failed to load config entries",
  "app.error.exportSettings": "Failed to export config entries",
  "app.error.loadSettingDetail": "Failed to load config-entry detail",
  "app.error.loadTenants": "Failed to load tenants",
  "app.error.loadTenantDetail": "Failed to load tenant detail",
  "app.error.exportTenants": "Failed to export tenants",
  "app.error.loadDictionaries": "Failed to load dictionary types",
  "app.error.exportDictionaryTypes": "Failed to export dictionary types",
  "app.error.exportDictionaryItems": "Failed to export dictionary items",
  "app.error.loadDictionaryDetail": "Failed to load dictionary detail",
  "app.error.loadOperationLogs": "Failed to load operation logs",
  "app.error.loadOperationLogDetail": "Failed to load operation log detail",
  "app.error.exportOperationLogs": "Failed to export operation logs",
  "app.error.loadUsers": "Failed to load users",
  "app.error.loadUserDetail": "Failed to load user detail",
  "app.error.exportUsers": "Failed to export users",
  "app.error.signIn": "Failed to sign in",
  "app.error.signOut": "Failed to sign out",
  "app.error.createCustomer": "Failed to create customer",
  "app.error.createDepartment": "Failed to create department",
  "app.error.createMenu": "Failed to create menu",
  "app.error.createRole": "Failed to create role",
  "app.error.createSetting": "Failed to create config entry",
  "app.error.createTenant": "Failed to create tenant",
  "app.error.createDictionary": "Failed to create dictionary type",
  "app.error.createUser": "Failed to create user",
  "app.error.updateCustomer": "Failed to update customer",
  "app.error.updateDepartment": "Failed to update department",
  "app.error.updateMenu": "Failed to update menu",
  "app.error.updateRole": "Failed to update role",
  "app.error.updateSetting": "Failed to update config entry",
  "app.error.updateTenant": "Failed to update tenant",
  "app.error.updateTenantStatus": "Failed to update tenant status",
  "app.error.updateDictionary": "Failed to update dictionary type",
  "app.error.updateUser": "Failed to update user",
  "app.error.deleteCustomer": "Failed to delete customer",
  "app.error.resetUserPassword": "Failed to reset user password",
  "app.error.loadWorkflowDefinitions": "Failed to load workflow definitions",
  "app.error.loadPlatform": "Failed to load platform view",
  "app.error.customerNameRequired": "Customer name is required",
  "app.error.departmentCodeRequired": "Department code is required",
  "app.error.departmentNameRequired": "Department name is required",
  "app.error.menuCodeRequired": "Menu code is required",
  "app.error.menuNameRequired": "Menu name is required",
  "app.error.roleCodeRequired": "Role code is required",
  "app.error.roleNameRequired": "Role name is required",
  "app.error.settingKeyRequired": "Setting key is required",
  "app.error.settingValueRequired": "Setting value is required",
  "app.error.tenantCodeRequired": "Tenant code is required",
  "app.error.tenantNameRequired": "Tenant name is required",
  "app.error.dictionaryCodeRequired": "Dictionary code is required",
  "app.error.dictionaryNameRequired": "Dictionary name is required",
  "app.error.userUsernameRequired": "Username is required",
  "app.error.userDisplayNameRequired": "Display name is required",
  "app.error.userPasswordRequired": "Password is required",
  "app.message.notificationModuleOffline":
    "`notification` is not registered on this server yet. Enable the system-notification module and try again.",
  "app.message.notificationSignInToLoad":
    "Sign in first to load protected notification data.",
  "app.message.notificationNoListPermission":
    "This identity can enter the workspace but does not have `system:notification:list`.",
  "app.error.loadNotifications": "Failed to load notifications",
  "app.error.loadNotificationDetail": "Failed to load notification detail",
  "app.error.createNotification": "Failed to create notification",
  "app.error.markNotificationRead": "Failed to mark notification as read",
  "app.error.markNotificationsRead":
    "Failed to mark visible notifications as read",
  "app.error.exportNotifications": "Failed to export notifications",
  "app.error.notificationRecipientRequired": "Recipient user is required",
  "app.error.notificationTitleRequired": "Notification title is required",
  "app.error.notificationContentRequired": "Notification content is required",
  "app.message.fileModuleOffline":
    "`file` is not registered on this server yet. Enable the system-file module and try again.",
  "app.message.fileSignInToLoad": "Sign in first to load protected file data.",
  "app.message.fileNoListPermission":
    "This identity does not have `system:file:list`; if upload permission is still available, upload a file directly.",
  "app.error.loadFiles": "Failed to load files",
  "app.error.loadFileDetail": "Failed to load file detail",
  "app.error.uploadFile": "Failed to upload file",
  "app.error.downloadFile": "Failed to download file",
  "app.error.deleteFile": "Failed to delete file",
  "app.error.deleteFiles": "Failed to delete filtered files",
  "app.error.exportFiles": "Failed to export files",
  "app.error.fileRequired": "Choose a file before uploading",
  "app.error.loadPosts": "Failed to load posts",
  "app.error.loadPostDetail": "Failed to load post detail",
  "app.error.createPost": "Failed to create post",
  "app.error.updatePost": "Failed to update post",
  "app.error.loadOnlineSessions": "Failed to load online sessions",
  "app.error.revokeOnlineSession": "Failed to revoke the selected session",
  "app.error.postCodeRequired": "Post code is required",
  "app.error.postNameRequired": "Post name is required",
}
