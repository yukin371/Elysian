import { readFileSync } from "node:fs"

type PullRequestPayload = {
  pull_request?: {
    title?: string
    body?: string | null
  }
}

const titlePattern =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,80}$/
const watermarkPattern =
  /(Co-Authored-By:|Generated with .*(Claude|Anthropic|Copilot|Cursor|Windsurf|Codex)|>\s*\*\*For (Claude|Codex|Copilot|Cursor|Windsurf):\*\*)/

const requiredSections = ["## Summary", "## Validation", "## Risk"]
const requiredFields = [
  "变更目标",
  "关键改动",
  "边界说明",
  "风险点",
  "回滚方式",
]
const requiredValidationItems = [
  "- [ ] `bun run check`",
  "- [ ] `bun run build:vue`",
  "- [ ] 文档已同步或确认无需同步",
]

const eventPath = process.env.GITHUB_EVENT_PATH

if (!eventPath) {
  console.error("[pr-check] 缺少 GITHUB_EVENT_PATH")
  process.exit(1)
}

const payload = JSON.parse(
  readFileSync(eventPath, "utf8").replace(/^\uFEFF/, ""),
) as PullRequestPayload

const title = payload.pull_request?.title?.trim() ?? ""
const body = payload.pull_request?.body?.replace(/\r\n/g, "\n") ?? ""

const failures: string[] = []

if (!titlePattern.test(title)) {
  failures.push(
    "PR 标题必须遵循 Conventional Commits，例如 feat(scope): description",
  )
}

if (!body.trim()) {
  failures.push("PR 描述不能为空，必须使用仓库模板")
}

if (watermarkPattern.test(title) || watermarkPattern.test(body)) {
  failures.push("PR 标题或描述包含协作者标识/水印，请移除")
}

for (const section of requiredSections) {
  if (!body.includes(section)) {
    failures.push(`PR 描述缺少必填区块: ${section}`)
  }
}

for (const field of requiredFields) {
  const match = body.match(new RegExp(`^- ${field}：\\s*(.+)$`, "m"))
  if (!match || !match[1].trim()) {
    failures.push(`PR 描述缺少已填写字段: ${field}`)
  }
}

for (const item of requiredValidationItems) {
  if (!body.includes(item)) {
    failures.push(`PR 描述缺少校验项: ${item}`)
  }
}

if (failures.length > 0) {
  console.error("[pr-check] PR 格式校验失败:")
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log("[pr-check] PR 格式校验通过")
