export type AppLocale = 'en' | 'zh-CN'

export function normalizeLocale(value: string | null | undefined): AppLocale {
  return value?.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

const CORE_STRINGS = {
  en: {
    unknownError: 'An unknown error occurred.',
    authenticationFailed: 'Sign-in failed. Check the email address and app password.',
    certificateFailed: 'The server certificate could not be verified. The connection was refused to protect the account.',
    connectionTimeout: 'The mail server connection timed out. Check the network and IMAP settings.',
    mailOperationFailed: 'The mail operation failed.',
    saveAttachmentTitle: 'Save Mail Attachment',
    save: 'Save',
    accountNotFound: 'The email account could not be found.',
    accountAlreadyAdded: 'This email account has already been added.',
    secureStorageUnavailable: 'Secure storage is unavailable on this system. The account was not saved.',
    accountStoreReadFailed: 'The local account data could not be read.',
    imapHostRequired: 'Enter an IMAP server address.',
    imapPortInvalid: 'The IMAP port is invalid.',
    usernameRequired: 'Enter the sign-in username.',
    passwordRequired: 'Enter an app password or authorization code.',
    noSubject: '(No Subject)',
    unknownSender: 'Unknown Sender',
    messageIdInvalid: 'The message identifier is invalid.',
    messageNotFound: 'The message does not exist or has been removed from the server.',
    unnamedAttachment: 'Untitled Attachment',
    attachmentIdInvalid: 'The attachment identifier is invalid.',
    attachmentNotFound: 'The attachment could not be found.'
  },
  'zh-CN': {
    unknownError: '发生未知错误。',
    authenticationFailed: '登录失败，请检查邮箱账号、应用密码或授权码。',
    certificateFailed: '服务器证书验证失败。为保护账号，应用已拒绝连接。',
    connectionTimeout: '连接邮箱服务器超时，请检查网络和 IMAP 设置。',
    mailOperationFailed: '邮箱操作失败。',
    saveAttachmentTitle: '保存邮件附件',
    save: '保存',
    accountNotFound: '找不到该邮箱账号。',
    accountAlreadyAdded: '这个邮箱已经添加过了。',
    secureStorageUnavailable: '当前系统的安全存储不可用，账号没有保存。',
    accountStoreReadFailed: '无法读取本地账号数据。',
    imapHostRequired: '请填写 IMAP 服务器地址。',
    imapPortInvalid: 'IMAP 端口无效。',
    usernameRequired: '请填写登录用户名。',
    passwordRequired: '请填写应用密码或授权码。',
    noSubject: '（无主题）',
    unknownSender: '未知发件人',
    messageIdInvalid: '邮件编号无效。',
    messageNotFound: '邮件不存在，或已从服务器删除。',
    unnamedAttachment: '未命名附件',
    attachmentIdInvalid: '附件编号无效。',
    attachmentNotFound: '找不到该附件。'
  }
} as const

export type CoreStringKey = keyof typeof CORE_STRINGS.en

export function coreString(locale: AppLocale, key: CoreStringKey): string {
  return CORE_STRINGS[locale][key]
}
