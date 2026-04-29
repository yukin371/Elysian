<template>
  <view class="page-shell">
    <text class="page-title">通知详情</text>
    <text class="page-copy">查看通知正文与当前已读状态。</text>

    <text v-if="errorMessage" class="error-copy">{{ errorMessage }}</text>
    <text v-else-if="loading" class="status-copy">正在加载通知详情...</text>

    <ShellPanel v-else-if="notification">
      <view class="stack">
        <view class="detail-header">
          <text class="detail-title">{{ notification.title }}</text>
          <text
            :class="[
              'status-pill',
              notification.status === 'read' ? 'status-read' : 'status-unread',
            ]"
          >
            {{ notification.status === "read" ? "已读" : "未读" }}
          </text>
        </view>
        <text class="detail-meta">
          {{ formatLevel(notification.level) }} · {{ formatTime(notification.createdAt) }}
        </text>
        <text class="detail-body">{{ notification.content }}</text>
        <button
          v-if="notification.status !== 'read'"
          class="button-primary"
          :disabled="markingRead"
          :loading="markingRead"
          @click="markAsRead"
        >
          {{ markingRead ? "处理中..." : "标记已读" }}
        </button>
      </view>
    </ShellPanel>

    <text v-else class="status-copy">未找到通知详情。</text>

    <button class="ghost-link button-reset" @click="goBack">返回通知列表</button>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app"
import { ref } from "vue"

import { UNIAPP_ROUTES } from "../../app/routes"
import { bootstrapSession } from "../../app/session/use-session-bootstrap"
import ShellPanel from "../../components/common/ShellPanel.vue"
import { getAccessToken, getSessionSnapshot } from "../../lib/auth/session"
import type {
  NotificationLevel,
  NotificationRecord,
} from "../../lib/notifications/list"
import {
  fetchNotificationById,
  markNotificationAsRead,
} from "../../lib/notifications/read"

const notification = ref<NotificationRecord | null>(null)
const notificationId = ref("")
const loading = ref(true)
const markingRead = ref(false)
const errorMessage = ref("")

const routeToLogin = () => {
  uni.reLaunch({ url: UNIAPP_ROUTES.login })
}

const ensureSession = async () => {
  if (getSessionSnapshot()?.user && getAccessToken()) {
    return getSessionSnapshot()?.user ?? null
  }

  const identity = await bootstrapSession()
  return identity?.user ?? null
}

const loadNotification = async () => {
  if (!notificationId.value) {
    errorMessage.value = "缺少通知标识"
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ""

  try {
    const user = await ensureSession()

    if (!user) {
      routeToLogin()
      return
    }

    notification.value = await fetchNotificationById(notificationId.value)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "通知详情加载失败"
  } finally {
    loading.value = false
  }
}

const markAsRead = async () => {
  if (!notification.value || notification.value.status === "read") {
    return
  }

  markingRead.value = true

  try {
    notification.value = await markNotificationAsRead(notification.value.id)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "通知已读更新失败"
  } finally {
    markingRead.value = false
  }
}

const goBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: UNIAPP_ROUTES.notifications })
}

const formatLevel = (level: NotificationLevel) => {
  switch (level) {
    case "success":
      return "成功"
    case "warning":
      return "警告"
    case "error":
      return "错误"
    default:
      return "信息"
  }
}

const formatTime = (value: string) =>
  new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  })

onLoad((query) => {
  notificationId.value = typeof query?.id === "string" ? query.id : ""
  void loadNotification()
})
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #142033;
}

.page-copy {
  font-size: 28rpx;
  line-height: 1.6;
  color: #475569;
}

.error-copy {
  color: #b91c1c;
  font-size: 24rpx;
}

.status-copy {
  font-size: 26rpx;
  color: #64748b;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #142033;
}

.detail-meta {
  font-size: 22rpx;
  color: #64748b;
}

.detail-body {
  font-size: 28rpx;
  line-height: 1.7;
  color: #475569;
}

.status-pill {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.status-unread {
  background: #dcfce7;
  color: #166534;
}

.status-read {
  background: #e2e8f0;
  color: #475569;
}

.button-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: 24rpx;
  background: #2457d6;
  color: #ffffff;
  border: 0;
  font-size: 28rpx;
  font-weight: 600;
}

.ghost-link {
  color: #2457d6;
  font-size: 28rpx;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
}

.button-reset::after {
  border: 0;
}
</style>
