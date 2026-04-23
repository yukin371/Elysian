export interface SmokeSignal {
  status: "stable" | "degraded" | "failed"
  finalStatus: "passed" | "failed"
  recoveredByRetry: boolean
  attempts: number
  failureCategory?: "systemic" | "dependency" | "environment" | "unknown"
  lastStage?: string
}

export interface RuntimeMetricsSignal {
  status: "healthy" | "degraded" | "failed"
  memoryUsage: "normal" | "elevated" | "critical"
  errorRate: number
}

export interface RateLimitSignal {
  status: "ready" | "warning" | "blocked"
  remainingQuota: number
  resetTime: string
}

export interface Phase6aExitDecisionInput {
  smokeSignal: SmokeSignal
  runtimeSignal: RuntimeMetricsSignal
  rateLimitSignal: RateLimitSignal
}

export interface Phase6aExitDecision {
  action: "go" | "hold" | "rollback-to-fix"
  nextPhase: "phase-6b" | "phase-5" | "undecided"
  reason: string
  roadmapUpdate:
    | "proceed-to-6b"
    | "proceed-to-5"
    | "hold-for-review"
    | "rollback-required"
}

const isSystemicSmokeFailure = (signal: SmokeSignal) =>
  signal.status === "failed" &&
  (signal.failureCategory === "systemic" || signal.finalStatus === "failed")

const isHealthyRuntime = (signal: RuntimeMetricsSignal) =>
  signal.status === "healthy" &&
  signal.memoryUsage === "normal" &&
  signal.errorRate <= 0.02

const isReadyRateLimit = (signal: RateLimitSignal) =>
  signal.status === "ready" && signal.remainingQuota > 0

export const decidePhase6aExit = ({
  smokeSignal,
  runtimeSignal,
  rateLimitSignal,
}: Phase6aExitDecisionInput): Phase6aExitDecision => {
  if (isSystemicSmokeFailure(smokeSignal)) {
    const stageNote = smokeSignal.lastStage
      ? ` Last impacted stage: ${smokeSignal.lastStage}.`
      : ""

    return {
      action: "rollback-to-fix",
      nextPhase: "undecided",
      reason: `Systemic failure detected in smoke stability evidence.${stageNote}`,
      roadmapUpdate: "rollback-required",
    }
  }

  if (
    smokeSignal.status === "stable" &&
    isHealthyRuntime(runtimeSignal) &&
    isReadyRateLimit(rateLimitSignal)
  ) {
    return {
      action: "go",
      nextPhase: "phase-6b",
      reason:
        "All signals healthy. Phase 6A Round-2 exit gate is satisfied and can proceed to Phase 6B review.",
      roadmapUpdate: "proceed-to-6b",
    }
  }

  return {
    action: "hold",
    nextPhase: "undecided",
    reason:
      "Signals degraded. Keep Phase 6A Round-2 active until smoke stability, runtime metrics, and rate-limit readiness are reviewed together.",
    roadmapUpdate: "hold-for-review",
  }
}
