export interface GeneratorPreviewClipboard {
  writeText(value: string): Promise<void> | void
}

type NavigatorWithClipboard = {
  clipboard?: GeneratorPreviewClipboard
}

export type GeneratorPreviewPreferredSqlView = "proposal" | "handoff"

const resolveDefaultClipboard = () =>
  (globalThis.navigator as NavigatorWithClipboard | undefined)?.clipboard

export const joinGeneratorPreviewSuggestedCommands = (commands: string[]) =>
  commands
    .map((command) => command.trim())
    .filter((command) => command.length > 0)
    .join("\n")

export const resolveGeneratorPreviewPreferredSqlView = (input: {
  hasApplyEvidence: boolean
  hasSqlProposal: boolean
  pendingManualIntegrationStepCount: number
}): GeneratorPreviewPreferredSqlView => {
  if (input.hasApplyEvidence && input.pendingManualIntegrationStepCount > 0) {
    return "handoff"
  }

  if (input.hasSqlProposal) {
    return "proposal"
  }

  return "handoff"
}

export const copyGeneratorPreviewText = async (
  value: string,
  clipboard: GeneratorPreviewClipboard | undefined = resolveDefaultClipboard(),
) => {
  if (!clipboard || value.trim().length === 0) {
    return false
  }

  try {
    await clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export const copyGeneratorPreviewSuggestedCommands = async (
  commands: string[],
  clipboard: GeneratorPreviewClipboard | undefined = resolveDefaultClipboard(),
) =>
  copyGeneratorPreviewText(
    joinGeneratorPreviewSuggestedCommands(commands),
    clipboard,
  )
