export const platformManifest = {
  name: "elysian",
  displayName: "Elysian",
  version: "0.1.0",
  runtime: "bun-first",
  status: "bootstrap",
} as const

export type PlatformManifest = typeof platformManifest
