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
export type OpenApiAuthSessionsResponse = ResponseContent<"getAuthSessions", 200>
export type OpenApiAuthSessionSummary = OpenApiAuthSessionsResponse["items"][number]

export type OpenApiCustomersResponse = ResponseContent<"getCustomers", 200>
export type OpenApiCustomerRecord = OpenApiCustomersResponse["items"][number]
export type OpenApiCreateCustomerInput = RequestBodyContent<"postCustomers">
export type OpenApiUpdateCustomerInput = RequestBodyContent<"putCustomersById">
