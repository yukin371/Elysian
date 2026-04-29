interface BrowserDownloadAnchor {
  href: string
  download: string
  click: () => void
}

interface BrowserDownloadDocument {
  createElement: (tagName: "a") => BrowserDownloadAnchor
}

interface BrowserDownloadUrlApi {
  createObjectURL: (blob: Blob) => string
  revokeObjectURL: (url: string) => void
}

const browserGlobal = globalThis as typeof globalThis & {
  document?: BrowserDownloadDocument
  URL?: BrowserDownloadUrlApi
}

export const downloadBrowserBlob = (blob: Blob, filename: string) => {
  const browserDocument = browserGlobal.document
  const browserUrl = browserGlobal.URL

  if (!browserDocument || !browserUrl) {
    throw new Error("Browser download is unavailable in current runtime")
  }

  const objectUrl = browserUrl.createObjectURL(blob)

  try {
    const anchor = browserDocument.createElement("a")
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
  } finally {
    browserUrl.revokeObjectURL(objectUrl)
  }
}
