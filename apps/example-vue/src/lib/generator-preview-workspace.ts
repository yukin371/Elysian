import type { RenderedModuleFile } from "./generator-preview-browser"

export interface GeneratorPreviewFileCard extends RenderedModuleFile {
  charCount: number
  lineCount: number
}

const normalizeQuery = (value: string) => value.trim().toLowerCase()

export const toGeneratorPreviewFileCard = (
  file: RenderedModuleFile,
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
      file.path,
      file.reason,
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
