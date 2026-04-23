import type { Elysia } from "elysia"

import type { ServerConfig } from "../config"
import { ModuleRegistrationError } from "../errors"
import type { ServerLogger } from "../logging"

// biome-ignore lint/suspicious/noExplicitAny: Elysia module registration needs a widened bridge type.
export type AnyServerApp = Elysia<any, any, any, any, any, any, any>

export interface ServerModuleContext {
  config: ServerConfig
  logger: ServerLogger
  moduleNames: string[]
}

export interface ServerModule {
  name: string
  register: (app: AnyServerApp, context: ServerModuleContext) => AnyServerApp
}

export const registerModules = (
  app: AnyServerApp,
  modules: ServerModule[],
  context: Omit<ServerModuleContext, "moduleNames">,
): AnyServerApp => {
  const moduleNames = modules.map((module) => module.name)
  let current = app

  for (const module of modules) {
    try {
      current = module.register(current, {
        ...context,
        moduleNames,
      })
    } catch (error) {
      throw new ModuleRegistrationError(module.name, error)
    }
  }

  return current
}
