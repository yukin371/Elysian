<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { DatePicker as TDatePicker } from "tdesign-vue-next/es/date-picker"
import { Form as TForm, FormItem as TFormItem } from "tdesign-vue-next/es/form"
import { Input as TInput } from "tdesign-vue-next/es/input"
import { InputNumber as TInputNumber } from "tdesign-vue-next/es/input-number"
import { Select as TSelect } from "tdesign-vue-next/es/select"
import { Space as TSpace } from "tdesign-vue-next/es/space"
import { Switch as TSwitch } from "tdesign-vue-next/es/switch"
import { Textarea as TTextarea } from "tdesign-vue-next/es/textarea"
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
    return value
      ? (props.copy?.switchEnabled ?? "启用")
      : (props.copy?.switchDisabled ?? "停用")
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
    <TForm
      :data="form"
      layout="vertical"
      class="ely-form-inner"
      :on-submit="({ validateResult }) => validateResult === true && handleSubmit()"
    >
      <TFormItem
        v-for="field in fields"
        :key="field.key"
        :name="field.key"
        :label="field.label"
        :required-mark="field.required"
      >
        <template v-if="readonly">
          <div class="ely-readonly-value">
            {{ formatReadonlyValue(field, form[field.key]) }}
          </div>
        </template>

        <template v-else-if="field.input === 'text'">
          <TInput
            v-model="form[field.key]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || loading"
            clearable
          />
        </template>

        <template v-else-if="field.input === 'textarea'">
          <TTextarea
            v-model="form[field.key]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || loading"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </template>

        <template v-else-if="field.input === 'number'">
          <TInputNumber
            v-model="form[field.key]"
            :disabled="field.disabled || loading"
            style="width: 100%"
          />
        </template>

        <template v-else-if="field.input === 'switch'">
          <TSwitch v-model="form[field.key]" :disabled="field.disabled || loading" />
        </template>

        <template v-else-if="field.input === 'select'">
          <TSelect
            v-model="form[field.key]"
            :placeholder="field.placeholder ?? `Select ${field.label}`"
            :disabled="field.disabled || loading"
            :options="field.options"
            clearable
            style="width: 100%"
          />
        </template>

        <template v-else-if="field.input === 'date'">
          <TDatePicker
            v-model="form[field.key]"
            clearable
            :disabled="field.disabled || loading"
            style="width: 100%"
          />
        </template>

        <template v-else-if="field.input === 'datetime'">
          <TDatePicker
            v-model="form[field.key]"
            enable-time-picker
            clearable
            :disabled="field.disabled || loading"
            style="width: 100%"
          />
        </template>
      </TFormItem>

      <TFormItem v-if="!readonly">
        <TSpace>
          <TButton theme="primary" type="submit" :loading="loading">
            {{ copy?.submitButton ?? "提交" }}
          </TButton>
          <TButton @click="handleCancel">
            {{ copy?.cancelButton ?? "取消" }}
          </TButton>
        </TSpace>
      </TFormItem>
    </TForm>
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
