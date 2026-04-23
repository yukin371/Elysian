<script setup lang="ts">
import {
  Button as AButton,
  Card as ACard,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  List as AList,
  ListItem as AListItem,
  Space as ASpace,
  Tag as ATag,
  Timeline as ATimeline,
  TimelineItem as ATimelineItem,
} from "@arco-design/web-vue"

import type { ElyPreviewSkeletonProps } from "../contracts"
import { vueEnterprisePresetFoundation } from "../index"
import ElyShell from "./ElyShell.vue"

defineProps<ElyPreviewSkeletonProps>()
</script>

<template>
  <ElyShell
    title="Elysian Enterprise"
    subtitle="Official Vue preset"
    workspace-title="Customer operations"
    workspace-description="A structured enterprise shell for role-based workspaces, generator-produced list pages, and future layout templates."
    preset-label="Arco Design Vue"
    :environment="environment"
    :status="status"
    :navigation="navigation"
    :stats="stats"
    :selected-menu-key="selectedMenuKey"
    :user="user"
  >
    <template #header-actions>
      <AButton type="primary">Create policy</AButton>
      <AButton>Export report</AButton>
    </template>

    <template #workspace>
      <ACard :bordered="false" class="ely-preview-card">
        <template #title>Preset contract alignment</template>
        <AList :bordered="false" size="small">
          <AListItem>
            `ui-core` navigation tree drives the sidebar structure.
          </AListItem>
          <AListItem>
            CRUD page metadata still comes from the same customer schema.
          </AListItem>
          <AListItem>
            Future generator output can target this shell without rewriting
            business protocols.
          </AListItem>
        </AList>
      </ACard>

      <ACard :bordered="false" class="ely-preview-card">
        <template #title>Current customer capability</template>
        <ADescriptions :column="2" bordered size="large">
          <ADescriptionsItem label="List">
            {{ canViewCustomers ? "enabled" : "denied" }}
          </ADescriptionsItem>
          <ADescriptionsItem label="Create">
            {{ canCreateCustomers ? "enabled" : "denied" }}
          </ADescriptionsItem>
          <ADescriptionsItem label="Update">
            {{ canUpdateCustomers ? "enabled" : "denied" }}
          </ADescriptionsItem>
          <ADescriptionsItem label="Delete">
            {{ canDeleteCustomers ? "enabled" : "denied" }}
          </ADescriptionsItem>
        </ADescriptions>
      </ACard>
    </template>

    <template #secondary>
      <ACard :bordered="false" class="ely-preview-card">
        <template #title>Theme foundation</template>
        <ASpace direction="vertical" fill>
          <ATag color="arcoblue">Arco shell</ATag>
          <ATag color="green">Protocol stable</ATag>
          <ATag color="gold">Generator ready</ATag>
        </ASpace>
      </ACard>

      <ACard :bordered="false" class="ely-preview-card">
        <template #title>Next extraction targets</template>
        <ATimeline>
          <ATimelineItem>
            Workspace table + query bar wrappers
          </ATimelineItem>
          <ATimelineItem>
            Enterprise form layout sections
          </ATimelineItem>
          <ATimelineItem>
            Generator-facing page template mapping
          </ATimelineItem>
        </ATimeline>
      </ACard>

      <ACard :bordered="false" class="ely-preview-card">
        <template #title>Foundation lock</template>
        <p class="ely-preview-copy">
          {{ vueEnterprisePresetFoundation.designSystem }} was fixed on
          {{ vueEnterprisePresetFoundation.selectionDate }}.
        </p>
      </ACard>
    </template>
  </ElyShell>
</template>

<style scoped>
.ely-preview-card {
  border-radius: 22px;
}

.ely-preview-copy {
  margin: 0;
  line-height: 1.75;
  color: #5f6b7a;
}
</style>
