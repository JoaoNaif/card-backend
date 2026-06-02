import type { Request, Response, NextFunction } from 'express'
import { JwtEncrypter } from '../repositories/cryptography/jwt-encrypter'

const jwtEncrypter = new JwtEncrypter()

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.token as string | undefined

  if (!token) {
    res.status(401).json({ message: 'Not authenticated.' })
    return
  }

  try {
    const payload = await jwtEncrypter.decrypt(token)
    req.user = { sub: payload.sub as string }
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' })
  }
}
