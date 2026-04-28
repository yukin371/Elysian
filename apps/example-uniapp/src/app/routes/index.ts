export const UNIAPP_ROUTES = {
  login: "/pages/login/index",
  home: "/pages/home/index",
  notifications: "/pages/notifications/index",
  notificationDetail: "/pages/notification-detail/index",
} as const

export type UniappRoutePath =
  (typeof UNIAPP_ROUTES)[keyof typeof UNIAPP_ROUTES]

export const buildNotificationDetailRoute = (notificationId: string) =>
  `${UNIAPP_ROUTES.notificationDetail}?id=${encodeURIComponent(notificationId)}`
