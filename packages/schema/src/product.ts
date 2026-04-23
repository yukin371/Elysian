import type { ModuleSchema } from "./index"

export type ProductStatus = "active" | "inactive" | "discontinued"

export interface ProductRecord {
  id: string
  name: string
  sku: string
  price: number
  category: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export const productModuleSchema: ModuleSchema = {
  name: "product",
  label: "Product",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "name",
      label: "Name",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "sku",
      label: "SKU",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "price",
      label: "Price",
      kind: "number",
      required: true,
    },
    {
      key: "category",
      label: "Category",
      kind: "string",
      searchable: true,
    },
    {
      key: "status",
      label: "Status",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "active", value: "active" },
        { label: "inactive", value: "inactive" },
        { label: "discontinued", value: "discontinued" },
      ],
    },
    {
      key: "createdAt",
      label: "Created At",
      kind: "datetime",
      required: true,
    },
    {
      key: "updatedAt",
      label: "Updated At",
      kind: "datetime",
      required: true,
    },
  ],
}
