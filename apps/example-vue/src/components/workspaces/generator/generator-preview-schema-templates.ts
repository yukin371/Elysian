export interface GeneratorPreviewSchemaTemplate {
  id: string
  label: string
  description: string
  schema: Record<string, unknown>
}

const schemaTemplates: GeneratorPreviewSchemaTemplate[] = [
  {
    id: "simple-crud",
    label: "标准台账模块",
    description: "生成标准列表、详情和表单骨架，适合大多数后台 CRUD 模块",
    schema: {
      name: "module_name",
      label: "模块名称",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        {
          key: "name",
          label: "名称",
          kind: "string",
          required: true,
          searchable: true,
        },
        { key: "description", label: "说明", kind: "string" },
        { key: "code", label: "编码", kind: "string", searchable: true },
        { key: "sort", label: "排序", kind: "number" },
        { key: "enabled", label: "启用", kind: "boolean" },
        {
          key: "createdAt",
          label: "创建时间",
          kind: "datetime",
          required: true,
        },
        {
          key: "updatedAt",
          label: "更新时间",
          kind: "datetime",
          required: true,
        },
      ],
    },
  },
  {
    id: "with-status",
    label: "状态流模块",
    description: "生成带状态筛选和状态字段的工作区，适合启停、归档类模块",
    schema: {
      name: "module_name",
      label: "模块名称",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        {
          key: "name",
          label: "名称",
          kind: "string",
          required: true,
          searchable: true,
        },
        { key: "code", label: "编码", kind: "string", searchable: true },
        {
          key: "status",
          label: "状态",
          kind: "enum",
          required: true,
          searchable: true,
          options: [
            { label: "草稿", value: "draft" },
            { label: "启用", value: "active" },
            { label: "归档", value: "archived" },
          ],
        },
        { key: "enabled", label: "启用", kind: "boolean" },
        {
          key: "createdAt",
          label: "创建时间",
          kind: "datetime",
          required: true,
        },
        {
          key: "updatedAt",
          label: "更新时间",
          kind: "datetime",
          required: true,
        },
      ],
    },
  },
  {
    id: "with-dictionary",
    label: "字典驱动模块",
    description: "生成适合字典字段和标签映射的工作区，适合类型化配置模块",
    schema: {
      name: "module_name",
      label: "模块名称",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        {
          key: "name",
          label: "名称",
          kind: "string",
          required: true,
          searchable: true,
        },
        {
          key: "type",
          label: "类型",
          kind: "enum",
          required: true,
          searchable: true,
          dictionaryTypeCode: "module_type",
        },
        { key: "sort", label: "排序", kind: "number" },
        { key: "enabled", label: "启用", kind: "boolean" },
        {
          key: "createdAt",
          label: "创建时间",
          kind: "datetime",
          required: true,
        },
        {
          key: "updatedAt",
          label: "更新时间",
          kind: "datetime",
          required: true,
        },
      ],
    },
  },
]

export const listSchemaTemplateIds = (): string[] =>
  schemaTemplates.map((template) => template.id)

export const listSchemaTemplates = (): GeneratorPreviewSchemaTemplate[] =>
  schemaTemplates

export const getSchemaTemplate = (id: string): string => {
  const template = schemaTemplates.find((candidate) => candidate.id === id)

  if (!template) {
    throw new Error(`Unknown schema template: ${id}`)
  }

  return JSON.stringify(template.schema, null, 2)
}
