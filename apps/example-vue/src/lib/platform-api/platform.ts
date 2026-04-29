import { requestJson } from "./core"

export interface PlatformResponse {
  manifest: {
    name: string
    displayName: string
    version: string
    runtime: string
    status: string
  }
  capabilities: string[]
}

export interface SystemModulesResponse {
  env: string
  modules: string[]
}

export const fetchPlatform = (): Promise<PlatformResponse> =>
  requestJson<PlatformResponse>("/platform")

export const fetchSystemModules = (): Promise<SystemModulesResponse> =>
  requestJson<SystemModulesResponse>("/system/modules")
