import type { Request, Response } from 'express'

export class LogoutUserController {
  handle = [
    async (_req: Request, res: Response): Promise<void> => {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      res.status(200).json({ message: 'Logged out successfully.' })
    },
  ]
}
