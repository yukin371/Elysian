export interface GeneratorPreviewFrontendImpact {
  moduleCode: string | null
  permissionCodes: string[]
  permissionPrefix: string | null
  routePath: string | null
  surfaceKind: string | null
}

const readStringProperty = (contents: string, property: string) => {
  const pattern = new RegExp(`${property}:\\s*"([^"]+)"`)
  return pattern.exec(contents)?.[1] ?? null
}

const readPermissions = (contents: string) => {
  const permissionsBlock = /permissions:\s*\{(?<body>[\s\S]*?)\},/u.exec(
    contents,
  )?.groups?.body

  if (!permissionsBlock) {
    return []
  }

  return Array.from(permissionsBlock.matchAll(/"[^"]+":\s*"([^"]+)"/gu))
    .map((match) => match[1])
    .filter((value): value is string => typeof value === "string")
}

export const resolveGeneratorPreviewFrontendImpact = (
  path: string | null | undefined,
  contents: string | null | undefined,
): GeneratorPreviewFrontendImpact | null => {
  if (!path?.endsWith(".frontend.ts") || !contents) {
    return null
  }

  const impact: GeneratorPreviewFrontendImpact = {
    moduleCode: readStringProperty(contents, "moduleCode"),
    permissionCodes: readPermissions(contents),
    permissionPrefix: readStringProperty(contents, "permissionPrefix"),
    routePath: readStringProperty(contents, "routePath"),
    surfaceKind: readStringProperty(contents, "surfaceKind"),
  }

  if (
    !impact.moduleCode &&
    !impact.permissionPrefix &&
    !impact.routePath &&
    impact.permissionCodes.length === 0
  ) {
    return null
  }

  return impact
}
