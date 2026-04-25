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
    title="Elysian 企业预设"
    subtitle="官方 Vue 预设"
    workspace-title="客户工作区"
    workspace-description="一个面向角色工作台、标准列表页和后续生成模板的结构化企业壳层。"
    preset-label="TDesign Vue 预设"
    :environment="environment"
    :status="status"
    :navigation="navigation"
    :stats="stats"
    :selected-menu-key="selectedMenuKey"
    :user="user"
  >
    <template #header-actions>
      <TButton theme="primary">新建策略</TButton>
      <TButton variant="outline">导出摘要</TButton>
    </template>

    <template #workspace>
      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">预设契约对齐</h3>
        <ul class="ely-preview-list">
          <li>`ui-core` 导航树继续驱动侧栏结构。</li>
          <li>CRUD 页面元数据仍然来自同一份客户 schema。</li>
          <li>
            后续 generator 输出可以直接对接这套壳层，而不需要重写业务协议。
          </li>
        </ul>
      </TCard>

      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">当前客户能力</h3>
        <TDescriptions :column="2" bordered size="large">
          <TDescriptionsItem label="列表">
            {{ canViewCustomers ? "已启用" : "未授权" }}
          </TDescriptionsItem>
          <TDescriptionsItem label="创建">
            {{ canCreateCustomers ? "已启用" : "未授权" }}
          </TDescriptionsItem>
          <TDescriptionsItem label="更新">
            {{ canUpdateCustomers ? "已启用" : "未授权" }}
          </TDescriptionsItem>
          <TDescriptionsItem label="删除">
            {{ canDeleteCustomers ? "已启用" : "未授权" }}
          </TDescriptionsItem>
        </TDescriptions>
      </TCard>
    </template>

    <template #secondary>
      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">基础底座</h3>
        <TSpace direction="vertical" style="width: 100%">
          <span class="ely-preview-pill ely-preview-pill-primary">
            TDesign 壳层
          </span>
          <span class="ely-preview-pill ely-preview-pill-success">
            协议稳定
          </span>
          <span class="ely-preview-pill ely-preview-pill-warning">
            可供生成
          </span>
        </TSpace>
      </TCard>

      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">下一步抽取目标</h3>
        <TTimeline>
          <TTimelineItem>
            工作区表格与查询栏封装
          </TTimelineItem>
          <TTimelineItem>
            企业表单布局分区
          </TTimelineItem>
          <TTimelineItem>
            面向 generator 的页面模板映射
          </TTimelineItem>
        </TTimeline>
      </TCard>

      <TCard :bordered="false" class="ely-preview-card">
        <h3 class="ely-preview-heading">底座锁定</h3>
        <p class="ely-preview-copy">
          {{ vueEnterprisePresetFoundation.designSystem }} 已在
          {{ vueEnterprisePresetFoundation.selectionDate }} 固定为当前企业预设底座。
        </p>
      </TCard>
    </template>
  </ElyShell>
</template>

<style scoped>
.ely-preview-card {
  border-radius: 16px;
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
  background: rgba(36, 87, 214, 0.1);
  color: #2457d6;
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
