import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

import { validateModuleSchema } from "@elysian/schema"

export type P5aHandoffStatus = "passed" | "failed"
export type P5aHandoffDecision =
  | "ready_for_generator"
  | "retry_ai_generation"
  | "manual_fix_required"
  | "rollback_to_template"

export interface P5aTaskInputValidationIssue {
  section: string
  message: string
}

export interface P5aHandoffReport {
  generatedAt: string
  inputFilePath: string
  schemaFilePath: string
  reportDir: string
  status: P5aHandoffStatus
  decision: P5aHandoffDecision
  taskInputIssues: P5aTaskInputValidationIssue[]
  schemaIssues: Array<{
    path: string
    message: string
  }>
  recommendedActions: string[]
}

const resolveSummaryPath = () => process.env.GITHUB_STEP_SUMMARY ?? null
const resolveGitHubOutputPath = () => process.env.GITHUB_OUTPUT ?? null

export const requiredTaskInputSections = [
  "任务目标：",
  "业务背景：",
  "范围边界（必须/禁止）：",
  "影响模块：",
  "验收标准：",
  "验证命令：",
  "文档同步要求：",
] as const

export const resolveP5aReportDir = () =>
  process.env.ELYSIAN_REPORT_DIR ??
  join(tmpdir(), "elysian-reports", "p5a-handoff")

export const validateTaskInputTemplate = (
  contents: string,
): P5aTaskInputValidationIssue[] =>
  requiredTaskInputSections
    .filter((section) => !contents.includes(section))
    .map((section) => ({
      section,
      message: `Task input is missing required section: ${section}`,
    }))

export const decideP5aHandoff = (
  taskInputIssues: P5aTaskInputValidationIssue[],
  schemaIssues: Array<{ path: string; message: string }>,
): P5aHandoffDecision => {
  if (taskInputIssues.length > 0) {
    return "rollback_to_template"
  }

  if (schemaIssues.length === 0) {
    return "ready_for_generator"
  }

  const hasTopLevelShapeIssues = schemaIssues.some((issue) => {
    if (issue.path === "$") {
      return true
    }

    return !issue.path.includes(".") && !issue.path.includes("[")
  })

  if (hasTopLevelShapeIssues) {
    return "retry_ai_generation"
  }

  return "manual_fix_required"
}

export const buildP5aRecommendedActions = (
  decision: P5aHandoffDecision,
  taskInputIssues: P5aTaskInputValidationIssue[],
  schemaIssues: Array<{ path: string; message: string }>,
): string[] => {
  switch (decision) {
    case "ready_for_generator":
      return [
        "Handoff is ready. Continue with generator using --schema-file.",
        "Keep the validated schema file as the canonical replay input.",
      ]
    case "rollback_to_template":
      return [
        "Go back to the P5A input template and fill all required sections before asking AI for schema output again.",
        ...taskInputIssues.map(
          (issue) => `Fix missing task input section: ${issue.section}`,
        ),
      ]
    case "retry_ai_generation":
      return [
        "Task input is present, but the AI output does not satisfy the top-level ModuleSchema shape. Retry AI generation with the same template.",
        ...schemaIssues.map(
          (issue) =>
            `Top-level schema issue: ${issue.path} -> ${issue.message}`,
        ),
      ]
    case "manual_fix_required":
      return [
        "Schema shape is close enough for manual takeover. Edit the schema JSON and replay the handoff check.",
        "After fixing the reported issues, rerun p5a:handoff:replay with --generate to continue into generator.",
        ...schemaIssues.map(
          (issue) => `Manual fix target: ${issue.path} -> ${issue.message}`,
        ),
      ]
  }
}

export const renderP5aSummaryMarkdown = (report: P5aHandoffReport) =>
  [
    "# P5A Schema Handoff Summary",
    "",
    `- status: ${report.status}`,
    `- decision: ${report.decision}`,
    `- inputFilePath: ${report.inputFilePath}`,
    `- schemaFilePath: ${report.schemaFilePath}`,
    `- taskInputIssueCount: ${report.taskInputIssues.length}`,
    `- schemaIssueCount: ${report.schemaIssues.length}`,
    "",
    "## Recommended Actions",
    ...report.recommendedActions.map((action) => `- ${action}`),
  ].join("\n")

