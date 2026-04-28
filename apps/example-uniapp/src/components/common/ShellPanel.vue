<template>
  <view class="shell-panel">
    <slot />
  </view>
</template>

<style scoped>
.shell-panel {
  background: #ffffff;
  border: 2rpx solid rgba(15, 23, 42, 0.08);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}
</style>
