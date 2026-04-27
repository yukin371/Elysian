import { describe, expect, test } from "bun:test"

import type { DepartmentRecord } from "./platform-api"

import {
  createDefaultDepartmentDraft,
  createDepartmentBlockedParentIds,
  createDepartmentParentLookup,
  createDepartmentParentOptions,
  createDepartmentTableItems,
  filterDepartments,
  normalizeDepartmentSort,
  normalizeDepartmentStatus,
  normalizeDepartmentText,
  normalizeOptionalDepartmentId,
  resolveDepartmentSelection,
} from "./department-workspace"

const createDepartment = (
  overrides: Partial<DepartmentRecord> & Pick<DepartmentRecord, "id">,
): DepartmentRecord => ({
  id: overrides.id,
  parentId: overrides.parentId ?? null,
  code: overrides.code ?? overrides.id,
  name: overrides.name ?? `dept:${overrides.id}`,
  sort: overrides.sort ?? 10,
  status: overrides.status ?? "active",
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-27T08:00:00.000Z",
})

describe("department workspace helpers", () => {
  const departments = [
    createDepartment({
      id: "dept_root_ops",
      code: "ops",
      name: "Operations",
      sort: 10,
      status: "active",
    }),
    createDepartment({
      id: "dept_child_noc",
      parentId: "dept_root_ops",
      code: "noc",
      name: "Network Operations",
      sort: 20,
      status: "disabled",
    }),
    createDepartment({
      id: "dept_root_hr",
      code: "hr",
      name: "Human Resources",
      sort: 30,
      status: "active",
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultDepartmentDraft()).toEqual({
      parentId: "",
      code: "",
      name: "",
      sort: 10,
      status: "active",
    })

    expect(normalizeDepartmentText("  ops  ")).toBe("ops")
    expect(normalizeOptionalDepartmentId("  dept_root_ops  ")).toBe(
      "dept_root_ops",
    )
    expect(normalizeOptionalDepartmentId("   ")).toBeUndefined()
    expect(normalizeDepartmentSort("25")).toBe(25)
    expect(normalizeDepartmentSort("bad")).toBe(10)
    expect(normalizeDepartmentStatus("disabled")).toBe("disabled")
    expect(normalizeDepartmentStatus("unknown")).toBe("active")
  })

  test("filters departments across code, name, and status", () => {
    expect(
      filterDepartments(departments, { code: "noc" }).map(
        (department) => department.id,
      ),
    ).toEqual(["dept_child_noc"])

    expect(
      filterDepartments(departments, { name: "human" }).map(
        (department) => department.id,
      ),
    ).toEqual(["dept_root_hr"])

    expect(
      filterDepartments(departments, { status: "active" }).map(
        (department) => department.id,
      ),
    ).toEqual(["dept_root_ops", "dept_root_hr"])
  })

  test("keeps the current selection when the department remains visible", () => {
    expect(resolveDepartmentSelection(departments, "dept_child_noc")).toBe(
      "dept_child_noc",
    )
  })

  test("falls back to the first visible department when the previous selection disappears", () => {
    const activeDepartments = departments.filter(
      (department) => department.status === "active",
    )

    expect(
      resolveDepartmentSelection(activeDepartments, "dept_child_noc"),
    ).toBe("dept_root_ops")
  })

  test("blocks the current department and its descendants from parent options", () => {
    expect(
      Array.from(
        createDepartmentBlockedParentIds(departments, "dept_root_ops"),
      ).sort(),
    ).toEqual(["dept_child_noc", "dept_root_ops"])

    expect(
      createDepartmentParentOptions(
        departments,
        "dept_root_ops",
        "Root Department",
      ),
    ).toEqual([
      { label: "Root Department", value: "" },
      { label: "Human Resources", value: "dept_root_hr" },
    ])
  })

  test("maps parent labels, status, and timestamps for table display", () => {
    expect(
      createDepartmentTableItems(departments, {
        parentLookup: createDepartmentParentLookup(departments),
        rootLabel: "Root Department",
        localizeStatus: (status) => `status:${status}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "dept_root_ops",
        parentId: "Root Department",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "dept_child_noc",
        parentId: "Operations",
        status: "status:disabled",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "dept_root_hr",
        parentId: "Root Department",
        status: "status:active",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        updatedAt: "time:2026-04-27T08:00:00.000Z",
      }),
    ])
  })
})
