import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { app, safeStorage } from 'electron'
import type { AccountInput, AccountPublic } from '../shared/types'

interface StoredAccount extends AccountPublic {
  encryptedPassword: string
}

interface StoreShape {
  version: 1
  accounts: StoredAccount[]
}

const EMPTY_STORE: StoreShape = { version: 1, accounts: [] }

export class AccountStore {
  private readonly filePath: string

  constructor(filePath = join(app.getPath('userData'), 'accounts.json')) {
    this.filePath = filePath
  }

  async list(): Promise<AccountPublic[]> {
    const data = await this.readStore()
    return data.accounts.map(({ encryptedPassword: _secret, ...account }) => account)
  }

  async getDecrypted(accountId: string): Promise<AccountInput & { id: string }> {
    const data = await this.readStore()
    const account = data.accounts.find((item) => item.id === accountId)
    if (!account) throw new Error('找不到该邮箱账号。')

    const password = await this.decrypt(account.encryptedPassword)
    return {
      id: account.id,
      label: account.label,
      email: account.email,
      username: account.username,
      password,
      provider: account.provider,
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      secure: account.secure,
      color: account.color
    }
  }

  async add(input: AccountInput): Promise<AccountPublic> {
    const data = await this.readStore()
    const normalizedEmail = input.email.trim().toLowerCase()
    if (data.accounts.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      throw new Error('这个邮箱已经添加过了。')
    }

    const account: StoredAccount = {
      id: randomUUID(),
      label: input.label.trim() || normalizedEmail,
      email: normalizedEmail,
      username: input.username.trim() || normalizedEmail,
      provider: input.provider,
      imapHost: input.imapHost.trim(),
      imapPort: input.imapPort,
      secure: input.secure,
      color: input.color,
      createdAt: new Date().toISOString(),
      encryptedPassword: await this.encrypt(input.password)
    }
    data.accounts.push(account)
    await this.writeStore(data)
    const { encryptedPassword: _secret, ...publicAccount } = account
    return publicAccount
  }

  async remove(accountId: string): Promise<void> {
    const data = await this.readStore()
    const nextAccounts = data.accounts.filter((item) => item.id !== accountId)
    if (nextAccounts.length === data.accounts.length) return
    await this.writeStore({ ...data, accounts: nextAccounts })
  }

  private async encrypt(value: string): Promise<string> {
    const available = await safeStorage.isAsyncEncryptionAvailable()
    if (!available) throw new Error('当前系统的安全存储不可用，账号没有保存。')
    const encrypted = await safeStorage.encryptStringAsync(value)
    return encrypted.toString('base64')
  }

  private async decrypt(value: string): Promise<string> {
    const encrypted = Buffer.from(value, 'base64')
    const decrypted = await safeStorage.decryptStringAsync(encrypted)
    return decrypted.result
  }

  private async readStore(): Promise<StoreShape> {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw) as Partial<StoreShape>
      if (parsed.version !== 1 || !Array.isArray(parsed.accounts)) return { ...EMPTY_STORE }
      return parsed as StoreShape
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException
      if (nodeError.code === 'ENOENT') return { ...EMPTY_STORE }
      throw new Error('无法读取本地账号数据。')
    }
  }

  private async writeStore(data: StoreShape): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    const temporaryPath = `${this.filePath}.tmp`
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 })
    await rename(temporaryPath, this.filePath)
  }
}
