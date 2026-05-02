export const joinGeneratorPreviewSuggestedCommands = (commands: string[]) =>
  commands
    .map((command) => command.trim())
    .filter((command) => command.length > 0)
    .join("\n")

export const copyGeneratorPreviewText = async (
  value: string,
  clipboard: Pick<Clipboard, "writeText"> | undefined =
    globalThis.navigator?.clipboard,
) => {
  if (!clipboard || value.trim().length === 0) {
    return false
  }

  await clipboard.writeText(value)
  return true
}

export const copyGeneratorPreviewSuggestedCommands = async (
  commands: string[],
  clipboard: Pick<Clipboard, "writeText"> | undefined =
    globalThis.navigator?.clipboard,
) =>
  copyGeneratorPreviewText(
    joinGeneratorPreviewSuggestedCommands(commands),
    clipboard,
  )
