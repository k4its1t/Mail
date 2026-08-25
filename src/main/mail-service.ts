import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import sanitizeHtml from 'sanitize-html'
import type { AccountInput, MessageDetail, MessageSummary } from '../shared/types'

type MailAccount = AccountInput & { id: string }

const MAX_LIMIT = 200

function clampLimit(limit = 50): number {
  if (!Number.isFinite(limit)) return 50
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)))
}

function validateAccount(account: AccountInput): void {
  if (!account.imapHost.trim()) throw new Error('请填写 IMAP 服务器地址。')
  if (!Number.isInteger(account.imapPort) || account.imapPort < 1 || account.imapPort > 65535) {
    throw new Error('IMAP 端口无效。')
  }
  if (!account.username.trim()) throw new Error('请填写登录用户名。')
  if (!account.password) throw new Error('请填写应用密码或授权码。')
}

function createClient(account: AccountInput): ImapFlow {
  validateAccount(account)
  return new ImapFlow({
    host: account.imapHost.trim(),
    port: account.imapPort,
    secure: account.secure,
    auth: {
      user: account.username.trim(),
      pass: account.password
    },
    logger: false,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  })
}

function addressText(addresses: Array<{ name?: string; address?: string }> | undefined): string {
  if (!addresses?.length) return ''
  return addresses
    .map((item) => (item.name ? `${item.name} <${item.address ?? ''}>` : item.address ?? ''))
    .filter(Boolean)
    .join(', ')
}

function attachmentInStructure(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const part = node as Record<string, unknown>
  const disposition = String(part.disposition ?? '').toLowerCase()
  if (disposition === 'attachment') return true

  const parameters = part.parameters as Record<string, unknown> | undefined
  const dispositionParameters = part.dispositionParameters as Record<string, unknown> | undefined
  if (parameters?.name || dispositionParameters?.filename) return true

  const children = part.childNodes
  return Array.isArray(children) && children.some(attachmentInStructure)
}

function summaryFromMessage(accountId: string, message: Record<string, unknown>): MessageSummary {
  const envelope = (message.envelope ?? {}) as Record<string, unknown>
  const from = (envelope.from ?? []) as Array<{ name?: string; address?: string }>
  const firstFrom = from[0]
  const flags = message.flags instanceof Set ? message.flags : new Set<string>()
  const uid = Number(message.uid)
  const messageDate = envelope.date instanceof Date
    ? envelope.date
    : message.internalDate instanceof Date
      ? message.internalDate
      : new Date()

  return {
    id: `${accountId}:${uid}`,
    accountId,
    uid,
    subject: String(envelope.subject || '（无主题）'),
    fromName: firstFrom?.name || firstFrom?.address || '未知发件人',
    fromAddress: firstFrom?.address || '',
    to: addressText((envelope.to ?? []) as Array<{ name?: string; address?: string }>),
    date: messageDate.toISOString(),
    unread: !flags.has('\\Seen'),
    flagged: flags.has('\\Flagged'),
    hasAttachments: attachmentInStructure(message.bodyStructure),
    size: Number(message.size || 0)
  }
}

export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'div', 'span', 'br', 'a', 'strong', 'em', 'b', 'i', 'u', 's',
      'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'hr'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      })
    },
    disallowedTagsMode: 'discard'
  })
}

export async function testImapConnection(account: AccountInput): Promise<void> {
  const client = createClient(account)
  try {
    await client.connect()
    await client.mailboxOpen('INBOX', { readOnly: true })
  } finally {
    if (client.usable) await client.logout().catch(() => undefined)
  }
}

export async function fetchMessageSummaries(account: MailAccount, requestedLimit = 50): Promise<MessageSummary[]> {
  const client = createClient(account)
  const limit = clampLimit(requestedLimit)
  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX', { readOnly: true })
    try {
      const mailbox = client.mailbox
      const exists = mailbox ? mailbox.exists : 0
      if (!exists) return []
      const start = Math.max(1, exists - limit + 1)
      const messages: MessageSummary[] = []
      for await (const message of client.fetch(`${start}:${exists}`, {
        uid: true,
        envelope: true,
        flags: true,
        internalDate: true,
        bodyStructure: true,
        size: true
      })) {
        messages.push(summaryFromMessage(account.id, message as unknown as Record<string, unknown>))
      }
      return messages.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    } finally {
      lock.release()
    }
  } finally {
    if (client.usable) await client.logout().catch(() => undefined)
  }
}

export async function fetchMessageDetail(account: MailAccount, uid: number): Promise<MessageDetail> {
  if (!Number.isInteger(uid) || uid < 1) throw new Error('邮件编号无效。')
  const client = createClient(account)
  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX', { readOnly: true })
    try {
      const message = await client.fetchOne(uid, {
        uid: true,
        envelope: true,
        flags: true,
        internalDate: true,
        bodyStructure: true,
        size: true,
        source: true
      }, { uid: true })
      if (!message || !message.source) throw new Error('邮件不存在，或已从服务器删除。')

      const parsed = await simpleParser(message.source, {
        skipImageLinks: true,
        maxHtmlLengthToParse: 2_000_000
      })
      const summary = summaryFromMessage(account.id, message as unknown as Record<string, unknown>)
      const rawHtml = typeof parsed.html === 'string' ? parsed.html : parsed.textAsHtml || ''

      return {
        ...summary,
        html: sanitizeEmailHtml(rawHtml),
        text: parsed.text || '',
        messageId: parsed.messageId || '',
        attachments: parsed.attachments.map((attachment, index) => ({
          index,
          filename: attachment.filename || '未命名附件',
          contentType: attachment.contentType,
          size: attachment.size
        }))
      }
    } finally {
      lock.release()
    }
  } finally {
    if (client.usable) await client.logout().catch(() => undefined)
  }
}

export async function fetchAttachment(
  account: MailAccount,
  uid: number,
  attachmentIndex: number
): Promise<{ filename: string; contentType: string; content: Buffer }> {
  if (!Number.isInteger(uid) || uid < 1) throw new Error('邮件编号无效。')
  if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0) throw new Error('附件编号无效。')

  const client = createClient(account)
  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX', { readOnly: true })
    try {
      const message = await client.fetchOne(uid, { source: true }, { uid: true })
      if (!message || !message.source) throw new Error('邮件不存在，或已从服务器删除。')
      const parsed = await simpleParser(message.source, { skipImageLinks: true })
      const attachment = parsed.attachments[attachmentIndex]
      if (!attachment) throw new Error('找不到该附件。')
      return {
        filename: attachment.filename || `attachment-${attachmentIndex + 1}`,
        contentType: attachment.contentType,
        content: attachment.content
      }
    } finally {
      lock.release()
    }
  } finally {
    if (client.usable) await client.logout().catch(() => undefined)
  }
}
