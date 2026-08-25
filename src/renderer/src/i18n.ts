import type { AppLocale } from '../../shared/i18n'
import type { ProviderId } from '../../shared/types'

const EN = {
  genericError: 'Something went wrong. Try again.',
  personalFavorites: 'Favorites',
  inbox: 'Inbox',
  smartMailboxes: 'Smart Mailboxes',
  unread: 'Unread',
  starred: 'Starred',
  attachments: 'Attachments',
  mailboxes: 'Mailboxes',
  addMailbox: 'Add Mailbox',
  removeMailbox: 'Remove Mailbox',
  addFirstMailbox: 'Add Your First Mailbox',
  localFirst: 'Local First',
  credentialsEncrypted: 'Credentials encrypted by the system',
  exitDemo: 'Exit Demo',
  language: 'Language',
  search: 'Search',
  refresh: 'Refresh',
  dismiss: 'Dismiss',
  syncFailures: '{count} mailbox(es) failed to sync: {accounts}',
  setupTitle: 'Add an Email Account',
  setupDescription: 'Connect Gmail, iCloud, Yahoo, QQ Mail, NetEase, or another IMAP account and read messages in one inbox.',
  addEmail: 'Add Email Account',
  viewDemo: 'View Demo',
  localProcessing: 'Processed locally',
  systemEncryption: 'System encryption',
  remoteImagesBlocked: 'Remote images blocked',
  syncing: 'Reading from mail servers…',
  updatedAt: 'Updated {time}',
  notSynced: 'Not synced yet',
  demoData: 'Demo Data',
  emptyTitle: 'Nothing here',
  noSearchResults: 'No matching messages were found.',
  noMessages: 'This mailbox has no messages to display.',
  loading: 'Loading…',
  loadEarlier: 'Load Earlier Messages',
  selectMessage: 'Select a message to read',
  bodyFetchedOnOpen: 'The message body is fetched only when you open it.',
  backToList: 'Back to Message List',
  recipient: 'To: {recipient}',
  privacyNote: 'Remote images and tracking pixels are blocked for privacy',
  messageView: 'Message View',
  cleanLayout: 'Clean Layout',
  plainText: 'Plain Text',
  noPlainText: 'This message has no plain-text body.',
  attachmentCount: 'Attachments · {count}',
  demo: 'Demo',
  download: 'Download',
  messagesSummary: '{count} messages, {unread} unread',
  mailboxForAccount: 'Inbox — {account}',
  preparingAttachment: 'Preparing attachment…',
  attachmentSaved: 'Attachment saved.',
  removeConfirm: 'Remove “{account}”?\n\nThis removes only the local connection settings and does not affect messages on the server.',
  connectMailbox: 'Connect Mailbox',
  addInbox: 'Add an Inbox',
  readOnlyDescription: 'Mail reads messages through IMAP and does not send or delete server content.',
  close: 'Close',
  provider: 'Email Provider',
  displayName: 'Display Name',
  displayNamePlaceholder: 'For example: Work',
  color: 'Color',
  selectColor: 'Select color {color}',
  emailAddress: 'Email Address',
  username: 'Sign-in Username',
  usernamePlaceholder: 'Usually the email address',
  appPassword: 'App Password / Authorization Code',
  passwordPlaceholder: 'Never displayed or stored in plain text',
  imapServer: 'IMAP Server',
  port: 'Port',
  secureConnection: 'Use a secure TLS connection (recommended)',
  connectionSuccess: 'Connection successful. The account can be saved.',
  localCredentialNote: 'Credentials are encrypted by the operating system and stored locally',
  testing: 'Testing…',
  testConnection: 'Test Connection',
  connecting: 'Connecting…'
} as const

export type TranslationKey = keyof typeof EN

