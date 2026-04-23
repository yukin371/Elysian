<script setup lang="ts">
import {
  Button as AButton,
  DatePicker as ADatePicker,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Option as AOption,
  Select as ASelect,
  Space as ASpace,
} from "@arco-design/web-vue"
import { reactive } from "vue"

import type {
  ElyQueryBarEmits,
  ElyQueryBarProps,
  ElyQueryValues,
} from "../contracts"

const props = defineProps<ElyQueryBarProps>()
const emit = defineEmits<ElyQueryBarEmits>()

const values = reactive<ElyQueryValues>({})

const handleSearch = () => emit("search", { ...values })

const handleReset = () => {
  for (const key of Object.keys(values)) {
    values[key] = undefined
  }
  emit("reset")
}
</script>

<template>
  <div class="ely-query-bar">
    <AForm :model="values" layout="inline" @submit="handleSearch">
      <AFormItem v-for="field in fields" :key="field.key" :field="field.key">
        <template v-if="field.kind === 'text'">
          <AInput
            v-model="values[field.key]"
            :placeholder="field.placeholder ?? `Search ${field.label}…`"
            allow-clear
            style="width: 200px"
          />
        </template>

        <template v-else-if="field.kind === 'select'">
          <ASelect
            v-model="values[field.key]"
            :placeholder="field.placeholder ?? field.label"
            allow-clear
            style="width: 160px"
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

        <template v-else-if="field.kind === 'date-range'">
          <ADatePicker
            v-model="values[field.key]"
            range
            style="width: 260px"
          />
        </template>

        <template v-else-if="field.kind === 'status'">
          <ASelect
            v-model="values[field.key]"
            placeholder="Select status"
            allow-clear
            style="width: 140px"
          >
            <AOption value="active">active</AOption>
            <AOption value="inactive">inactive</AOption>
          </ASelect>
        </template>
      </AFormItem>

      <AFormItem>
        <ASpace>
          <AButton type="primary" html-type="submit" :loading="loading">
            Search
          </AButton>
          <AButton @click="handleReset">Reset</AButton>
        </ASpace>
      </AFormItem>
    </AForm>
  </div>
</template>

<style scoped>
.ely-query-bar {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.06);
}
</style>
