<script setup lang="ts">
import { Button as TButton } from "tdesign-vue-next/es/button"
import { Card as TCard } from "tdesign-vue-next/es/card"
import {
  Descriptions as TDescriptions,
  DescriptionsItem as TDescriptionsItem,
} from "tdesign-vue-next/es/descriptions"
import { Space as TSpace } from "tdesign-vue-next/es/space"
import {
  Timeline as TTimeline,
  TimelineItem as TTimelineItem,
} from "tdesign-vue-next/es/timeline"

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
    preset-label="TDesign Vue Next"
    :environment="environment"
    :status="status"
    :navigation="navigation"
    :stats="stats"
    :selected-menu-key="selectedMenuKey"
    :user="user"
  >
    <template #header-actions>
      <TButton theme="primary">Create policy</TButton>
      <TButton variant="outline">Export report</TButton>
    </template>

    <template #workspace>
      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">Preset contract alignment</h3>
        <ul class="ely-preview-list">
          <li>`ui-core` navigation tree drives the sidebar structure.</li>
          <li>CRUD page metadata still comes from the same customer schema.</li>
          <li>
            Future generator output can target this shell without rewriting
            business protocols.
          </li>
        </ul>
      </TCard>

      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">Current customer capability</h3>
        <TDescriptions :column="2" bordered size="large">
          <TDescriptionsItem label="List">
            {{ canViewCustomers ? "enabled" : "denied" }}
          </TDescriptionsItem>
          <TDescriptionsItem label="Create">
            {{ canCreateCustomers ? "enabled" : "denied" }}
          </TDescriptionsItem>
          <TDescriptionsItem label="Update">
            {{ canUpdateCustomers ? "enabled" : "denied" }}
          </TDescriptionsItem>
          <TDescriptionsItem label="Delete">
            {{ canDeleteCustomers ? "enabled" : "denied" }}
          </TDescriptionsItem>
        </TDescriptions>
      </TCard>
    </template>

    <template #secondary>
      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">Theme foundation</h3>
        <TSpace direction="vertical" style="width: 100%">
          <span class="ely-preview-pill ely-preview-pill-primary">
            TDesign shell
          </span>
          <span class="ely-preview-pill ely-preview-pill-success">
            Protocol stable
          </span>
          <span class="ely-preview-pill ely-preview-pill-warning">
            Generator ready
          </span>
        </TSpace>
      </TCard>

      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">Next extraction targets</h3>
        <TTimeline>
          <TTimelineItem>
            Workspace table + query bar wrappers
          </TTimelineItem>
          <TTimelineItem>
            Enterprise form layout sections
          </TTimelineItem>
          <TTimelineItem>
            Generator-facing page template mapping
          </TTimelineItem>
        </TTimeline>
      </TCard>

      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">Foundation lock</h3>
        <p class="ely-preview-copy">
          {{ vueEnterprisePresetFoundation.designSystem }} was fixed on
          {{ vueEnterprisePresetFoundation.selectionDate }}.
        </p>
      </TCard>
    </template>
  </ElyShell>
</template>

<style scoped>
.ely-preview-card {
  border-radius: 22px;
}

.ely-preview-heading {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.ely-preview-copy {
  margin: 0;
  line-height: 1.75;
  color: #5f6b7a;
}

.ely-preview-list {
  margin: 0;
  padding-left: 1rem;
  color: #475569;
}

.ely-preview-list li + li {
  margin-top: 0.65rem;
}

.ely-preview-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.ely-preview-pill-primary {
  background: rgba(29, 78, 216, 0.1);
  color: #1d4ed8;
}

.ely-preview-pill-success {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.ely-preview-pill-warning {
  background: rgba(217, 119, 6, 0.12);
  color: #b45309;
}
</style>
