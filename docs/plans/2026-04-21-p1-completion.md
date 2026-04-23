# P1 垂直切片闭环 Implementation Plan

> 执行提示：按计划逐项实现，并使用 checklist 跟踪完成状态。

**Goal:** Complete the first vertical slice by adding UPDATE/DELETE to the customer CRUD pipeline end-to-end, from persistence to Vue UI, plus environment setup documentation.

**Architecture:** Extend the existing repository→service→routes pipeline downstream. Persistence gets `updateCustomer`/`deleteCustomer`, server module adds PUT/DELETE routes, API client adds the two calls, Vue adds inline edit + delete confirmation. All changes follow existing patterns exactly.

**Tech Stack:** Elysia (routes), Drizzle ORM (persistence), Vue 3 + Tailwind CSS (frontend), Bun test

> **Closeout Result (2026-04-21):** Completed.
> 
> Final closeout validation additionally fixed two runtime gaps discovered during acceptance:
> 1. `bun run db:migrate` now works with the required Postgres driver and Drizzle migration journal.
> 2. Server now enables CORS so `bun run dev:server` and `bun run dev:vue` work together in local development.
>
> Final verification performed:
> - `bun run check`
> - `bun run build:vue`
> - `bun --filter @elysian/generator generate --schema customer --target staging --frontend vue`
> - Docker PostgreSQL + browser smoke for customer create / update / delete persistence

---

### Task 1: Persistence — add update and delete helpers

**Files:**
- Modify: `packages/persistence/src/customer.ts`
- Modify: `packages/persistence/src/index.ts`

**Step 1: Add `updateCustomer` and `deleteCustomer` to persistence**

In `packages/persistence/src/customer.ts`, append after `insertCustomer`:

```typescript
export const updateCustomer = async (
  db: DatabaseClient,
  id: string,
  input: Partial<Omit<CreateCustomerPersistenceInput, never>>,
): Promise<CustomerRow | null> => {
  const [row] = await db
    .update(customers)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning()

  return row ?? null
}

export const deleteCustomer = async (
  db: DatabaseClient,
  id: string,
): Promise<boolean> => {
  const result = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning()

  return result.length > 0
}
```

**Step 2: Export from barrel**

In `packages/persistence/src/index.ts`, update the customer export line:

```typescript
export {
  deleteCustomer,
  getCustomerById,
  insertCustomer,
  listCustomers,
  updateCustomer,
  type CreateCustomerPersistenceInput,
} from "./customer"
```

**Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS (no type errors)

**Step 4: Commit**

```bash
git add packages/persistence/src/customer.ts packages/persistence/src/index.ts
git commit -m "feat(persistence): add updateCustomer and deleteCustomer helpers"
```

---

### Task 2: Repository — add update and remove methods

**Files:**
- Modify: `apps/server/src/modules/customer/repository.ts`

**Step 1: Update imports**

Add `updateCustomer, deleteCustomer` to the `@elysian/persistence` import. Add `UpdateCustomerInput` type.

```typescript
import {
  type CustomerRow,
  type DatabaseClient,
  deleteCustomer,
  getCustomerById,
  insertCustomer,
  listCustomers,
  updateCustomer,
} from "@elysian/persistence"
import type { CustomerRecord, CustomerStatus } from "@elysian/schema"
```

**Step 2: Extend `CustomerRepository` interface**

Add `update` and `remove` to the interface:

```typescript
export interface CustomerRepository {
  list: () => Promise<CustomerRecord[]>
  getById: (id: string) => Promise<CustomerRecord | null>
  create: (input: CreateCustomerInput) => Promise<CustomerRecord>
  update: (id: string, input: UpdateCustomerInput) => Promise<CustomerRecord | null>
  remove: (id: string) => Promise<boolean>
}
```

Add `UpdateCustomerInput` type after `CreateCustomerInput`:

```typescript
export interface UpdateCustomerInput {
  name?: string
  status?: CustomerStatus
}
```

**Step 3: Add implementations to `createCustomerRepository`**

Add after the `create` method in `createCustomerRepository`:

```typescript
async update(id, input) {
  const row = await updateCustomer(db, id, input)
  return row ? mapCustomerRow(row) : null
},
async remove(id) {
  return deleteCustomer(db, id)
},
```

