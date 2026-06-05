import { injectable } from 'tsyringe'
import bcrypt from 'bcrypt'
import { IHasher } from '~/common/contracts/hasher.contract'

@injectable()
export class BcryptHasher implements IHasher {
  private readonly saltRounds = 10

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds)
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash)
  }
}
