import { injectable } from 'tsyringe'
import bcrypt from 'bcrypt'
import { IPasswordHasher } from '~/core/security/password-hasher.service.interface'

@injectable()
export class PasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds)
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash)
  }
}
