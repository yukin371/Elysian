import { describe, expect, test } from "bun:test"

import {
  type Phase6aExitDecision,
  type RateLimitSignal,
  type RuntimeMetricsSignal,
  type SmokeSignal,
  decidePhase6aExit,
} from "./phase-6a-exit-decision"

describe("decidePhase6aExit", () => {
  test("go + phase-6b when smoke stable and other signals healthy", () => {
    const smokeSignal: SmokeSignal = {
      status: "stable",
      finalStatus: "passed",
      recoveredByRetry: false,
      attempts: 1,
    }

    const runtimeSignal: RuntimeMetricsSignal = {
      status: "healthy",
      memoryUsage: "normal",
      errorRate: 0.01,
    }

    const rateLimitSignal: RateLimitSignal = {
      status: "ready",
      remainingQuota: 1000,
      resetTime: new Date(Date.now() + 3600000).toISOString(),
    }

    const decision = decidePhase6aExit({
      smokeSignal,
      runtimeSignal,
      rateLimitSignal,
    })

    expect(decision.action).toBe("go")
    expect(decision.nextPhase).toBe("phase-6b")
    expect(decision.reason).toContain("All signals healthy")
    expect(decision.roadmapUpdate).toBe("proceed-to-6b")
  })

  test("hold + undecided when signals degraded but not failed", () => {
    const smokeSignal: SmokeSignal = {
      status: "degraded",
      finalStatus: "passed",
      recoveredByRetry: true,
      attempts: 2,
    }

    const runtimeSignal: RuntimeMetricsSignal = {
      status: "degraded",
      memoryUsage: "elevated",
      errorRate: 0.05,
    }

    const rateLimitSignal: RateLimitSignal = {
      status: "warning",
      remainingQuota: 100,
      resetTime: new Date(Date.now() + 3600000).toISOString(),
    }

    const decision = decidePhase6aExit({
      smokeSignal,
      runtimeSignal,
      rateLimitSignal,
    })

    expect(decision.action).toBe("hold")
    expect(decision.nextPhase).toBe("undecided")
    expect(decision.reason).toContain("Signals degraded")
    expect(decision.roadmapUpdate).toBe("hold-for-review")
  })

  test("rollback-to-fix + undecided when smoke reports systemic failure", () => {
    const smokeSignal: SmokeSignal = {
      status: "failed",
      finalStatus: "failed",
      recoveredByRetry: false,
      attempts: 3,
      failureCategory: "systemic",
      lastStage: "module_readiness",
    }

    const runtimeSignal: RuntimeMetricsSignal = {
      status: "healthy",
      memoryUsage: "normal",
      errorRate: 0.01,
    }

    const rateLimitSignal: RateLimitSignal = {
      status: "ready",
      remainingQuota: 1000,
      resetTime: new Date(Date.now() + 3600000).toISOString(),
    }

    const decision = decidePhase6aExit({
      smokeSignal,
      runtimeSignal,
      rateLimitSignal,
    })

    expect(decision.action).toBe("rollback-to-fix")
    expect(decision.nextPhase).toBe("undecided")
    expect(decision.reason).toContain("Systemic failure detected")
    expect(decision.roadmapUpdate).toBe("rollback-required")
  })
})