export const renderP5aHandoffStepSummaryMarkdown = (
  report: P5aHandoffReport,
) => {
  const lines = [
    "### P5A Schema Handoff",
    "",
    `- status: \`${report.status}\``,
    `- decision: \`${report.decision}\``,
    `- taskInputIssueCount: \`${String(report.taskInputIssues.length)}\``,
    `- schemaIssueCount: \`${String(report.schemaIssues.length)}\``,
    `- inputFilePath: \`${report.inputFilePath}\``,
    `- schemaFilePath: \`${report.schemaFilePath}\``,
    "",
  ]

  if (report.status === "passed") {
    lines.push("Handoff passed and is ready for generator.", "")
    return `${lines.join("\n")}\n`
  }

  lines.push("Recommended actions:")
  lines.push(...report.recommendedActions.map((action) => `- ${action}`))
  lines.push("")

  return `${lines.join("\n")}\n`
}

export const buildP5aHandoffGitHubOutputLines = (report: P5aHandoffReport) => [
  `p5a_handoff_status=${report.status}`,
  `p5a_handoff_decision=${report.decision}`,
  `p5a_handoff_task_input_issue_count=${String(report.taskInputIssues.length)}`,
  `p5a_handoff_schema_issue_count=${String(report.schemaIssues.length)}`,
]

export const generateP5aHandoffReport = async (
  inputFilePath: string,
  schemaFilePath: string,
  reportDir = resolveP5aReportDir(),
): Promise<P5aHandoffReport> => {
  const resolvedInputFilePath = resolve(inputFilePath)
  const resolvedSchemaFilePath = resolve(schemaFilePath)
  const inputContents = await readFile(resolvedInputFilePath, "utf8")
  const schemaRaw = await readFile(resolvedSchemaFilePath, "utf8")
  const taskInputIssues = validateTaskInputTemplate(inputContents)
  const schemaIssues = (() => {
    try {
      const parsedSchema = JSON.parse(
        schemaRaw.replace(/^\uFEFF/, ""),
      ) as unknown
      return validateModuleSchema(parsedSchema)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      return [
        {
          path: "$",
          message: `Schema file is not valid JSON: ${message}`,
        },
      ]
    }
  })()
  const decision = decideP5aHandoff(taskInputIssues, schemaIssues)
  const status: P5aHandoffStatus =
    decision === "ready_for_generator" ? "passed" : "failed"

  return {
    generatedAt: new Date().toISOString(),
    inputFilePath: resolvedInputFilePath,
    schemaFilePath: resolvedSchemaFilePath,
    reportDir: resolve(reportDir),
    status,
    decision,
    taskInputIssues,
    schemaIssues,
    recommendedActions: buildP5aRecommendedActions(
      decision,
      taskInputIssues,
      schemaIssues,
    ),
  }
}

export const writeP5aHandoffReport = async (report: P5aHandoffReport) => {
  const outputDir = report.reportDir
  const jsonPath = join(outputDir, "p5a-schema-handoff-report.json")
  const markdownPath = join(outputDir, "p5a-schema-handoff-summary.md")

  await mkdir(outputDir, { recursive: true })
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8")
  await writeFile(markdownPath, renderP5aSummaryMarkdown(report), "utf8")

  return {
    jsonPath,
    markdownPath,
  }
}

export const publishP5aHandoffGitHubSummary = async (
  report: P5aHandoffReport,
) => {
  const summaryPath = resolveSummaryPath()

  if (!summaryPath) {
    return null
  }

  await appendFile(
    summaryPath,
    renderP5aHandoffStepSummaryMarkdown(report),
    "utf8",
  )

  return summaryPath
}

export const publishP5aHandoffGitHubOutput = async (
  report: P5aHandoffReport,
) => {
  const outputPath = resolveGitHubOutputPath()

  if (!outputPath) {
    return null
  }

  await appendFile(
    outputPath,
    `${buildP5aHandoffGitHubOutputLines(report).join("\n")}\n`,
    "utf8",
  )

  return outputPath
}
