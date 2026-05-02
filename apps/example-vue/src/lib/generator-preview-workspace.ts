import type { GeneratorPreviewReportFile } from "./platform-api"

export interface GeneratorPreviewFileCard
  extends Pick<
    GeneratorPreviewReportFile,
    | "absolutePath"
    | "contents"
    | "currentContents"
    | "exists"
    | "hasChanges"
    | "isManaged"
    | "mergeStrategy"
    | "path"
    | "plannedAction"
    | "plannedReason"
    | "reason"
  > {
  charCount: number
  diffLines: GeneratorPreviewDiffLine[]
  diffStats: GeneratorPreviewFileDiffStats
  lineCount: number
}

export interface GeneratorPreviewDiffLine {
  kind: "added" | "removed" | "unchanged"
  newLineNumber: number | null
  oldLineNumber: number | null
  value: string
}

export interface GeneratorPreviewFileDiffStats {
  addedLineCount: number
  changedLineCount: number
  removedLineCount: number
  unchangedLineCount: number
}

const normalizeQuery = (value: string) => value.trim().toLowerCase()

const splitLines = (value: string) => value.split(/\r?\n/)

const generatorPreviewActionPriority: Record<
  GeneratorPreviewFileCard["plannedAction"],
  number
> = {
  block: 0,
  overwrite: 1,
  create: 2,
  skip: 3,
}

const buildLcsMatrix = (left: string[], right: string[]) => {
  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array.from<number>({ length: right.length + 1 }).fill(0),
  )

  for (let leftIndex = left.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = right.length - 1; rightIndex >= 0; rightIndex -= 1) {
      if (left[leftIndex] === right[rightIndex]) {
        matrix[leftIndex]![rightIndex] =
          (matrix[leftIndex + 1]?.[rightIndex + 1] ?? 0) + 1
        continue
      }

      matrix[leftIndex]![rightIndex] = Math.max(
        matrix[leftIndex + 1]?.[rightIndex] ?? 0,
        matrix[leftIndex]?.[rightIndex + 1] ?? 0,
      )
    }
  }

  return matrix
}

const buildGeneratorPreviewDiffLines = (
  currentContents: string | null,
  nextContents: string,
): GeneratorPreviewDiffLine[] => {
  const previousLines = currentContents === null ? [] : splitLines(currentContents)
  const nextLines = splitLines(nextContents)
  const lcsMatrix = buildLcsMatrix(previousLines, nextLines)
  const diffLines: GeneratorPreviewDiffLine[] = []
  let previousIndex = 0
  let nextIndex = 0
  let oldLineNumber = 1
  let newLineNumber = 1

  while (
    previousIndex < previousLines.length &&
    nextIndex < nextLines.length
  ) {
    const previousLine = previousLines[previousIndex]
    const nextLine = nextLines[nextIndex]

    if (previousLine === nextLine) {
      diffLines.push({
        kind: "unchanged",
        oldLineNumber,
        newLineNumber,
        value: previousLine ?? "",
      })
      previousIndex += 1
      nextIndex += 1
      oldLineNumber += 1
      newLineNumber += 1
      continue
    }

    const keepPrevious =
      (lcsMatrix[previousIndex + 1]?.[nextIndex] ?? 0) >=
      (lcsMatrix[previousIndex]?.[nextIndex + 1] ?? 0)

    if (keepPrevious) {
      diffLines.push({
        kind: "removed",
        oldLineNumber,
        newLineNumber: null,
        value: previousLine ?? "",
      })
      previousIndex += 1
      oldLineNumber += 1
      continue
    }

    diffLines.push({
      kind: "added",
      oldLineNumber: null,
      newLineNumber,
      value: nextLine ?? "",
    })
    nextIndex += 1
    newLineNumber += 1
  }

  while (previousIndex < previousLines.length) {
    diffLines.push({
      kind: "removed",
      oldLineNumber,
      newLineNumber: null,
      value: previousLines[previousIndex] ?? "",
    })
    previousIndex += 1
    oldLineNumber += 1
  }

  while (nextIndex < nextLines.length) {
    diffLines.push({
      kind: "added",
      oldLineNumber: null,
      newLineNumber,
      value: nextLines[nextIndex] ?? "",
    })
    nextIndex += 1
    newLineNumber += 1
  }

  return diffLines
}

const buildGeneratorPreviewDiffStats = (
  diffLines: GeneratorPreviewDiffLine[],
): GeneratorPreviewFileDiffStats => {
  const addedLineCount = diffLines.filter((line) => line.kind === "added").length
  const removedLineCount = diffLines.filter(
    (line) => line.kind === "removed",
  ).length
  const unchangedLineCount = diffLines.filter(
    (line) => line.kind === "unchanged",
  ).length

  return {
    addedLineCount,
    changedLineCount: addedLineCount + removedLineCount,
    removedLineCount,
    unchangedLineCount,
  }
}

export const toGeneratorPreviewFileCard = (
  file: GeneratorPreviewReportFile,
): GeneratorPreviewFileCard => {
  const diffLines = buildGeneratorPreviewDiffLines(
    file.currentContents,
    file.contents,
  )

  return {
    ...file,
    charCount: file.contents.length,
    diffLines,
    diffStats: buildGeneratorPreviewDiffStats(diffLines),
    lineCount: file.contents.split(/\r?\n/).length,
  }
}

export const filterGeneratorPreviewFiles = (
  files: GeneratorPreviewFileCard[],
  query: string,
) => {
  const normalizedQuery = normalizeQuery(query)

  return files
    .map((file, index) => ({ file, index }))
    .filter(({ file }) => {
      if (!normalizedQuery) {
        return true
      }

      const haystacks = [
        file.absolutePath,
        file.path,
        file.reason,
        file.plannedAction,
        file.plannedReason,
        file.mergeStrategy,
        file.contents,
        file.currentContents ?? "",
      ].map((value) => value.toLowerCase())

      return haystacks.some((value) => value.includes(normalizedQuery))
    })
    .sort((left, right) => {
      const priorityDelta =
        generatorPreviewActionPriority[left.file.plannedAction] -
        generatorPreviewActionPriority[right.file.plannedAction]

      if (priorityDelta !== 0) {
        return priorityDelta
      }

      return left.index - right.index
    })
    .map(({ file }) => file)
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

  const prioritizedFallback =
    files.find((file) => file.plannedAction === "block") ??
    files.find((file) => file.plannedAction === "overwrite") ??
    files.find((file) => file.plannedAction === "create") ??
    files[0]

  return prioritizedFallback?.path ?? null
}

export const shouldSelectGeneratorPreviewFile = (
  selectedPath: string | null,
  nextPath: string,
) => {
  return nextPath.trim().length > 0 && selectedPath !== nextPath
}
