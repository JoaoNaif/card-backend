import jwt from 'jsonwebtoken'
import type { Encrypter } from './core/encrypter'
import type { Decrypter } from './core/decrypter'

export class JwtEncrypter implements Encrypter, Decrypter {
  private secret = process.env.JWT_SECRET ?? 'default-secret'

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, this.secret, { expiresIn: '7d' }, (err, token) => {
        if (err || !token) return reject(err)
        resolve(token)
      })
    })
  }

  decrypt(token: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (err, decoded) => {
        if (err || !decoded) return reject(err)
        resolve(decoded as Record<string, unknown>)
      })
    })
  }
}
