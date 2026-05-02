import { describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import { useExampleQuerySummary } from "./use-example-query-summary"

const createOptions = () => ({
  t: (key: string) => key,
  customerQuerySummary: computed(() => "customer-summary"),
  isDictionaryWorkspace: computed(() => false),
  isDepartmentWorkspace: computed(() => false),
  isSessionWorkspace: computed(() => false),
  isPostWorkspace: computed(() => false),
  isRoleWorkspace: computed(() => false),
  isMenuWorkspace: computed(() => false),
  isNotificationWorkspace: computed(() => false),
  isOperationLogWorkspace: computed(() => false),
  isUserWorkspace: computed(() => false),
  isSettingWorkspace: computed(() => false),
  isTenantWorkspace: computed(() => false),
  dictionaryQueryValues: ref({}),
  departmentQueryValues: ref({}),
  sessionQuerySummary: computed(() => "session-summary"),
  postQueryValues: ref({}),
  roleQueryValues: ref({}),
  menuQueryValues: ref({}),
  notificationQueryValues: ref({}),
  operationLogQueryValues: ref({}),
  userQueryValues: ref({}),
  settingQueryValues: ref({}),
  tenantQueryValues: ref({}),
  localizeDictionaryStatus: (status: string) => status,
  localizeDepartmentStatus: (status: string) => status,
  localizePostStatus: (status: string) => status,
  localizeRoleStatus: (status: string) => status,
  localizeMenuType: (type: string) => type,
  localizeMenuStatus: (status: string) => status,
  localizeNotificationLevel: (level: string) => level,
  localizeNotificationStatus: (status: string) => status,
  localizeOperationLogResult: (result: string) => result,
  localizeUserStatus: (status: string) => status,
  localizeSettingStatus: (status: string) => status,
  localizeTenantStatus: (status: string) => status,
})

describe("useExampleQuerySummary", () => {
  test("localizes known operation-log auth failure reasons in the query summary", () => {
    const options = createOptions()
    options.isOperationLogWorkspace = computed(() => true)
    options.operationLogQueryValues = ref({
      authFailureReason: "invalid_password",
    })

    const summary = useExampleQuerySummary(options)

    expect(summary.currentQuerySummary.value).toBe(
      "app.operationLog.field.authFailureReason: app.operationLog.authFailureReason.invalid_password",
    )
  })

  test("keeps unknown operation-log auth failure reasons unchanged in the query summary", () => {
    const options = createOptions()
    options.isOperationLogWorkspace = computed(() => true)
    options.operationLogQueryValues = ref({
      authFailureReason: "custom_reason",
    })

    const summary = useExampleQuerySummary(options)

    expect(summary.currentQuerySummary.value).toBe(
      "app.operationLog.field.authFailureReason: custom_reason",
    )
  })

  test("localizes user-disabled operation-log auth failure reasons in the query summary", () => {
    const options = createOptions()
    options.isOperationLogWorkspace = computed(() => true)
    options.operationLogQueryValues = ref({
      authFailureReason: "user_disabled",
    })

    const summary = useExampleQuerySummary(options)

    expect(summary.currentQuerySummary.value).toBe(
      "app.operationLog.field.authFailureReason: app.operationLog.authFailureReason.user_disabled",
    )
  })
})
