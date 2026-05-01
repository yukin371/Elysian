import type { DatabaseClient } from "@elysian/persistence"

import type { AuthGuard } from "./auth"
import { createDepartmentModule } from "./department/module"
import { createDepartmentRepository } from "./department/repository"
import { createDictionaryModule } from "./dictionary/module"
import { createDictionaryRepository } from "./dictionary/repository"
import { createMenuModule } from "./menu/module"
import { createMenuRepository } from "./menu/repository"
import type { ServerModule } from "./module"
import { createSettingModule } from "./setting/module"
import { createSettingRepository } from "./setting/repository"

export const composeSystemModules = (
  db: DatabaseClient,
  authGuard: AuthGuard,
): ServerModule[] => {
  const dictionaryRepository = createDictionaryRepository(db)
  const departmentRepository = createDepartmentRepository(db)
  const menuRepository = createMenuRepository(db)
  const settingRepository = createSettingRepository(db)

  return [
    createDictionaryModule(dictionaryRepository, {
      authGuard,
    }),
    createDepartmentModule(departmentRepository, {
      authGuard,
    }),
    createMenuModule(menuRepository, {
      authGuard,
    }),
    createSettingModule(settingRepository, {
      authGuard,
    }),
  ]
}
