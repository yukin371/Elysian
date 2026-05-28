<script setup lang="ts">
import type { ElyPublicTableColumn, ElyPublicTableRow } from "./contracts"

withDefaults(
  defineProps<{
    caption?: string
    columns: ElyPublicTableColumn[]
    density?: "comfortable" | "compact"
    description?: string
    rows: ElyPublicTableRow[]
  }>(),
  {
    caption: undefined,
    density: "comfortable",
    description: undefined,
  },
)
</script>

<template>
  <section class="ely-public-table" :data-density="density">
    <div v-if="caption || description" class="ely-public-table__intro">
      <h3 v-if="caption" class="ely-public-table__caption">
        {{ caption }}
      </h3>
      <p v-if="description" class="ely-public-table__description">
        {{ description }}
      </p>
    </div>

    <div class="ely-public-table__scroll" tabindex="0">
      <table class="ely-public-table__table">
        <caption v-if="caption" class="ely-public-table__sr-caption">
          {{ caption }}
        </caption>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :data-align="column.align ?? 'start'"
            >
              <span class="ely-public-table__heading">
                {{ column.label }}
              </span>
              <span
                v-if="column.description"
                class="ely-public-table__heading-description"
              >
                {{ column.description }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.key"
            :data-tone="row.tone ?? 'muted'"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :data-align="column.align ?? 'start'"
            >
              {{ row.cells[column.key] ?? "" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
