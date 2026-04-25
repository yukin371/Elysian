import { describe, expect, it } from "bun:test"
import type { UiCrudPageDefinition } from "@elysian/ui-core"
import { computed, ref } from "vue"

import { resolveElyShellCopy, useElyCrudPage } from "./index"

const definition: UiCrudPageDefinition = {
  key: "ticket-crud",
  title: "Ticket Workspace",
  resource: "ticket",
  columns: [
    { key: "title", label: "Title", kind: "text" },
    { key: "priority", label: "Priority", kind: "text" },
  ],
  queryFields: [
    { key: "title", label: "Title", kind: "text" },
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
  ],
  formFields: [
    { key: "title", label: "Title", input: "text", required: true },
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
  ],
  actions: [
    {
      key: "update",
      label: "Update",
      permissionCode: "ticket:ticket:update",
      tone: "secondary",
    },
    {
      key: "delete",
      label: "Delete",
      permissionCode: "ticket:ticket:delete",
      tone: "danger",
    },
  ],
}

describe("ui-enterprise-vue adapters", () => {
  it("preserves query and form options from the canonical page definition", () => {
    const permissionCodes = ref<string[]>(["ticket:ticket:update"])
    const page = useElyCrudPage(definition, permissionCodes)

    expect(page.queryFields.value).toEqual([
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

    expect(page.formFields.value[1]).toEqual({
      key: "priority",
      label: "Priority",
      input: "select",
      required: false,
      options: [
        { label: "high", value: "high" },
        { label: "low", value: "low" },
      ],
      dictionaryTypeCode: "ticket_priority",
    })
  })

  it("keeps action availability reactive to permission changes", () => {
    const permissionCodes = ref<string[]>(["ticket:ticket:update"])
    const page = useElyCrudPage(definition, permissionCodes)

    expect(page.tableActions.value).toEqual([
      {
        key: "update",
        label: "Update",
        tone: "secondary",
        enabled: true,
      },
      {
        key: "delete",
        label: "Delete",
        tone: "danger",
        enabled: false,
      },
    ])

    permissionCodes.value = ["ticket:ticket:update", "ticket:ticket:delete"]

    expect(page.tableActions.value[1]?.enabled).toBe(true)
  })

  it("reacts to dictionary-backed page definition updates", () => {
    const permissionCodes = ref<string[]>([])
    const definitionRef = computed<UiCrudPageDefinition>(() => ({
      ...definition,
      formFields: [
        {
          key: "title",
          label: "Title",
          input: "text",
          required: true,
        },
        {
          key: "priority",
          label: "Priority",
          input: "select",
          required: false,
          options: [{ label: "Runtime", value: "runtime" }],
          dictionaryTypeCode: "ticket_priority",
        },
      ],
    }))

    const page = useElyCrudPage(definitionRef, permissionCodes)

    expect(page.formFields.value[1]?.options).toEqual([
      { label: "Runtime", value: "runtime" },
    ])
  })

  it("resolves shell copy with explicit props, copy fallback, and built-in defaults", () => {
    expect(
      resolveElyShellCopy({
        navigationLabel: "Navigation",
        environmentLabel: "Environment",
        presetEyebrow: "Enterprise Preset",
        fallbackWorkspace: "Empty state",
        copy: {
          navigationLabel: "Ignored nav copy",
          environmentLabel: "Ignored env copy",
          presetEyebrow: "Ignored eyebrow copy",
          fallbackWorkspace: "Ignored fallback copy",
        },
      }),
    ).toEqual({
      navigationLabel: "Navigation",
      environmentLabel: "Environment",
      presetEyebrow: "Enterprise Preset",
      fallbackWorkspace: "Empty state",
    })

    expect(
      resolveElyShellCopy({
        copy: {
          navigationLabel: "导航",
          environmentLabel: "环境",
          presetEyebrow: "企业预设",
          fallbackWorkspace: "暂无数据",
        },
      }),
    ).toEqual({
      navigationLabel: "导航",
      environmentLabel: "环境",
      presetEyebrow: "企业预设",
      fallbackWorkspace: "暂无数据",
    })

    expect(resolveElyShellCopy({})).toEqual({
      navigationLabel: "导航",
      environmentLabel: "环境",
      presetEyebrow: "企业预设",
      fallbackWorkspace: "工作区内容待接入。",
    })
  })
})
