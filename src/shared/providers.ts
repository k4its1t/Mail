import type { ProviderId, ProviderPreset } from './types'

export const PROVIDERS: Record<ProviderId, ProviderPreset> = {
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    host: 'imap.gmail.com',
    port: 993,
    secure: true
  },
  outlook: {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    host: 'outlook.office365.com',
    port: 993,
    secure: true
  },
  icloud: {
    id: 'icloud',
    name: 'iCloud Mail',
    host: 'imap.mail.me.com',
    port: 993,
    secure: true
  },
  yahoo: {
    id: 'yahoo',
    name: 'Yahoo Mail',
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true
  },
  qq: {
    id: 'qq',
    name: 'QQ Mail',
    host: 'imap.qq.com',
    port: 993,
    secure: true
  },
  netease: {
    id: 'netease',
    name: 'NetEase 163 / 126',
    host: 'imap.163.com',
    port: 993,
    secure: true
  },
  custom: {
    id: 'custom',
    name: 'Other IMAP',
    host: '',
    port: 993,
    secure: true
  }
}

export function getProviderPreset(provider: ProviderId): ProviderPreset {
  return PROVIDERS[provider]
}
