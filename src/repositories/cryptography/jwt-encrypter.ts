import jwt from 'jsonwebtoken'
import type { Encrypter } from './core/encrypter'

export class JwtEncrypter implements Encrypter {
  private secret = process.env.JWT_SECRET ?? 'default-secret'

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, this.secret, { expiresIn: '7d' }, (err, token) => {
        if (err || !token) return reject(err)
        resolve(token)
      })
    })
  }
}
