import { LogoutUserController } from '../logout-user.controller'

export function makeLogoutUserController(): LogoutUserController {
  const logoutUserController = new LogoutUserController()

  return logoutUserController
}
