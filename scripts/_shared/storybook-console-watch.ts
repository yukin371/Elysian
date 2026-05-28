import type { ConsoleMessage, Page } from "playwright"

export interface StorybookConsoleIssue {
  location?: string
  text: string
  type: "error" | "pageerror" | "warning"
}

export const countStorybookConsoleIssues = (
  scenarioResults: Array<{ consoleIssues?: StorybookConsoleIssue[] }>,
) =>
  scenarioResults.reduce(
    (total, scenario) => total + (scenario.consoleIssues?.length ?? 0),
    0,
  )

const formatConsoleLocation = (message: ConsoleMessage) => {
  const location = message.location()

  if (!location.url) {
    return undefined
  }

  const line = location.lineNumber ? `:${location.lineNumber}` : ""
  const column = location.columnNumber ? `:${location.columnNumber}` : ""
  return `${location.url}${line}${column}`
}

const formatConsoleIssue = (issue: StorybookConsoleIssue) =>
  issue.location
    ? `${issue.type}: ${issue.text} (${issue.location})`
    : `${issue.type}: ${issue.text}`

const shouldIgnoreConsoleMessage = (message: ConsoleMessage) => {
  const location = formatConsoleLocation(message) ?? ""
  const text = message.text()

  return (
    text.includes("Failed to load resource") && location.includes("favicon.ico")
  )
}

export const createStorybookConsoleWatcher = (page: Page) => {
  const issues: StorybookConsoleIssue[] = []

  page.on("console", (message) => {
    const type = message.type()

    if (type !== "error" && type !== "warning") {
      return
    }

    if (shouldIgnoreConsoleMessage(message)) {
      return
    }

    issues.push({
      location: formatConsoleLocation(message),
      text: message.text(),
      type: type === "warning" ? "warning" : "error",
    })
  })

  page.on("pageerror", (error) => {
    issues.push({
      text: error instanceof Error ? error.message : String(error),
      type: "pageerror",
    })
  })

  return {
    clear() {
      issues.length = 0
    },
    read() {
      return [...issues]
    },
  }
}

export const assertNoStorybookConsoleIssues = (
  issues: StorybookConsoleIssue[],
) => {
  if (issues.length === 0) {
    return
  }

  throw new Error(
    `Storybook iframe emitted console warnings/errors:\n${issues
      .map(formatConsoleIssue)
      .join("\n")}`,
  )
}
