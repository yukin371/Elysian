import { type CustomerRecord, assertStatus, baseUrl } from "./e2e-smoke-support"

interface RunCustomerSmokeOptions {
  authHeader: Record<string, string>
  setStage: (stage: string) => void
  setCleanupCustomerId: (customerId: string | null) => void
}

export const runCustomerSmoke = async ({
  authHeader,
  setStage,
  setCleanupCustomerId,
}: RunCustomerSmokeOptions) => {
  setStage("customer_list")
  const listResponse = await fetch(`${baseUrl}/customers`, {
    headers: authHeader,
  })
  await assertStatus(listResponse, 200)

  setStage("customer_create")
  const createName = `smoke-${Date.now()}`
  const createResponse = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: {
      ...authHeader,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: createName,
      status: "active",
    }),
  })
  await assertStatus(createResponse, 201)
  const created = (await createResponse.json()) as CustomerRecord
  setCleanupCustomerId(created.id)

  if (!created.id) {
    throw new Error("Create customer succeeded but id is missing")
  }

  setStage("customer_update")
  const updateResponse = await fetch(`${baseUrl}/customers/${created.id}`, {
    method: "PUT",
    headers: {
      ...authHeader,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      status: "inactive",
    }),
  })
  await assertStatus(updateResponse, 200)

  setStage("customer_detail")
  const detailResponse = await fetch(`${baseUrl}/customers/${created.id}`, {
    headers: authHeader,
  })
  await assertStatus(detailResponse, 200)
  const detailPayload = (await detailResponse.json()) as CustomerRecord
  if (detailPayload.status !== "inactive") {
    throw new Error(
      `Expected updated customer status=inactive, received ${detailPayload.status}`,
    )
  }

  setStage("customer_delete")
  const deleteResponse = await fetch(`${baseUrl}/customers/${created.id}`, {
    method: "DELETE",
    headers: authHeader,
  })
  await assertStatus(deleteResponse, 204)
  setCleanupCustomerId(null)

  setStage("customer_verify_deleted")
  const afterDeleteResponse = await fetch(
    `${baseUrl}/customers/${created.id}`,
    {
      headers: authHeader,
    },
  )
  await assertStatus(afterDeleteResponse, 404)
}
