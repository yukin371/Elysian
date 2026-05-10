import { describe, expect, test } from "bun:test"

import { enUSWorkflowLocaleMessages } from "./en-US.workflow"
import { zhCNWorkflowLocaleMessages } from "./zh-CN.workflow"

const firstScreenKeys = [
  "app.generatorPreview.sectionCopy",
  "app.generatorPreview.shellDescription",
  "app.generatorPreview.workspaceEyebrow",
  "app.generatorPreview.workspaceDescription",
  "app.generatorPreview.resultListSummary",
  "app.generatorPreview.resultListHint",
  "app.generatorPreview.resultListKeyboardHint",
  "app.generatorPreview.message.runtimeBacked",
  "app.generatorPreview.blockedDescription",
  "app.generatorPreview.blockedRecoverySummary",
  "app.generatorPreview.blockedPrimaryAction",
  "app.generatorPreview.emptyResultTitle",
  "app.generatorPreview.emptyResultDescription",
  "app.generatorPreview.action.closeFileDetail",
  "app.generatorPreview.detailCloseHint",
  "app.generatorPreview.detailEmptyDescription",
  "app.generatorPreview.emptyDetailArtifactCount",
  "app.generatorPreview.emptyDetailNextStep",
  "app.generatorPreview.emptyFilteredHint",
  "app.generatorPreview.action.clearFileSearch",
  "app.generatorPreview.message.confirmedReady",
  "app.generatorPreview.progress.generatingTitle",
  "app.generatorPreview.progress.regeneratingTitle",
  "app.generatorPreview.progress.generatingDescription",
  "app.generatorPreview.progress.reviewingTitle",
  "app.generatorPreview.progress.reviewingDescription",
  "app.generatorPreview.progress.confirmingTitle",
  "app.generatorPreview.progress.confirmingDescription",
  "app.generatorPreview.progress.applyingTitle",
  "app.generatorPreview.progress.applyingDescription",
  "app.generatorPreview.resultRecoveryTitle",
  "app.generatorPreview.resultRecoveryStep.refreshDrift",
  "app.generatorPreview.resultRecoveryStep.reviewBlockedFiles",
  "app.generatorPreview.resultRecoveryStep.recheckChecklist",
  "app.generatorPreview.resultRecoveryStep.restoreSession",
  "app.generatorPreview.resultRecoveryStep.regenerate",
  "app.generatorPreview.errorRecoveryTitle",
  "app.generatorPreview.errorRecoveryStep.fixSchema",
  "app.generatorPreview.errorRecoveryStep.changeConflictStrategy",
  "app.generatorPreview.errorRecoveryStep.retryPreview",
  "app.generatorPreview.errorRecoveryStep.manualReview",
  "app.generatorPreview.message.operationNoSession",
  "app.generatorPreview.message.operationLoading",
  "app.generatorPreview.loading",
  "app.generatorPreview.action.refresh",
  "app.generatorPreview.action.refreshing",
  "app.generatorPreview.action.restoreCurrentResult",
  "app.generatorPreview.next.refresh",
  "app.generatorPreview.next.refreshing",
  "app.generatorPreview.flow.configure",
  "app.generatorPreview.inputTemplateLabel",
  "app.generatorPreview.draftSource.reference",
  "app.generatorPreview.referenceSearchPlaceholder",
  "app.generatorPreview.referenceCopyHint",
  "app.generatorPreview.referenceSearchEmptyHint",
  "app.generatorPreview.input.moduleNameHelper",
  "app.generatorPreview.input.moduleLabelHelper",
] as const

