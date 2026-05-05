import { type SQL, and, asc, desc, eq, ilike, or, sql } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import { buildPaginatedResult, normalizePagination } from "./query-utils"
import { type CustomerRow, customers } from "./schema"
import { DEFAULT_TENANT_ID } from "./tenant"

export interface CreateCustomerPersistenceInput {
  name: string
  status?: CustomerRow["status"]
  deptId?: string | null
  creatorId?: string | null
  tenantId?: string
}

export interface CustomerPersistenceQueryOptions {
  accessCondition?: SQL<unknown>
  listQuery?: CustomerPersistenceListQuery
}

export interface CustomerPersistenceListQuery {
  q?: string
  status?: CustomerRow["status"]
  page?: number
  pageSize?: number
  sortBy?: "createdAt" | "name"
  sortOrder?: "asc" | "desc"
}

export interface CustomerPersistenceListResult {
  items: CustomerRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const DEFAULT_CUSTOMER_PAGE_SIZE = 20
type CustomerReadableDb = Pick<DatabaseClient, "select">
type CustomerInsertDb = Pick<DatabaseClient, "insert">
type CustomerUpdateDb = Pick<DatabaseClient, "update">
type CustomerDeleteDb = Pick<DatabaseClient, "delete">

export const listCustomers = async (
  db: CustomerReadableDb,
  options: CustomerPersistenceQueryOptions = {},
): Promise<CustomerPersistenceListResult> => {
  const query = normalizeCustomerListQuery(options.listQuery)
  const whereCondition = buildCustomerWhereCondition(
    options.accessCondition,
    query,
  )
  const [countRow] = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(customers)
    .where(whereCondition)

  const total = countRow?.total ?? 0
  const pagination = buildPaginatedResult([], total, query)
  const orderByClause =
    query.sortBy === "name"
      ? query.sortOrder === "asc"
        ? asc(customers.name)
        : desc(customers.name)
      : query.sortOrder === "asc"
        ? asc(customers.createdAt)
        : desc(customers.createdAt)
  const items = await db
    .select()
    .from(customers)
    .where(whereCondition)
    .orderBy(orderByClause)
    .limit(query.pageSize)
    .offset((pagination.page - 1) * query.pageSize)

  return {
    ...pagination,
    items,
  }
}

export const getCustomerById = async (
  db: CustomerReadableDb,
  id: string,
  options: CustomerPersistenceQueryOptions = {},
): Promise<CustomerRow | null> => {
  const conditions = [eq(customers.id, id), options.accessCondition].filter(
    Boolean,
  )
  const [row] = await db
    .select()
    .from(customers)
    .where(and(...conditions))
    .limit(1)

  return row ?? null
}

export const insertCustomer = async (
  db: CustomerInsertDb,
  input: CreateCustomerPersistenceInput,
): Promise<CustomerRow> => {
  const [row] = await db
    .insert(customers)
    .values({
      name: input.name,
      status: input.status ?? "active",
      deptId: input.deptId ?? null,
      creatorId: input.creatorId ?? null,
      tenantId: input.tenantId ?? DEFAULT_TENANT_ID,
    })
    .returning()

  if (!row) {
    throw new Error("Customer insert did not return a row")
  }

  return row
}

export const updateCustomer = async (
  db: CustomerUpdateDb,
  id: string,
  input: Partial<Omit<CreateCustomerPersistenceInput, never>>,
  options: CustomerPersistenceQueryOptions = {},
): Promise<CustomerRow | null> => {
  const conditions = [eq(customers.id, id), options.accessCondition].filter(
    Boolean,
  )
  const [row] = await db
    .update(customers)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(...conditions))
    .returning()

  return row ?? null
}

export const deleteCustomer = async (
  db: CustomerDeleteDb,
  id: string,
  options: CustomerPersistenceQueryOptions = {},
): Promise<boolean> => {
  const conditions = [eq(customers.id, id), options.accessCondition].filter(
    Boolean,
  )
  const result = await db
    .delete(customers)
    .where(and(...conditions))
    .returning()

  return result.length > 0
}

const normalizeCustomerListQuery = (
  query: CustomerPersistenceListQuery | undefined,
): Required<Omit<CustomerPersistenceListQuery, "status">> & {
  status: CustomerRow["status"] | ""
} => {
  const pagination = normalizePagination(query, DEFAULT_CUSTOMER_PAGE_SIZE)

  return {
    q: query?.q?.trim() ?? "",
    status:
      query?.status === "active" || query?.status === "inactive"
        ? query.status
        : "",
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: query?.sortBy === "name" ? "name" : "createdAt",
    sortOrder: query?.sortOrder === "asc" ? "asc" : "desc",
  }
}

const buildCustomerWhereCondition = (
  accessCondition: SQL<unknown> | undefined,
  query: ReturnType<typeof normalizeCustomerListQuery>,
) => {
  const conditions: SQL<unknown>[] = []

  if (accessCondition) {
    conditions.push(accessCondition)
  }

  if (query.q.length > 0) {
    const searchPattern = `%${query.q}%`
    const searchCondition = or(
      ilike(customers.name, searchPattern),
      ilike(customers.id, searchPattern),
    )

    if (searchCondition) {
      conditions.push(searchCondition)
    }
  }

  if (query.status === "active" || query.status === "inactive") {
    conditions.push(eq(customers.status, query.status))
  }

  return conditions.length > 0 ? and(...conditions) : undefined
}
