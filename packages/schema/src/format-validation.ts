import type { ModuleSchemaValidationIssue } from "./index"

const getIssueSuggestion = (
  issue: ModuleSchemaValidationIssue,
): string | null => {
  if (issue.message.includes('must contain exactly one "id" field')) {
    return 'Suggestion: Add a field with key "id" and kind "id", and set required=true.'
  }

  if (
    issue.message.includes(
      "Enum field must provide non-empty options or dictionaryTypeCode.",
    )
  ) {
    return "Suggestion: Add 'options' array or 'dictionaryTypeCode' for the enum field."
  }

  if (issue.message.startsWith("Field kind must be one of:")) {
    return "Suggestion: Supported kinds: id, string, text, number, boolean, enum, json, datetime."
  }

  return null
}

export function formatValidationIssues(
  issues: ModuleSchemaValidationIssue[],
): string {
  if (issues.length === 0) {
    return "No issues found. Schema is valid."
  }

  const header = `Schema validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:`
  const lines = issues.flatMap((issue) => {
    const suggestion = getIssueSuggestion(issue)

    return suggestion
      ? [`- ${issue.path}: ${issue.message}`, `  ${suggestion}`]
      : [`- ${issue.path}: ${issue.message}`]
  })

  return [header, ...lines].join("\n")
}