const ZH: Record<TranslationKey, string> = {
  genericError: '操作失败，请稍后重试。',
  personalFavorites: '个人收藏',
  inbox: '收件箱',
  smartMailboxes: '智能邮箱',
  unread: '未读',
  starred: '已加星标',
  attachments: '附件',
  mailboxes: '邮箱',
  addMailbox: '添加邮箱',
  removeMailbox: '移除邮箱',
  addFirstMailbox: '添加第一个邮箱',
  localFirst: '本地优先',
  credentialsEncrypted: '凭据经系统加密',
  exitDemo: '退出演示模式',
  language: '语言',
  search: '搜索',
  refresh: '刷新',
  dismiss: '知道了',
  syncFailures: '{count} 个邮箱同步失败：{accounts}',
  setupTitle: '添加邮箱账号',
  setupDescription: '连接 Gmail、iCloud、Yahoo、QQ、网易或其他支持 IMAP 的邮箱，在统一收件箱中查看邮件。',
  addEmail: '添加邮箱',
  viewDemo: '查看演示',
  localProcessing: '本机处理',
  systemEncryption: '系统加密',
  remoteImagesBlocked: '默认屏蔽远程图片',
  syncing: '正在从邮箱服务器读取…',
  updatedAt: '更新于 {time}',
  notSynced: '尚未同步',
  demoData: '演示数据',
  emptyTitle: '这里很安静',
  noSearchResults: '没有找到匹配的邮件。',
  noMessages: '这个邮箱暂时没有可显示的邮件。',
  loading: '正在加载…',
  loadEarlier: '加载更早的邮件',
  selectMessage: '选择一封邮件开始阅读',
  bodyFetchedOnOpen: '邮件正文只在你打开时从服务器读取。',
  backToList: '返回邮件列表',
  recipient: '收件人：{recipient}',
  privacyNote: '为保护隐私，远程图片与跟踪像素已被拦截',
  messageView: '正文显示',
  cleanLayout: '清洁排版',
  plainText: '纯文本',
  noPlainText: '这封邮件没有可显示的纯文本正文。',
  attachmentCount: '附件 · {count}',
  demo: '演示',
  download: '下载',
  messagesSummary: '{count} 封邮件，{unread} 封未读',
  mailboxForAccount: '收件箱 — {account}',
  preparingAttachment: '正在准备附件…',
  attachmentSaved: '附件已保存。',
  removeConfirm: '移除邮箱“{account}”？\n\n这只会删除本机连接信息，不会影响服务器上的邮件。',
  connectMailbox: '连接邮箱',
  addInbox: '添加一个收件箱',
  readOnlyDescription: '只通过 IMAP 读取邮件，不会发送或删除服务器上的内容。',
  close: '关闭',
  provider: '邮箱服务商',
  displayName: '显示名称',
  displayNamePlaceholder: '例如：工作邮箱',
  color: '标记颜色',
  selectColor: '选择颜色 {color}',
  emailAddress: '邮箱地址',
  username: '登录用户名',
  usernamePlaceholder: '通常与邮箱地址相同',
  appPassword: '应用密码 / 授权码',
  passwordPlaceholder: '不会显示或明文保存',
  imapServer: 'IMAP 服务器',
  port: '端口',
  secureConnection: '使用 TLS 安全连接（推荐）',
  connectionSuccess: '连接成功，可以安全保存账号。',
  localCredentialNote: '凭据由操作系统加密后保存在本机',
  testing: '正在测试…',
  testConnection: '测试连接',
  connecting: '正在连接…'
}

export type Translator = (key: TranslationKey, values?: Record<string, string | number>) => string

export function translator(locale: AppLocale): Translator {
  const strings: Record<TranslationKey, string> = locale === 'zh-CN' ? ZH : EN
  return (key, values = {}) => Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    strings[key]
  )
}

const PROVIDER_NAMES: Record<AppLocale, Record<ProviderId, string>> = {
  en: {
    gmail: 'Gmail', outlook: 'Outlook / Microsoft 365', icloud: 'iCloud Mail',
    yahoo: 'Yahoo Mail', qq: 'QQ Mail', netease: 'NetEase 163 / 126', custom: 'Other IMAP'
  },
  'zh-CN': {
    gmail: 'Gmail', outlook: 'Outlook / Microsoft 365', icloud: 'iCloud 邮箱',
    yahoo: 'Yahoo 邮箱', qq: 'QQ 邮箱', netease: '网易 163 / 126', custom: '其他 IMAP 邮箱'
  }
}

const PROVIDER_HINTS: Record<AppLocale, Record<ProviderId, string>> = {
  en: {
    gmail: 'Use a Google app password. The regular account password usually does not work.',
    outlook: 'Microsoft usually requires OAuth. This version works only with accounts that still allow app passwords.',
    icloud: 'Create an app-specific password in Apple Account settings.',
    yahoo: 'Create an app password in Yahoo account security settings.',
    qq: 'Enable IMAP and use the authorization code generated by QQ Mail.',
    netease: 'Enable IMAP and use a client authorization password. Change the host manually for 126 Mail.',
    custom: 'Ask the email administrator for the IMAP host, port, and client password.'
  },
  'zh-CN': {
    gmail: '请使用 Google 应用专用密码；普通登录密码通常不可用。',
    outlook: '微软通常要求 OAuth。此版本仅适用于仍允许应用密码的账号。',
    icloud: '请在 Apple 账号设置中生成 App 专用密码。',
    yahoo: '请在 Yahoo 账号安全设置中生成应用密码。',
    qq: '请先开启 IMAP 服务，并使用邮箱生成的授权码。',
    netease: '请先开启 IMAP 服务，并使用客户端授权密码。126 邮箱需手动改主机名。',
    custom: '请向邮箱管理员获取 IMAP 主机、端口和客户端密码。'
  }
}

export function providerName(locale: AppLocale, provider: ProviderId): string {
  return PROVIDER_NAMES[locale][provider]
}

export function providerHint(locale: AppLocale, provider: ProviderId): string {
  return PROVIDER_HINTS[locale][provider]
}
