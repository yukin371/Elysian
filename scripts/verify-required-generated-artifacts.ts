import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"

type RequiredGeneratedArtifact = {
  path: string
  owner: string
}

type ValidationDependencies = {
  exists: (path: string) => boolean
  isGitTracked: (path: string) => boolean
  isGitIgnored: (path: string) => boolean
}

export const requiredGeneratedArtifacts: RequiredGeneratedArtifact[] = [
  {
    path: "apps/example-vue/src/app/workspace-registry/generated/index.ts",
    owner: "apps/example-vue workspace registry",
  },
  {
    path: "apps/example-vue/src/lib/platform-api/generated/openapi-types.d.ts",
    owner: "apps/example-vue platform API types",
  },
  {
    path: "apps/example-vue/src/modules/generated/index.ts",
    owner: "apps/example-vue standard CRUD surfaces",
  },
]

const gitCommandSucceeded = (args: string[]) =>
  spawnSync("git", args, {
    stdio: "ignore",
  }).status === 0

const defaultDependencies: ValidationDependencies = {
  exists: (path) => existsSync(path),
  isGitTracked: (path) =>
    gitCommandSucceeded(["ls-files", "--error-unmatch", path]),
  isGitIgnored: (path) => gitCommandSucceeded(["check-ignore", "-q", path]),
}

export const validateRequiredGeneratedArtifacts = (
  artifacts: RequiredGeneratedArtifact[] = requiredGeneratedArtifacts,
  dependencies: ValidationDependencies = defaultDependencies,
) =>
  artifacts.flatMap((artifact) => {
    const issues: string[] = []

    if (!dependencies.exists(artifact.path)) {
      issues.push("文件不存在")
    }

    if (dependencies.isGitIgnored(artifact.path)) {
      issues.push("仍被 .gitignore 忽略")
    }

    if (!dependencies.isGitTracked(artifact.path)) {
      issues.push("未被 Git 跟踪")
    }

    if (issues.length === 0) {
      return []
    }

    return [
      `关键 generated 产物异常: ${artifact.path}（owner: ${artifact.owner}；${issues.join("，")}）`,
    ]
  })

export const run = () => {
  const failures = validateRequiredGeneratedArtifacts()

  if (failures.length > 0) {
    console.error("[verify-required-generated-artifacts] 校验失败:")
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }

  console.log("[verify-required-generated-artifacts] 校验通过")
}

if (import.meta.main) {
  run()
}