describe("generator preview UX copy", () => {
  test("keeps Chinese first-screen copy task-oriented", () => {
    const text = firstScreenKeys
      .map((key) => zhCNWorkflowLocaleMessages[key])
      .join("\n")

    expect(text).toContain("新建生成")
    expect(text).toContain("生成预览")
    expect(text).toContain("当前结果共")
    expect(text).toContain("从列表里选择一份文件")
    expect(text).toContain("支持 / 聚焦文件搜索")
    expect(text).toContain("可用 ↑ ↓ 快速切换文件")
    expect(text).toContain("这里会显示最新一次生成结果")
    expect(text).toContain("文件状态、审核进度")
    expect(text).toContain("返回结果列表")
    expect(text).toContain("按 Esc 也可以关闭当前文件详情")
    expect(text).toContain("当前结果共")
    expect(text).toContain("先从生成结果里选择一份文件查看证据")
    expect(text).toContain("清空文件搜索")
    expect(text).toContain("回到完整结果列表")
    expect(text).toContain("先打开这些阻塞文件")
    expect(text).toContain("先从第一份开始处理")
    expect(text).toContain("查看第一个阻塞文件")
    expect(text).toContain("下一步建议")
    expect(text).toContain("修正字段结构后再重新生成预览")
    expect(text).toContain("改用更合适的冲突策略")
    expect(text).toContain("再次点击“生成预览”重试当前操作")
    expect(text).toContain("交给开发排查生成器或目标文件状态")
    expect(text).toContain("复制现有模块结构")
    expect(text).toContain("不会重新生成或覆盖原模块")
    expect(text).toContain("改用公共模板开始")
    expect(text).toContain("默认的路由和权限前缀")
    expect(text).toContain("页面标题、列表文案")
    expect(text).toContain("尚未应用到 staging")
    expect(text).toContain("正在生成预览")
    expect(text).toContain("正在重新生成预览")
    expect(text).toContain("可以留在页面等待")
    expect(text).toContain("正在提交审核结果")
    expect(text).toContain("正在记录确认清单")
    expect(text).toContain("正在应用到 staging")
    expect(text).toContain("当前结果的下一步建议")
    expect(text).toContain("目标文件可能已经变化")
    expect(text).toContain("先查看阻塞文件和冲突原因")
    expect(text).toContain("回到确认清单")
    expect(text).toContain("从“最近结果”恢复同一次会话")
    expect(text).toContain("直接重新生成预览")
    expect(text).toContain("恢复当前结果")
    expect(text).not.toContain("克隆")
    expect(text).not.toContain("preview session")
  })

  test("keeps English first-screen copy task-oriented", () => {
    const text = firstScreenKeys
      .map((key) => enUSWorkflowLocaleMessages[key])
      .join("\n")

    expect(text).toContain("New generation")
    expect(text).toContain("Generate preview")
    expect(text).toContain("artifacts are included in the current result")
    expect(text).toContain("select one file from the list")
    expect(text).toContain("Use / to focus file search")
    expect(text).toContain("use ↑ ↓ to move between files")
    expect(text).toContain("latest generation result will appear here")
    expect(text).toContain("file status, review progress")
    expect(text).toContain("Back to result list")
    expect(text).toContain("Press Esc to close the current file detail")
    expect(text).toContain("artifacts are included in the current result")
    expect(text).toContain("select one generated file to review the evidence")
    expect(text).toContain("Clear the file search")
    expect(text).toContain("return to the full result list")
    expect(text).toContain("Open these blocked files first")
    expect(text).toContain("Start with the first one")
    expect(text).toContain("Review first blocked file")
    expect(text).toContain("Suggested next steps")
    expect(text).toContain("fixing the field structure")
    expect(text).toContain("switch to a more suitable conflict strategy")
    expect(text).toContain("click Generate preview again")
    expect(text).toContain("hand it to engineering")
    expect(text).toContain("Copy existing module structure")
    expect(text).toContain("does not regenerate or overwrite")
    expect(text).toContain("Switch to a public template")
    expect(text).toContain("default route and permission prefix")
    expect(text).toContain("page titles, list copy")
    expect(text).toContain("has not been applied to staging yet")
    expect(text).toContain("Generating preview")
    expect(text).toContain("Regenerating preview")
    expect(text).toContain("stay on the page")
    expect(text).toContain("Submitting review decision")
    expect(text).toContain("Recording the confirmation checklist")
    expect(text).toContain("Applying to staging")
    expect(text).toContain("Suggested next steps for the current result")
    expect(text).toContain("target files may have changed")
    expect(text).toContain("Review the blocked files")
    expect(text).toContain("Go back to the checklist")
    expect(text).toContain("restore the same run from Latest result")
    expect(text).toContain("regenerate the preview")
    expect(text).toContain("Restore current result")
    expect(text).not.toContain("Clone")
    expect(text).not.toContain("preview session")
  })
})
