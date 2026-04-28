<template>
  <view class="page-shell">
    <view class="hero-band">
      <text class="eyebrow">Elysian</text>
      <text class="title">欢迎登录</text>
      <text class="description">
        使用当前账号访问个人中心与站内通知。
      </text>
    </view>

    <ShellPanel>
      <view class="stack">
        <input v-model="username" class="field" placeholder="用户名" />
        <input v-model="password" class="field" password placeholder="密码" />
        <input
          v-model="tenantCode"
          class="field"
          placeholder="租户代码（可选）"
        />
        <button
          class="button-primary"
          :disabled="submitting"
          :loading="submitting"
          @click="submitLogin"
        >
          {{ submitting ? "登录中..." : "登录" }}
        </button>
        <text v-if="errorMessage" class="error-copy">{{ errorMessage }}</text>
      </view>
    </ShellPanel>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import ShellPanel from "../../components/common/ShellPanel.vue"
import { UNIAPP_ROUTES } from "../../app/routes/index"
import { bootstrapSession } from "../../app/session/use-session-bootstrap"
import { login } from "../../lib/auth/login"
import { getSessionSnapshot } from "../../lib/auth/session"

const username = ref("admin")
const password = ref("admin123")
const tenantCode = ref("")
const submitting = ref(false)
const errorMessage = ref("")

const routeToHome = () => {
  uni.reLaunch({ url: UNIAPP_ROUTES.home })
}

const submitLogin = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = "用户名和密码不能为空"
    return
  }

  submitting.value = true
  errorMessage.value = ""

  try {
    await login({
      username: username.value,
      password: password.value,
      tenantCode: tenantCode.value,
    })
    routeToHome()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "登录失败，请稍后重试"
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (getSessionSnapshot()?.user) {
    routeToHome()
    return
  }

  const identity = await bootstrapSession()

  if (identity?.user) {
    routeToHome()
  }
})
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  background:
    radial-gradient(circle at top left, rgba(36, 87, 214, 0.12) 0%, transparent 42%),
    linear-gradient(180deg, #f4f7fb 0%, #eef3f8 100%);
}

.hero-band {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-bottom: 32rpx;
}

.eyebrow {
  color: #2457d6;
  font-size: 24rpx;
  letter-spacing: 4rpx;
  font-weight: 600;
}

.title {
  font-size: 56rpx;
  font-weight: 700;
  color: #142033;
}

.description {
  font-size: 28rpx;
  line-height: 1.6;
  color: #475569;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.field {
  height: 92rpx;
  border: 2rpx solid rgba(15, 23, 42, 0.08);
  border-radius: 24rpx;
  background: #f8fafc;
  padding: 0 24rpx;
  color: #0f172a;
}

.button-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92rpx;
  border-radius: 24rpx;
  background: #2457d6;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  border: 0;
}

.error-copy {
  color: #b91c1c;
  font-size: 24rpx;
}
</style>