**Step 4: Add implementations to `createInMemoryCustomerRepository`**

Add after the `create` method:

```typescript
async update(id, input) {
  const existing = items.get(id)
  if (!existing) return null
  const updated: CustomerRecord = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined),
    ),
    updatedAt: new Date().toISOString(),
  }
  items.set(id, updated)
  return updated
},
async remove(id) {
  return items.delete(id)
},
```

**Step 5: Run typecheck**

Run: `bun run typecheck`
Expected: FAIL — `service.ts` and `module.ts` don't use the new methods yet, but that's OK since the interface extension is backward-compatible. Should still PASS.

**Step 6: Commit**

```bash
git add apps/server/src/modules/customer/repository.ts
git commit -m "feat(server): add update and remove to CustomerRepository interface"
```

---

### Task 3: Service — add update and remove logic

**Files:**
- Modify: `apps/server/src/modules/customer/service.ts`

**Step 1: Write the failing test**

In `apps/server/src/app.test.ts`, add two new test cases inside the `createServerApp` describe block, after the "returns customer not found" test:

```typescript
it("updates a customer through the customer module", async () => {
  const repo = createInMemoryCustomerRepository([
    {
      id: "cust_1",
      name: "Acme Corp",
      status: "active",
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    },
  ])
  const app = createTestApp({
    modules: [createCustomerModule(repo)],
  })
  const response = await app.handle(
    new Request("http://localhost/customers/cust_1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Acme Updated", status: "inactive" }),
    }),
  )

  expect(response.status).toBe(200)
  const body = (await response.json()) as {
    name: string
    status: string
  }
  expect(body.name).toBe("Acme Updated")
  expect(body.status).toBe("inactive")
})

it("deletes a customer through the customer module", async () => {
  const repo = createInMemoryCustomerRepository([
    {
      id: "cust_1",
      name: "Acme Corp",
      status: "active",
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    },
  ])
  const app = createTestApp({
    modules: [createCustomerModule(repo)],
  })
  const response = await app.handle(
    new Request("http://localhost/customers/cust_1", {
      method: "DELETE",
    }),
  )

  expect(response.status).toBe(204)

  const listResponse = await app.handle(
    new Request("http://localhost/customers"),
  )
  const body = (await listResponse.json()) as { items: unknown[] }
  expect(body.items).toHaveLength(0)
})

it("returns 404 when updating a missing customer", async () => {
  const app = createTestApp({
    modules: [createCustomerModule(createInMemoryCustomerRepository())],
  })
  const response = await app.handle(
    new Request("http://localhost/customers/missing", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "New Name" }),
    }),
  )

  expect(response.status).toBe(404)
})

it("returns 404 when deleting a missing customer", async () => {
  const app = createTestApp({
    modules: [createCustomerModule(createInMemoryCustomerRepository())],
  })
  const response = await app.handle(
    new Request("http://localhost/customers/missing", {
      method: "DELETE",
    }),
  )

  expect(response.status).toBe(404)
})
```

**Step 2: Run tests to verify they fail**

