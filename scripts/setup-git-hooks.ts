import { execFileSync } from "node:child_process"
import { chmodSync, existsSync } from "node:fs"
import { join, resolve } from "node:path"

const repoRoot = resolve(process.cwd())
const gitPath = join(repoRoot, ".git")

if (!existsSync(gitPath)) {
  console.log("[hooks] skip: .git 不存在，未安装 hooks")
  process.exit(0)
}

const ensureExecutable = (filePath: string) => {
  if (!existsSync(filePath)) {
    return
  }

  chmodSync(filePath, 0o755)
}

try {
  const topLevel = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim()

  if (resolve(topLevel) !== repoRoot) {
    console.log(`[hooks] skip: 当前目录不是仓库根目录 (${topLevel})`)
    process.exit(0)
  }

  execFileSync("git", ["config", "--local", "core.hooksPath", ".githooks"], {
    cwd: repoRoot,
    stdio: "ignore",
  })

  for (const hookName of ["pre-commit", "commit-msg", "pre-push"]) {
    ensureExecutable(join(repoRoot, ".githooks", hookName))
  }

  console.log("[hooks] 已安装 .githooks 并设置为 core.hooksPath")
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[hooks] 安装失败: ${message}`)
  process.exit(1)
}
