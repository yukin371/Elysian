import type { operations } from "./generated/openapi-types"

type JsonContent<T> = T extends {
  content: {
    "application/json": infer TPayload
  }
}
  ? TPayload
  : never

type ResponseContent<
  TOperation extends keyof operations,
  TStatus extends keyof operations[TOperation]["responses"],
> = JsonContent<operations[TOperation]["responses"][TStatus]>

type RequestBodyContent<TOperation extends keyof operations> =
  operations[TOperation] extends {
    requestBody: {
      content: {
        "application/json": infer TPayload
      }
    }
  }
    ? TPayload
    : never

export type OpenApiAuthLoginResponse = ResponseContent<"postAuthLogin", 200>
export type OpenApiAuthMeResponse = ResponseContent<"getAuthMe", 200>
export type OpenApiAuthSessionsResponse = ResponseContent<
  "getAuthSessions",
  200
>
export type OpenApiAuthSessionSummary =
  OpenApiAuthSessionsResponse["items"][number]

export type OpenApiCustomersResponse = ResponseContent<"getCustomers", 200>
export type OpenApiCustomerRecord = OpenApiCustomersResponse["items"][number]
export type OpenApiCreateCustomerInput = RequestBodyContent<"postCustomers">
export type OpenApiUpdateCustomerInput = RequestBodyContent<"putCustomersById">

export type OpenApiSettingsResponse = ResponseContent<"getSystemSettings", 200>
export type OpenApiSettingRecord = ResponseContent<"getSystemSettingsById", 200>
export type OpenApiCreateSettingInput = RequestBodyContent<"postSystemSettings">
export type OpenApiUpdateSettingInput =
  RequestBodyContent<"putSystemSettingsById">

export type OpenApiTenantsResponse = ResponseContent<"getSystemTenants", 200>
export type OpenApiTenantRecord = ResponseContent<"getSystemTenantsById", 200>
export type OpenApiCreateTenantInput = RequestBodyContent<"postSystemTenants">
export type OpenApiUpdateTenantInput =
  RequestBodyContent<"putSystemTenantsById">
export type OpenApiUpdateTenantStatusInput =
  RequestBodyContent<"putSystemTenantsByIdStatus">

export type OpenApiUsersResponse = ResponseContent<"getSystemUsers", 200>
export type OpenApiUserRecord = ResponseContent<"getSystemUsersById", 200>
export type OpenApiCreateUserInput = RequestBodyContent<"postSystemUsers">
export type OpenApiUpdateUserInput = RequestBodyContent<"putSystemUsersById">
export type OpenApiResetUserPasswordInput =
  RequestBodyContent<"postSystemUsersByIdReset-password">

export type OpenApiRolesResponse = ResponseContent<"getSystemRoles", 200>
export type OpenApiRoleDetailRecord = ResponseContent<"getSystemRolesById", 200>
export type OpenApiRoleRecord = OpenApiRolesResponse["items"][number]
export type OpenApiCreateRoleInput = RequestBodyContent<"postSystemRoles">
export type OpenApiUpdateRoleInput = RequestBodyContent<"putSystemRolesById">

export type OpenApiNotificationsResponse = ResponseContent<
  "getSystemNotifications",
  200
>
export type OpenApiNotificationRecord = ResponseContent<
  "getSystemNotificationsById",
  200
>
export type OpenApiCreateNotificationInput =
  RequestBodyContent<"postSystemNotifications">
export type OpenApiMarkNotificationsAsReadInput =
  RequestBodyContent<"postSystemNotificationsRead">
export type OpenApiMarkNotificationsAsReadResponse = ResponseContent<
  "postSystemNotificationsRead",
  200
>

export type OpenApiDepartmentsResponse = ResponseContent<
  "getSystemDepartments",
  200
>
export type OpenApiDepartmentDetailRecord = ResponseContent<
  "getSystemDepartmentsById",
  200
>
export type OpenApiDepartmentRecord =
  OpenApiDepartmentsResponse["items"][number]
export type OpenApiCreateDepartmentInput =
  RequestBodyContent<"postSystemDepartments">
export type OpenApiUpdateDepartmentInput =
  RequestBodyContent<"putSystemDepartmentsById">

export type OpenApiPostsResponse = ResponseContent<"getSystemPosts", 200>
export type OpenApiPostRecord = ResponseContent<"getSystemPostsById", 200>
export type OpenApiCreatePostInput = RequestBodyContent<"postSystemPosts">
export type OpenApiUpdatePostInput = RequestBodyContent<"putSystemPostsById">

export type OpenApiMenusResponse = ResponseContent<"getSystemMenus", 200>
export type OpenApiMenuDetailRecord = ResponseContent<"getSystemMenusById", 200>
export type OpenApiMenuRecord = OpenApiMenusResponse["items"][number]
export type OpenApiCreateMenuInput = RequestBodyContent<"postSystemMenus">
export type OpenApiUpdateMenuInput = RequestBodyContent<"putSystemMenusById">

export type OpenApiDictionaryTypesResponse = ResponseContent<
  "getSystemDictionariesTypes",
  200
>
export type OpenApiDictionaryTypeDetailRecord = ResponseContent<
  "getSystemDictionariesTypesById",
  200
>
export type OpenApiDictionaryTypeRecord =
  OpenApiDictionaryTypesResponse["items"][number]
export type OpenApiCreateDictionaryTypeInput =
  RequestBodyContent<"postSystemDictionariesTypes">
export type OpenApiUpdateDictionaryTypeInput =
  RequestBodyContent<"putSystemDictionariesTypesById">

export type OpenApiDictionaryItemsResponse = ResponseContent<
  "getSystemDictionariesItems",
  200
>
export type OpenApiDictionaryItemRecord =
  OpenApiDictionaryItemsResponse["items"][number]
