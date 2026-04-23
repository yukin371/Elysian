import { describe, expect, it } from "bun:test"
import type { ModuleSchema } from "@elysian/schema"
import { ref } from "vue"

import {
  applyCrudDictionaryOptions,
  buildCrudDictionaryOptionCatalog,
  buildVueCustomCrudPage,
  getCrudPageDictionaryTypeCodes,
  usePermissions,
} from "./index"

const ticketModuleSchema: ModuleSchema = {
  name: "ticket",
  label: "Ticket",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "title",
      label: "Title",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "priority",
      label: "Priority",
      kind: "enum",
      searchable: true,
      options: [
        { label: "high", value: "high" },
        { label: "low", value: "low" },
      ],
      dictionaryTypeCode: "ticket_priority",
    },
    {
      key: "createdAt",
      label: "Created At",
      kind: "datetime",
      required: true,
    },
  ],
}

describe("frontend-vue preset helpers", () => {
  it("maps searchable and selectable schema metadata into the page contract", () => {
    const page = buildVueCustomCrudPage(ticketModuleSchema)

    expect(page.queryFields).toEqual([
      {
        key: "title",
        label: "Title",
        kind: "text",
        options: undefined,
        dictionaryTypeCode: undefined,
      },
      {
        key: "priority",
        label: "Priority",
        kind: "select",
        options: [
          { label: "high", value: "high" },
          { label: "low", value: "low" },
        ],
        dictionaryTypeCode: "ticket_priority",
      },
    ])

    expect(page.formFields).toEqual([
      {
        key: "title",
        label: "Title",
        input: "text",
        required: true,
        options: undefined,
        dictionaryTypeCode: undefined,
      },
      {
        key: "priority",
        label: "Priority",
        input: "select",
        required: false,
        options: [
          { label: "high", value: "high" },
          { label: "low", value: "low" },
        ],
        dictionaryTypeCode: "ticket_priority",
      },
    ])
  })

  it("extracts and applies runtime dictionary options with static fallback", () => {
    const page = buildVueCustomCrudPage(ticketModuleSchema)

    expect(getCrudPageDictionaryTypeCodes(page)).toEqual(["ticket_priority"])

    const catalog = buildCrudDictionaryOptionCatalog(
      [
        {
          id: "type_priority",
          code: "ticket_priority",
          status: "active",
        },
      ],
      [
        {
          typeId: "type_priority",
          value: "medium",
          label: "Medium",
          sort: 5,
          status: "active",
        },
        {
          typeId: "type_priority",
          value: "urgent",
          label: "Urgent",
          sort: 1,
          status: "active",
        },
      ],
    )

    expect(catalog).toEqual({
      ticket_priority: [
        { label: "Urgent", value: "urgent" },
        { label: "Medium", value: "medium" },
      ],
    })

    const resolvedPage = applyCrudDictionaryOptions(page, catalog)

    expect(resolvedPage.queryFields[1]?.options).toEqual([
      { label: "Urgent", value: "urgent" },
      { label: "Medium", value: "medium" },
    ])
    expect(resolvedPage.formFields[1]?.options).toEqual([
      { label: "Urgent", value: "urgent" },
      { label: "Medium", value: "medium" },
    ])

    const fallbackPage = applyCrudDictionaryOptions(page, {})

    expect(fallbackPage.formFields[1]?.options).toEqual([
      { label: "high", value: "high" },
      { label: "low", value: "low" },
    ])
  })

  it("deduplicates dictionary type codes across query and form fields", () => {
    const page = buildVueCustomCrudPage({
      name: "order",
      label: "Order",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        {
          key: "status",
          label: "Status",
          kind: "enum",
          searchable: true,
          options: [{ label: "draft", value: "draft" }],
          dictionaryTypeCode: "order_status",
        },
        {
          key: "channel",
          label: "Channel",
          kind: "enum",
          searchable: true,
          options: [{ label: "online", value: "online" }],
          dictionaryTypeCode: "order_channel",
        },
      ],
    })

    expect(getCrudPageDictionaryTypeCodes(page)).toEqual([
      "order_status",
      "order_channel",
    ])
  })

  it("ignores disabled dictionary types and items when building runtime catalog", () => {
    const catalog = buildCrudDictionaryOptionCatalog(
      [
        {
          id: "type_order_status",
          code: "order_status",
          status: "active",
        },
        {
          id: "type_order_channel",
          code: "order_channel",
          status: "disabled",
        },
      ],
      [
        {
          typeId: "type_order_status",
          value: "paid",
          label: "Paid",
          sort: 20,
          status: "active",
        },
        {
          typeId: "type_order_status",
          value: "cancelled",
          label: "Cancelled",
          sort: 10,
          status: "disabled",
        },
        {
          typeId: "type_order_channel",
          value: "offline",
          label: "Offline",
          sort: 10,
          status: "active",
        },
      ],
    )

    expect(catalog).toEqual({
      order_status: [{ label: "Paid", value: "paid" }],
    })
  })

  it("keeps permission gates reactive to module readiness changes", () => {
    const permissionCodes = ref<string[]>([])
    const moduleReady = ref(false)

    const gates = usePermissions(
      permissionCodes,
      {
        list: "ticket:ticket:list",
        create: "ticket:ticket:create",
        update: "ticket:ticket:update",
        delete: "ticket:ticket:delete",
      },
      moduleReady,
    )

    expect(gates.create.value).toBe(true)

    moduleReady.value = true
    expect(gates.create.value).toBe(false)

    permissionCodes.value = ["ticket:ticket:create"]
    expect(gates.create.value).toBe(true)
    expect(gates.delete.value).toBe(false)
  })
})
