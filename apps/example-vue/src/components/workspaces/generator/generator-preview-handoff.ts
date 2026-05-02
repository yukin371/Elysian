export const joinGeneratorPreviewSuggestedCommands = (commands: string[]) =>
  commands.join("\n")

export const copyGeneratorPreviewSuggestedCommands = async (
  commands: string[],
  clipboard: Pick<Clipboard, "writeText"> | undefined =
    globalThis.navigator?.clipboard,
) => {
  if (!clipboard || commands.length === 0) {
    return false
  }

  await clipboard.writeText(joinGeneratorPreviewSuggestedCommands(commands))
  return true
}
