import type { GeneratorPreviewReportFile } from "./platform-api"

export interface GeneratorPreviewFileCard
  extends Pick<
    GeneratorPreviewReportFile,
    | "absolutePath"
    | "contents"
    | "currentContents"
    | "exists"
    | "hasChanges"
    | "mergeStrategy"
    | "path"
    | "plannedAction"
    | "plannedReason"
    | "reason"
  > {
  charCount: number
  lineCount: number
}

const normalizeQuery = (value: string) => value.trim().toLowerCase()

export const toGeneratorPreviewFileCard = (
  file: GeneratorPreviewReportFile,
): GeneratorPreviewFileCard => ({
  ...file,
  charCount: file.contents.length,
  lineCount: file.contents.split(/\r?\n/).length,
})

export const filterGeneratorPreviewFiles = (
  files: GeneratorPreviewFileCard[],
  query: string,
) => {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return files
  }

  return files.filter((file) => {
    const haystacks = [
      file.absolutePath,
      file.path,
      file.reason,
      file.plannedAction,
      file.plannedReason,
      file.mergeStrategy,
      file.contents,
    ].map((value) => value.toLowerCase())

    return haystacks.some((value) => value.includes(normalizedQuery))
  })
}

export const resolveGeneratorPreviewSelection = (
  files: GeneratorPreviewFileCard[],
  selectedPath: string | null,
) => {
  if (files.length === 0) {
    return null
  }

  if (selectedPath && files.some((file) => file.path === selectedPath)) {
    return selectedPath
  }

  return files[0]?.path ?? null
}