Run: `bun run test`
Expected: The 4 new tests FAIL (routes don't exist yet)

**Step 3: Add update and remove to service**

In `apps/server/src/modules/customer/service.ts`, add to the `createCustomerService` return object, after `create`:

```typescript
async update(id: string, input: UpdateCustomerInput) {
  const name = input.name?.trim()
  if (name !== undefined && name.length === 0) {
    throw new AppError({
      code: "CUSTOMER_NAME_REQUIRED",
      message: "Customer name is required",
      status: 400,
      expose: true,
    })
  }

  const updated = await repository.update(id, {
    ...input,
    ...(name !== undefined ? { name } : {}),
  })

  if (!updated) {
    throw new AppError({
      code: "CUSTOMER_NOT_FOUND",
      message: "Customer not found",
      status: 404,
      expose: true,
      details: { id },
    })
  }

  return updated
},
async remove(id: string) {
  const deleted = await repository.remove(id)

  if (!deleted) {
    throw new AppError({
      code: "CUSTOMER_NOT_FOUND",
      message: "Customer not found",
      status: 404,
      expose: true,
      details: { id },
    })
  }
},
```

Update the import to include `UpdateCustomerInput`:

```typescript
import type { CreateCustomerInput, CustomerRepository, UpdateCustomerInput } from "./repository"
```

**Step 4: Add PUT and DELETE routes to module**

In `apps/server/src/modules/customer/module.ts`, add after the POST route block, inside the `register` return chain:

```typescript
.put(
  "/customers/:id",
  async ({ params, body }) => service.update(params.id, body),
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      status: t.Optional(
        t.Union([t.Literal("active"), t.Literal("inactive")]),
      ),
    }),
    detail: {
      tags: ["customer"],
      summary: "Update customer",
    },
  },
)
.delete(
  "/customers/:id",
  async ({ params, set }) => {
    await service.remove(params.id)
    set.status = 204
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["customer"],
      summary: "Delete customer",
    },
  },
)
```

**Step 5: Run tests to verify they pass**

Run: `bun run test`
Expected: ALL tests PASS (8 original + 4 new = 12)

**Step 6: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 7: Commit**

```bash
git add apps/server/src/modules/customer/service.ts apps/server/src/modules/customer/module.ts apps/server/src/app.test.ts
git commit -m "feat(server): add PUT /customers/:id and DELETE /customers/:id routes"
```

---

### Task 4: API Client — add updateCustomer and deleteCustomer

**Files:**
- Modify: `apps/example-vue/src/lib/platform-api.ts`

**Step 1: Add the two functions**

Append after `createCustomer` in `platform-api.ts`:

```typescript
export const updateCustomer = async (
  id: string,
  input: { name?: string; status?: "active" | "inactive" },
): Promise<CustomerRecord> => {
  const response = await fetch(`${SERVER_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Update customer failed with status ${response.status}`)
  }

  return response.json() as Promise<CustomerRecord>
}

export const deleteCustomer = async (id: string): Promise<void> => {
  const response = await fetch(`${SERVER_URL}/customers/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Delete customer failed with status ${response.status}`)
  }
}
```

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/example-vue/src/lib/platform-api.ts
git commit -m "feat(vue): add updateCustomer and deleteCustomer to API client"
```

---

### Task 5: Vue — add inline edit and delete to customer cards

**Files:**
- Modify: `apps/example-vue/src/App.vue`

This is the largest change. The design approach:

- Each customer card gets an "Edit" button and a "Delete" button
- Clicking "Edit" turns that card into an inline form (pre-filled)
- Clicking "Delete" shows a confirm prompt, then deletes
- A new `editingId` ref tracks which card is in edit mode
- The "Create" form stays as-is on the right sidebar

**Step 1: Add new refs and imports**

Replace the script section. Key additions:
- Import `updateCustomer` and `deleteCustomer` from the API client
- Add `editingId` ref to track which customer is being edited
- Add `editForm` ref for the inline edit form state
- Add `deleteConfirmId` ref for delete confirmation
- Add `startEdit`, `cancelEdit`, `submitEdit`, `confirmDelete` handler functions

Full updated `<script setup>`:

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

import {
  type CustomerRecord,
  type PlatformResponse,
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  fetchPlatform,
  fetchSystemModules,
  updateCustomer,
} from "./lib/platform-api"

const platform = ref<PlatformResponse | null>(null)
const customerItems = ref<CustomerRecord[]>([])
const loading = ref(true)
const customerLoading = ref(false)
const errorMessage = ref("")
const customerErrorMessage = ref("")
const customerModuleReady = ref(false)
const envName = ref("unknown")

const customerForm = ref({
  name: "",
  status: "active" as "active" | "inactive",
})

const editingId = ref<string | null>(null)
const editForm = ref({
  name: "",
  status: "active" as "active" | "inactive",
})

const deleteConfirmId = ref<string | null>(null)

const customerCountLabel = computed(() => {
  const count = customerItems.value.length
  return `${count.toString().padStart(2, "0")} active records in view`
})

const reloadCustomers = async () => {
  if (!customerModuleReady.value) {
    customerItems.value = []
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    const payload = await fetchCustomers()
    customerItems.value = payload.items
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to load customers"
  } finally {
    customerLoading.value = false
  }
}

const submitCustomer = async () => {
  if (!customerModuleReady.value || customerLoading.value) {
    return
  }

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    await createCustomer({
      name: customerForm.value.name,
      status: customerForm.value.status,
    })

    customerForm.value = {
      name: "",
      status: "active",
    }

    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to create customer"
    customerLoading.value = false
  }
}

const startEdit = (customer: CustomerRecord) => {
  editingId.value = customer.id
  deleteConfirmId.value = null
  editForm.value = {
    name: customer.name,
    status: customer.status,
  }
}

const cancelEdit = () => {
  editingId.value = null
}

const submitEdit = async () => {
  if (!editingId.value || customerLoading.value) return

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    await updateCustomer(editingId.value, {
      name: editForm.value.name,
      status: editForm.value.status,
    })
    editingId.value = null
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to update customer"
    customerLoading.value = false
  }
}

const requestDelete = (id: string) => {
  deleteConfirmId.value = id
  editingId.value = null
}

const cancelDelete = () => {
  deleteConfirmId.value = null
}

const confirmDelete = async () => {
  if (!deleteConfirmId.value || customerLoading.value) return

  customerLoading.value = true
  customerErrorMessage.value = ""

  try {
    await deleteCustomer(deleteConfirmId.value)
    deleteConfirmId.value = null
    await reloadCustomers()
  } catch (error) {
    customerErrorMessage.value =
      error instanceof Error ? error.message : "Failed to delete customer"
    customerLoading.value = false
  }
}

onMounted(async () => {
  try {
    const [platformPayload, modulePayload] = await Promise.all([
      fetchPlatform(),
      fetchSystemModules(),
    ])

    platform.value = platformPayload
    envName.value = modulePayload.env
    customerModuleReady.value = modulePayload.modules.includes("customer")

    await reloadCustomers()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to load platform view"
  } finally {
    loading.value = false
  }
})
</script>
```

**Step 2: Update the customer card template**

Replace the customer card article (the `<article v-for="customer in customerItems">` block) with:

```html
<article
  v-for="customer in customerItems"
  :key="customer.id"
  class="customer-card grid gap-4 rounded-[1.75rem] p-5"
  :class="editingId === customer.id ? 'md:grid-cols-[1fr]' : 'md:grid-cols-[1.3fr_0.7fr_0.8fr_auto]'"
>
  <!-- View mode -->
  <template v-if="editingId !== customer.id && deleteConfirmId !== customer.id">
    <div>
      <p class="text-xs uppercase tracking-[0.28em] text-stone-500">Name</p>
      <h3 class="mt-2 text-2xl text-white">{{ customer.name }}</h3>
      <p class="mt-3 text-xs uppercase tracking-[0.24em] text-stone-500">
        {{ customer.id }}
      </p>
    </div>

    <div>
      <p class="text-xs uppercase tracking-[0.28em] text-stone-500">Status</p>
      <p
        class="mt-3 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.28em]"
        :class="
          customer.status === 'active'
            ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
            : 'border-amber-300/30 bg-amber-400/10 text-amber-200'
        "
      >
        {{ customer.status }}
      </p>
    </div>

    <div>
      <p class="text-xs uppercase tracking-[0.28em] text-stone-500">Updated</p>
      <p class="mt-3 text-sm leading-6 text-stone-300">
        {{ new Date(customer.updatedAt).toLocaleString() }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="action-button-sm"
        :disabled="customerLoading"
        @click="startEdit(customer)"
      >
        Edit
      </button>
      <button
        type="button"
        class="action-button-sm action-button-danger"
        :disabled="customerLoading"
        @click="requestDelete(customer.id)"
      >
        Delete
      </button>
    </div>
  </template>

  <!-- Edit mode -->
  <form
    v-if="editingId === customer.id"
    class="space-y-4"
    @submit.prevent="submitEdit"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <label class="field">
        <span class="field-label">Customer Name</span>
        <input
          v-model="editForm.name"
          class="field-input"
          maxlength="120"
          placeholder="Customer name"
        />
      </label>

      <label class="field">
        <span class="field-label">Status</span>
        <select v-model="editForm.status" class="field-input">
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </label>
    </div>

    <div class="flex gap-3">
      <button
        type="submit"
        class="action-button-sm"
        :disabled="editForm.name.trim().length === 0"
      >
        Save
      </button>
      <button
        type="button"
        class="action-button-sm action-button-ghost"
        @click="cancelEdit"
      >
        Cancel
      </button>
    </div>
  </form>

  <!-- Delete confirm mode -->
  <div
    v-if="deleteConfirmId === customer.id"
    class="flex items-center gap-4"
  >
    <p class="text-sm text-rose-200">
      Delete <strong>{{ customer.name }}</strong>?
    </p>
    <button
      type="button"
      class="action-button-sm action-button-danger"
      :disabled="customerLoading"
      @click="confirmDelete"
    >
      Confirm
    </button>
    <button
      type="button"
      class="action-button-sm action-button-ghost"
      @click="cancelDelete"
    >
      Cancel
    </button>
  </div>
</article>
```

**Step 3: Add button styles**

In `apps/example-vue/src/style.css`, append before the closing:

```css
.action-button-sm {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #f5f5f4;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  transition: background 160ms ease, border-color 160ms ease;
}

.action-button-sm:hover:enabled {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.action-button-sm:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.action-button-danger {
  border-color: rgba(244, 63, 94, 0.3);
  color: #fda4af;
}

.action-button-danger:hover:enabled {
  background: rgba(244, 63, 94, 0.15);
  border-color: rgba(244, 63, 94, 0.5);
}

.action-button-ghost {
  border-color: transparent;
  color: #a8a29e;
}

.action-button-ghost:hover {
  color: #d6d3d1;
}
```

**Step 4: Verify build**

Run: `bun run build:vue`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add apps/example-vue/src/App.vue apps/example-vue/src/style.css
git commit -m "feat(vue): add inline edit and delete to customer cards"
```

---

### Task 6: Environment setup — .env.example and README update

**Files:**
- Create: `.env.example`
- Modify: `README.md`

**Step 1: Create `.env.example`**

```bash
# ─── Server ───────────────────────────────────────────────
# Application environment: development | test | production
APP_ENV=development

# Server port
PORT=3000

# Log level: debug | info | warn | error
LOG_LEVEL=debug

# PostgreSQL connection string (required for customer module)
# DATABASE_URL=postgres://user:password@localhost:5432/elysian

# ─── Vue Example ──────────────────────────────────────────
# Backend API base URL (used by apps/example-vue)
VITE_API_BASE_URL=http://localhost:3000
```

**Step 2: Update README.md quick start section**

Replace the "快速开始" section content with:

```markdown
## 快速开始

### 前置条件

- [Bun](https://bun.sh) >= 1.3
- PostgreSQL（用于完整 CRUD 体验；不配置时 server 以纯系统模式启动）

### 安装与启动

```bash
# 1. 安装依赖
bun install

# 2. 复制环境配置（可选：配置数据库连接）
cp .env.example .env

# 3. 启动服务端
bun run dev:server

# 4. 启动 Vue 前端（另开终端）
bun run dev:vue
```

### 连接数据库

如需启用 Customer 模块的完整 CRUD：

1. 确保 PostgreSQL 运行中
2. 在 `.env` 中设置 `DATABASE_URL=postgres://user:pass@localhost:5432/elysian`
3. 执行迁移：`bun run db:migrate`
4. 重启 server

不配置 `DATABASE_URL` 时，server 仅注册 system 模块（`/health`、`/platform`、`/system/modules`），前端展示模块离线状态。
```

Keep the "常用命令" table and everything after it unchanged.

**Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: add .env.example and update quick start guide"
```

---

### Task 7: Final verification

**Step 1: Run full check**

Run: `bun run check`
Expected: lint PASS, typecheck PASS, all tests PASS

**Step 2: Run Vue build**

Run: `bun run build:vue`
Expected: Build succeeds

**Step 3: Manual smoke test** (if database available)

1. Set `DATABASE_URL` in `.env`
2. `bun run db:migrate`
3. `bun run dev:server`
4. `bun run dev:vue`
5. Open Vue app → Create a customer → Edit it → Delete it → Verify list updates
