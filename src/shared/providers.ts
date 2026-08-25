import type { ProviderId, ProviderPreset } from './types'

export const PROVIDERS: Record<ProviderId, ProviderPreset> = {
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    credentialHint: '请使用 Google 应用专用密码；普通登录密码通常不可用。'
  },
  outlook: {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    host: 'outlook.office365.com',
    port: 993,
    secure: true,
    credentialHint: '微软通常要求 OAuth。此 MVP 仅适用于仍允许应用密码的账号。'
  },
  icloud: {
    id: 'icloud',
    name: 'iCloud Mail',
    host: 'imap.mail.me.com',
    port: 993,
    secure: true,
    credentialHint: '请在 Apple ID 设置中生成 App 专用密码。'
  },
  yahoo: {
    id: 'yahoo',
    name: 'Yahoo Mail',
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true,
    credentialHint: '请在 Yahoo 账号安全设置中生成应用密码。'
  },
  qq: {
    id: 'qq',
    name: 'QQ 邮箱',
    host: 'imap.qq.com',
    port: 993,
    secure: true,
    credentialHint: '请先开启 IMAP 服务，并使用邮箱生成的授权码。'
  },
  netease: {
    id: 'netease',
    name: '网易 163 / 126',
    host: 'imap.163.com',
    port: 993,
    secure: true,
    credentialHint: '请先开启 IMAP 服务，并使用客户端授权密码。126 邮箱需手动改主机名。'
  },
  custom: {
    id: 'custom',
    name: '其他 IMAP 邮箱',
    host: '',
    port: 993,
    secure: true,
    credentialHint: '请向邮箱管理员获取 IMAP 主机、端口和客户端密码。'
  }
}

export function getProviderPreset(provider: ProviderId): ProviderPreset {
  return PROVIDERS[provider]
}
