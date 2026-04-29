<template>
  <view class="page-shell">
    <text class="page-title">通知列表</text>
    <text class="page-copy">查看当前账号收到的站内通知。</text>

    <view class="toolbar">
      <text class="toolbar-copy">
        {{ loading ? "正在加载..." : `共 ${notifications.length} 条通知` }}
      </text>
      <button class="ghost-button" @click="loadNotifications">刷新</button>
    </view>

    <text v-if="errorMessage" class="error-copy">{{ errorMessage }}</text>
    <text v-else-if="loading" class="status-copy">正在同步通知列表...</text>
    <text v-else-if="notifications.length === 0" class="status-copy">
      当前没有可展示的通知。
    </text>

    <view v-else class="stack">
      <navigator
        v-for="notification in notifications"
        :key="notification.id"
        class="message-card"
        :url="buildNotificationDetailRoute(notification.id)"
      >
        <view class="message-main">
          <view class="message-row">
            <text class="message-title">{{ notification.title }}</text>
            <text
              :class="[
                'status-pill',
                notification.status === 'read' ? 'status-read' : 'status-unread',
              ]"
            >
              {{ notification.status === "read" ? "已读" : "未读" }}
            </text>
          </view>
          <text class="message-meta">
            {{ formatLevel(notification.level) }} · {{ formatTime(notification.createdAt) }}
          </text>
          <text class="message-preview">{{ notification.content }}</text>
        </view>
      </navigator>
    </view>

    <navigator class="ghost-link" :url="UNIAPP_ROUTES.home">返回首页</navigator>
  </view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app"
import { ref } from "vue"

import { UNIAPP_ROUTES, buildNotificationDetailRoute } from "../../app/routes"
import { bootstrapSession } from "../../app/session/use-session-bootstrap"
import { getAccessToken, getSessionSnapshot } from "../../lib/auth/session"
import {
  type NotificationLevel,
  type NotificationRecord,
  fetchNotifications,
} from "../../lib/notifications/list"

const notifications = ref<NotificationRecord[]>([])
const loading = ref(true)
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

const loadNotifications = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const user = await ensureSession()

    if (!user) {
      routeToLogin()
      return
    }

    const response = await fetchNotifications({
      recipientUserId: user.id,
    })
    notifications.value = response.items
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "通知列表加载失败"
  } finally {
    loading.value = false
  }
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

onShow(() => {
  void loadNotifications()
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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.toolbar-copy {
  font-size: 24rpx;
  color: #2457d6;
}

.ghost-button {
  min-height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #eef4ff;
  color: #2457d6;
  border: 0;
  font-size: 24rpx;
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
  gap: 18rpx;
}

.message-card {
  display: flex;
  align-items: flex-start;
  min-height: 140rpx;
  border: 2rpx solid rgba(15, 23, 42, 0.08);
  border-radius: 32rpx;
  padding: 24rpx;
  background: #ffffff;
  color: #142033;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.message-main {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  width: 100%;
}

.message-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.message-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #142033;
}

.message-meta {
  font-size: 22rpx;
  color: #64748b;
}

.message-preview {
  font-size: 26rpx;
  line-height: 1.6;
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

.ghost-link {
  color: #2457d6;
  font-size: 28rpx;
}
</style>
