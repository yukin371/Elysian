export const createPasswordHash = (password: string) =>
  Bun.password.hash(password)

export const verifyPasswordHash = (password: string, passwordHash: string) =>
  Bun.password.verify(password, passwordHash)
