import type { ComputedRef, Ref } from "vue"
import { computed, ref, watch } from "vue"
import type { ElyFormField, ElyFormValues } from "./contracts"

export interface UseElyFormDirtyStateReturn {
  readonly value: boolean
  resetSnapshot: () => void
}

const serializeSnapshot = (
  fields: ElyFormField[],
  values: ElyFormValues,
): string => {
  const entries = fields.map((f) => [f.key, values[f.key] ?? ""])
  return JSON.stringify(entries)
}

export const useElyFormDirtyState = (
  fields:
    | (() => ElyFormField[])
    | ComputedRef<ElyFormField[]>
    | Ref<ElyFormField[]>,
  values: (() => ElyFormValues) | Ref<ElyFormValues>,
): UseElyFormDirtyStateReturn => {
  const resolveFields = () =>
    typeof fields === "function"
      ? fields()
      : "value" in fields
        ? (fields as Ref<ElyFormField[]>).value
        : fields

  const resolveValues = () =>
    typeof values === "function"
      ? values()
      : (values as Ref<ElyFormValues>).value

  let snapshot = serializeSnapshot(resolveFields(), resolveValues())
  const dirtyCounter = ref(0)

  const dirty = computed<boolean>(() => {
    dirtyCounter.value
    const current = serializeSnapshot(resolveFields(), resolveValues())
    return current !== snapshot
  })

  const resetSnapshot = () => {
    snapshot = serializeSnapshot(resolveFields(), resolveValues())
    dirtyCounter.value++
  }

  if (typeof values !== "function") {
    watch(values as Ref<ElyFormValues>, () => dirtyCounter.value++, {
      deep: true,
    })
  }

  return {
    get value() {
      return dirty.value
    },
    resetSnapshot,
  }
}
