import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"

interface TenantWorkflowRun {
  databaseId: number
  status: string
  conclusion: string | null
  event: string
  headBranch: string
  createdAt: string
  displayTitle: string
}

interface TenantStabilityDownloadItem {
  runId: number
  event: string
  conclusion: string | null
  headBranch: string
  createdAt: string
  outputDir: string
}

interface TenantStabilityDownloadSkippedItem {
  runId: number
  reason: string
}

interface TenantStabilityDownloadReport {
  generatedAt: string
  repository: string
  workflow: string
  branch: string
  artifactName: string
  requestedRuns: number
  scanLimit: number
  scannedRuns: number
  downloadedCount: number
  outputDir: string
  events: string[]
  items: TenantStabilityDownloadItem[]
  skipped: TenantStabilityDownloadSkippedItem[]
}

interface TenantStabilityDownloadConfig {
  repository: string
  workflow: string
  branch: string
  artifactName: string
  requestedRuns: number
  scanLimit: number
  outputDir: string
  events: string[]
}

interface CommandRunner {
  run(command: string, args: string[]): Promise<string>
}

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const readNonEmptyEnv = (key: string) => {
  const value = process.env[key]
  return value && value.trim().length > 0 ? value.trim() : null
}

const parsePositiveInt = (value: string, label: string) => {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}: ${value}`)
  }
  return parsed
}

const defaultOutputDir = () =>
  join(process.cwd(), "artifacts", "downloads", "tenant")

export const parseGitHubRepositoryFromRemoteUrl = (remoteUrl: string) => {
  const trimmed = remoteUrl.trim()
  const httpsMatch = trimmed.match(
    /^https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/,
  )
  if (httpsMatch) {
    return `${httpsMatch[1]}/${httpsMatch[2]}`
  }

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/)
  if (sshMatch) {
    return `${sshMatch[1]}/${sshMatch[2]}`
  }

  return null
}

export const parseDownloadCliArgs = (argv: string[]) => {
  const args = {
    repository: null as string | null,
    workflow: null as string | null,
    branch: null as string | null,
    artifactName: null as string | null,
    requestedRuns: null as number | null,
    scanLimit: null as number | null,
    outputDir: null as string | null,
    events: [] as string[],
  }

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]
    const next = argv[index + 1]

    if (current === "--repo") {
      assert(next, "Missing value for --repo")
      args.repository = next
      index += 1
      continue
    }
    if (current === "--workflow") {
      assert(next, "Missing value for --workflow")
      args.workflow = next
      index += 1
      continue
    }
    if (current === "--branch") {
      assert(next, "Missing value for --branch")
      args.branch = next
      index += 1
      continue
    }
    if (current === "--artifact-name") {
      assert(next, "Missing value for --artifact-name")
      args.artifactName = next
      index += 1
      continue
    }
    if (current === "--limit") {
      assert(next, "Missing value for --limit")
      args.requestedRuns = parsePositiveInt(next, "--limit")
      index += 1
      continue
    }
    if (current === "--scan-limit") {
      assert(next, "Missing value for --scan-limit")
      args.scanLimit = parsePositiveInt(next, "--scan-limit")
      index += 1
      continue
    }
    if (current === "--output-dir") {
      assert(next, "Missing value for --output-dir")
      args.outputDir = next
      index += 1
      continue
    }
    if (current === "--event") {
      assert(next, "Missing value for --event")
      args.events.push(next)
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return args
}

export const selectRunsForDownload = (
  runs: TenantWorkflowRun[],
  options: {
    scanLimit: number
    events: string[]
  },
) => {
  const allowedEvents = new Set(options.events)
  const selected: TenantWorkflowRun[] = []

  for (const run of runs) {
    if (run.status !== "completed") {
      continue
    }
    if (allowedEvents.size > 0 && !allowedEvents.has(run.event)) {
      continue
    }
    selected.push(run)
    if (selected.length >= options.scanLimit) {
      break
    }
  }

  return selected
}

const defaultRunner: CommandRunner = {
  async run(command, args) {
    const child = Bun.spawn([command, ...args], {
      cwd: process.cwd(),
      env: process.env,
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ])

    if (exitCode !== 0) {
      throw new Error(
        `Command failed (${command} ${args.join(" ")}): ${stderr.trim() || stdout.trim() || `exit=${String(exitCode)}`}`,
      )
    }

    return stdout.trim()
  },
}

const resolveRepository = async (runner: CommandRunner) => {
  const explicit = readNonEmptyEnv(
    "ELYSIAN_TENANT_STABILITY_DOWNLOAD_REPOSITORY",
  )
  if (explicit) {
    return explicit
  }

  const fromGithubEnv = readNonEmptyEnv("GITHUB_REPOSITORY")
  if (fromGithubEnv) {
    return fromGithubEnv
  }

  const remoteUrl = await runner.run("git", [
    "config",
    "--get",
    "remote.origin.url",
  ])
  const parsed = parseGitHubRepositoryFromRemoteUrl(remoteUrl)
  if (parsed) {
    return parsed
  }

  throw new Error("Unable to resolve GitHub repository from remote.origin.url")
}

const resolveBranch = async (runner: CommandRunner) => {
  const explicit = readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_DOWNLOAD_BRANCH")
  if (explicit) {
    return explicit
  }

  const branch = await runner.run("git", ["rev-parse", "--abbrev-ref", "HEAD"])
  assert(branch, "Unable to resolve current git branch")
  return branch
}

const resolveConfig = async (
  argv: string[],
  runner: CommandRunner,
): Promise<TenantStabilityDownloadConfig> => {
  const parsedArgs = parseDownloadCliArgs(argv)
  const repository = parsedArgs.repository ?? (await resolveRepository(runner))
  const branch = parsedArgs.branch ?? (await resolveBranch(runner))
  const workflow =
    parsedArgs.workflow ??
    readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_DOWNLOAD_WORKFLOW") ??
    "ci.yml"
  const artifactName =
    parsedArgs.artifactName ??
    readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_DOWNLOAD_ARTIFACT_NAME") ??
    "e2e-tenant-report"
  const limitFromEnv = readNonEmptyEnv(
    "ELYSIAN_TENANT_STABILITY_DOWNLOAD_LIMIT",
  )
  const requestedRuns =
    parsedArgs.requestedRuns ??
    (limitFromEnv
      ? parsePositiveInt(
          limitFromEnv,
          "ELYSIAN_TENANT_STABILITY_DOWNLOAD_LIMIT",
        )
      : 5)
  const scanLimitFromEnv = readNonEmptyEnv(
    "ELYSIAN_TENANT_STABILITY_DOWNLOAD_SCAN_LIMIT",
  )
  const scanLimit =
    parsedArgs.scanLimit ??
    (scanLimitFromEnv
      ? parsePositiveInt(
          scanLimitFromEnv,
          "ELYSIAN_TENANT_STABILITY_DOWNLOAD_SCAN_LIMIT",
        )
      : Math.max(requestedRuns * 3, requestedRuns))
  const outputDir =
    parsedArgs.outputDir ??
    readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_DOWNLOAD_OUTPUT_DIR") ??
    defaultOutputDir()
  const events =
    parsedArgs.events.length > 0
      ? parsedArgs.events
      : (readNonEmptyEnv("ELYSIAN_TENANT_STABILITY_DOWNLOAD_EVENTS")
          ?.split(",")
          .map((item) => item.trim())
          .filter(Boolean) ?? [])

  assert(
    scanLimit >= requestedRuns,
    "scanLimit must be greater than or equal to requestedRuns",
  )

  return {
    repository,
    workflow,
    branch,
    artifactName,
    requestedRuns,
    scanLimit,
    outputDir,
    events,
  }
}

const ensureGhReady = async (runner: CommandRunner) => {
  await runner.run("gh", ["--version"])
  await runner.run("gh", ["auth", "status", "-h", "github.com"])
}

const listRuns = async (
  config: TenantStabilityDownloadConfig,
  runner: CommandRunner,
) => {
  const raw = await runner.run("gh", [
    "run",
    "list",
    "--repo",
    config.repository,
    "--workflow",
    config.workflow,
    "--branch",
    config.branch,
    "--limit",
    String(config.scanLimit),
    "--json",
    "databaseId,status,conclusion,event,headBranch,createdAt,displayTitle",
  ])

  return JSON.parse(raw) as TenantWorkflowRun[]
}

export const run = async (
  argv: string[] = process.argv.slice(2),
  runner: CommandRunner = defaultRunner,
) => {
  const config = await resolveConfig(argv, runner)
  await ensureGhReady(runner)

  const listedRuns = await listRuns(config, runner)
  const candidates = selectRunsForDownload(listedRuns, {
    scanLimit: config.scanLimit,
    events: config.events,
  })

  await mkdir(config.outputDir, { recursive: true })

  const items: TenantStabilityDownloadItem[] = []
  const skipped: TenantStabilityDownloadSkippedItem[] = []

  for (const run of candidates) {
    if (items.length >= config.requestedRuns) {
      break
    }

    const targetDir = join(config.outputDir, `run-${String(run.databaseId)}`)
    try {
      await rm(targetDir, { recursive: true, force: true })
      await mkdir(targetDir, { recursive: true })
      await runner.run("gh", [
        "run",
        "download",
        String(run.databaseId),
        "--repo",
        config.repository,
        "--name",
        config.artifactName,
        "--dir",
        targetDir,
      ])

      items.push({
        runId: run.databaseId,
        event: run.event,
        conclusion: run.conclusion,
        headBranch: run.headBranch,
        createdAt: run.createdAt,
        outputDir: targetDir,
      })
    } catch (error) {
      await rm(targetDir, { recursive: true, force: true })
      skipped.push({
        runId: run.databaseId,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (items.length === 0) {
    const skippedPreview =
      skipped.length > 0
        ? ` skipped=${skipped
            .slice(0, 3)
            .map((item) => `${String(item.runId)}:${item.reason}`)
            .join(" | ")}`
        : ""
    throw new Error(
      `No tenant report artifacts could be downloaded for ${config.repository}@${config.branch}.${skippedPreview}`,
    )
  }

  const report: TenantStabilityDownloadReport = {
    generatedAt: new Date().toISOString(),
    repository: config.repository,
    workflow: config.workflow,
    branch: config.branch,
    artifactName: config.artifactName,
    requestedRuns: config.requestedRuns,
    scanLimit: config.scanLimit,
    scannedRuns: candidates.length,
    downloadedCount: items.length,
    outputDir: config.outputDir,
    events: config.events,
    items,
    skipped,
  }

  const reportPath = join(
    config.outputDir,
    "e2e-tenant-stability-download-report.json",
  )
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8")

  console.log(`[e2e-tenant-download] report: ${reportPath}`)
  console.log(
    `[e2e-tenant-download] downloaded=${String(report.downloadedCount)} scanned=${String(report.scannedRuns)} branch=${config.branch} repo=${config.repository}`,
  )

  return report
}

if (import.meta.main) {
  try {
    await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[e2e-tenant-download] failed: ${message}`)
    process.exitCode = 1
  }
}
