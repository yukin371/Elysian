const GENERATOR_PREVIEW_REVIEW_DRAFTS_STORAGE_KEY =
  "elysian.example-vue.generator-preview.review-drafts"

type GeneratorPreviewReviewDrafts = Record<string, string>

const loadGeneratorPreviewReviewDrafts = (): GeneratorPreviewReviewDrafts => {
  const storage = globalThis.localStorage

  if (!storage) {
    return {}
  }

  try {
    const raw = storage.getItem(GENERATOR_PREVIEW_REVIEW_DRAFTS_STORAGE_KEY)

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    )
  } catch {
    return {}
  }
}

const persistGeneratorPreviewReviewDrafts = (
  drafts: GeneratorPreviewReviewDrafts,
) => {
  const storage = globalThis.localStorage

  if (!storage) {
    return
  }

  try {
    if (Object.keys(drafts).length === 0) {
      storage.removeItem(GENERATOR_PREVIEW_REVIEW_DRAFTS_STORAGE_KEY)
      return
    }

    storage.setItem(
      GENERATOR_PREVIEW_REVIEW_DRAFTS_STORAGE_KEY,
      JSON.stringify(drafts),
    )
  } catch {
    // Draft storage is best-effort; review actions must not depend on it.
  }
}

export const loadGeneratorPreviewReviewDraft = (sessionId: string) =>
  loadGeneratorPreviewReviewDrafts()[sessionId] ?? null

export const persistGeneratorPreviewReviewDraft = (
  sessionId: string,
  value: string,
) => {
  if (!sessionId) {
    return
  }

  const drafts = loadGeneratorPreviewReviewDrafts()

  if (value.trim().length === 0) {
    delete drafts[sessionId]
    persistGeneratorPreviewReviewDrafts(drafts)
    return
  }

  drafts[sessionId] = value
  persistGeneratorPreviewReviewDrafts(drafts)
}

export const clearGeneratorPreviewReviewDraft = (sessionId: string) => {
  if (!sessionId) {
    return
  }

  const drafts = loadGeneratorPreviewReviewDrafts()

  if (!(sessionId in drafts)) {
    return
  }

  delete drafts[sessionId]
  persistGeneratorPreviewReviewDrafts(drafts)
}
