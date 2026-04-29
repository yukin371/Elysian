<template>
  <view class="page-shell">
    <text class="page-title">个人中心</text>
    <text class="page-copy">查看当前账号信息，并进入通知列表。</text>

    <ShellPanel>
      <view class="stack">
        <text v-if="loading" class="section-title">正在恢复登录态...</text>
        <template v-else-if="sessionUser">
          <text class="section-title">当前登录用户</text>
          <text class="summary-line">{{ sessionUser.displayName }}</text>
          <text class="summary-line">{{ sessionUser.username }}</text>
          <text class="summary-line">tenant: {{ sessionUser.tenantId }}</text>
        </template>
        <text v-else class="section-title">当前未登录，将返回登录页。</text>
        <navigator class="link-card" :url="UNIAPP_ROUTES.notifications">
          通知列表
        </navigator>
        <button class="link-card button-reset" @click="signOut">退出登录</button>
      </view>
    </ShellPanel>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { UNIAPP_ROUTES } from "../../app/routes/index"
import { bootstrapSession } from "../../app/session/use-session-bootstrap"
import ShellPanel from "../../components/common/ShellPanel.vue"
import { fetchCurrentIdentity, logout } from "../../lib/auth/login"
import { getAccessToken, getSessionSnapshot } from "../../lib/auth/session"

const loading = ref(true)
const sessionUser = ref(getSessionSnapshot()?.user ?? null)

const routeToLogin = () => {
  uni.reLaunch({ url: UNIAPP_ROUTES.login })
}

const loadIdentity = async () => {
  loading.value = true

  try {
    if (!sessionUser.value || !getAccessToken()) {
      const bootstrapped = await bootstrapSession()

      if (!bootstrapped) {
        routeToLogin()
        return
      }

      sessionUser.value = getSessionSnapshot()?.user ?? null
    } else {
      const identity = await fetchCurrentIdentity()
      sessionUser.value = identity.user
    }
  } catch {
    routeToLogin()
    return
  } finally {
    loading.value = false
  }
}

const signOut = async () => {
  await logout()
  routeToLogin()
}

onMounted(() => {
  void loadIdentity()
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

.stack {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.section-title {
  font-size: 26rpx;
  color: #2457d6;
}

.summary-line {
  font-size: 28rpx;
  color: #334155;
}

.link-card {
  display: flex;
  align-items: center;
  min-height: 84rpx;
  border-radius: 24rpx;
  background: #eef4ff;
  padding: 0 24rpx;
  color: #1d4ed8;
  font-size: 28rpx;
  font-weight: 600;
  border: 0;
  justify-content: center;
}

.button-reset {
  width: 100%;
}
</style>
