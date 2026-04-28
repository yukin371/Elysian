import { bootstrapSession } from "../session/use-session-bootstrap"

export const useAppBootstrap = async () => {
  await bootstrapSession()
}
