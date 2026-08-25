import type { AppLocale } from './i18n'

export type ProviderId = 'gmail' | 'outlook' | 'icloud' | 'yahoo' | 'qq' | 'netease' | 'custom'

export interface ProviderPreset {
  id: ProviderId
  name: string
  host: string
  port: number
  secure: boolean
}

export interface AccountInput {
  label: string
  email: string
  username: string
  password: string
  provider: ProviderId
  imapHost: string
  imapPort: number
  secure: boolean
  color: string
}

export interface AccountPublic {
  id: string
  label: string
  email: string
  username: string
  provider: ProviderId
  imapHost: string
  imapPort: number
  secure: boolean
  color: string
  createdAt: string
}

export interface MessageSummary {
  id: string
  accountId: string
  uid: number
  subject: string
  fromName: string
  fromAddress: string
  to: string
  date: string
  unread: boolean
  flagged: boolean
  hasAttachments: boolean
  size: number
}

export interface MessageDetail extends MessageSummary {
  html: string
  text: string
  messageId: string
  attachments: Array<{
    index: number
    filename: string
    contentType: string
    size: number
  }>
}

export interface SyncError {
  accountId: string
  message: string
}

export interface SyncResult {
  messages: MessageSummary[]
  errors: SyncError[]
  syncedAt: string
}

export interface MailApi {
  setLocale(locale: AppLocale): Promise<void>
  listAccounts(): Promise<AccountPublic[]>
  addAccount(input: AccountInput): Promise<AccountPublic>
  removeAccount(accountId: string): Promise<void>
  testConnection(input: AccountInput): Promise<{ ok: true }>
  syncAll(limit?: number): Promise<SyncResult>
  syncAccount(accountId: string, limit?: number): Promise<MessageSummary[]>
  getMessage(accountId: string, uid: number): Promise<MessageDetail>
  downloadAttachment(accountId: string, uid: number, attachmentIndex: number): Promise<{ saved: boolean; path?: string }>
}

declare global {
  interface Window {
    mail: MailApi
  }
}
