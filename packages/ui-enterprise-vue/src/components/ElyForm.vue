<script setup lang="ts">
import {
  Button as AButton,
  DatePicker as ADatePicker,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  Option as AOption,
  Select as ASelect,
  Space as ASpace,
  Switch as ASwitch,
} from "@arco-design/web-vue"
import { reactive, watch } from "vue"

import type {
  ElyFormEmits,
  ElyFormField,
  ElyFormProps,
  ElyFormValues,
} from "../contracts"

const props = defineProps<ElyFormProps>()
const emit = defineEmits<ElyFormEmits>()

const form = reactive<ElyFormValues>({})

const getDefaultFieldValue = (field: ElyFormField) =>
  field.input === "switch" ? false : ""

const syncFormValues = () => {
  const nextValues = Object.fromEntries(
    props.fields.map((field) => [
      field.key,
      props.values?.[field.key] ?? getDefaultFieldValue(field),
    ]),
  )

  for (const key of Object.keys(form)) {
    if (!(key in nextValues)) {
      delete form[key]
    }
  }

  for (const [key, value] of Object.entries(nextValues)) {
    form[key] = value
  }
}

const formatReadonlyValue = (field: ElyFormField, value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  if (field.input === "switch") {
    return value ? "Enabled" : "Disabled"
  }

  if (field.input === "select" && field.options) {
    return (
      field.options.find((option) => option.value === value)?.label ??
      String(value)
    )
  }

  if (field.input === "date" || field.input === "datetime") {
    return new Date(String(value)).toLocaleString()
  }

  return String(value)
}

watch(
  () => [props.fields, props.values] as const,
  () => {
    syncFormValues()
  },
  {
    immediate: true,
    deep: true,
  },
)

const handleSubmit = () => emit("submit", { ...form })
const handleCancel = () => emit("cancel")
</script>

<template>
  <div class="ely-form">
    <AForm
      :model="form"
      layout="vertical"
      class="ely-form-inner"
      @submit="handleSubmit"
    >
      <AFormItem
        v-for="field in fields"
        :key="field.key"
        :field="field.key"
        :label="field.label"
        :required="field.required"
      >
        <template v-if="readonly">
          <div class="ely-readonly-value">
            {{ formatReadonlyValue(field, form[field.key]) }}
          </div>
        </template>

        <template v-else-if="field.input === 'text'">
          <AInput
            v-model="form[field.key]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || loading"
            allow-clear
          />
        </template>

        <template v-else-if="field.input === 'textarea'">
          <AInput
            v-model="form[field.key]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || loading"
            textarea
            :auto-size="{ minRows: 3, maxRows: 6 }"
            allow-clear
          />
        </template>

        <template v-else-if="field.input === 'number'">
          <AInputNumber
            v-model="form[field.key]"
            :disabled="field.disabled || loading"
            style="width: 100%"
          />
        </template>

        <template v-else-if="field.input === 'switch'">
          <ASwitch v-model="form[field.key]" :disabled="field.disabled || loading" />
        </template>

        <template v-else-if="field.input === 'select'">
          <ASelect
            v-model="form[field.key]"
            :placeholder="field.placeholder ?? `Select ${field.label}`"
            :disabled="field.disabled || loading"
            style="width: 100%"
          >
            <AOption
              v-for="opt in field.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </AOption>
          </ASelect>
        </template>

        <template v-else-if="field.input === 'date'">
          <ADatePicker
            v-model="form[field.key]"
            :disabled="field.disabled || loading"
            style="width: 100%"
          />
        </template>

        <template v-else-if="field.input === 'datetime'">
          <ADatePicker
            v-model="form[field.key]"
            show-time
            :disabled="field.disabled || loading"
            style="width: 100%"
          />
        </template>
      </AFormItem>

      <AFormItem v-if="!readonly">
        <ASpace>
          <AButton type="primary" html-type="submit" :loading="loading">
            Submit
          </AButton>
          <AButton @click="handleCancel">Cancel</AButton>
        </ASpace>
      </AFormItem>
    </AForm>
  </div>
</template>

<style scoped>
.ely-form {
  padding: 8px 4px;
}

.ely-form-inner {
  max-width: 560px;
}

.ely-readonly-value {
  min-height: 46px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.9);
  color: #0f172a;
}
</style>
