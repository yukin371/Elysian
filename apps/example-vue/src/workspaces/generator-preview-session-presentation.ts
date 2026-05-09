import type { GeneratorPreviewSessionRecord } from "../lib/platform-api"

import { generatorPreviewSessionStatusPriority } from "./generator-preview-session-helpers"

type Translate = (key: string, params?: Record<string, unknown>) => string

export const localizeGeneratorPreviewSessionStatus = (
  t: Translate,
  status: GeneratorPreviewSessionRecord["status"],
) => {
  if (status === "applied") {
    return t("app.generatorPreview.status.applied")
  }

  if (status === "ready") {
    return t("app.generatorPreview.status.ready")
  }

  if (status === "rejected") {
    return t("app.generatorPreview.status.rejected")
  }

  return t("app.generatorPreview.status.pendingReview")
}

export const prioritizeGeneratorPreviewRecentSessions = (
  sessions: GeneratorPreviewSessionRecord[],
  isMatchingSelection: (session: GeneratorPreviewSessionRecord) => boolean,
) => {
  const matchingSelection: Array<{
    index: number
    session: GeneratorPreviewSessionRecord
  }> = []
  const otherSessions: Array<{
    index: number
    session: GeneratorPreviewSessionRecord
  }> = []

  for (const [index, session] of sessions.entries()) {
    if (isMatchingSelection(session)) {
      matchingSelection.push({ index, session })
      continue
    }

    otherSessions.push({ index, session })
  }

  const sortByReviewPriority = (
    left: { index: number; session: GeneratorPreviewSessionRecord },
    right: { index: number; session: GeneratorPreviewSessionRecord },
  ) => {
    const statusPriorityDelta =
      generatorPreviewSessionStatusPriority[left.session.status] -
      generatorPreviewSessionStatusPriority[right.session.status]

    if (statusPriorityDelta !== 0) {
      return statusPriorityDelta
    }

    return left.index - right.index
  }

  return [
    ...matchingSelection.sort(sortByReviewPriority),
    ...otherSessions,
  ].map(({ session }) => session)
}

export const buildGeneratorPreviewRecentSessionOptions = (
  t: Translate,
  sessions: GeneratorPreviewSessionRecord[],
  isMatchingSelection: (session: GeneratorPreviewSessionRecord) => boolean,
) =>
  prioritizeGeneratorPreviewRecentSessions(sessions, isMatchingSelection)
    .slice(0, 8)
    .map((session) => ({
      label: [
        session.schemaName,
        session.frontendTarget,
        localizeGeneratorPreviewSessionStatus(t, session.status),
        session.createdAt.slice(5, 16).replace("T", " "),
      ].join(" · "),
      value: session.id,
    }))

export const buildGeneratorPreviewConflictStrategyOptions = (t: Translate) => [
  {
    label: t("app.generatorPreview.conflictStrategy.skip"),
    value: "skip",
  },
  {
    label: t("app.generatorPreview.conflictStrategy.overwrite"),
    value: "overwrite",
  },
  {
    label: t("app.generatorPreview.conflictStrategy.overwrite-generated-only"),
    value: "overwrite-generated-only",
  },
  {
    label: t("app.generatorPreview.conflictStrategy.fail"),
    value: "fail",
  },
]
