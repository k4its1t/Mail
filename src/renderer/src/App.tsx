import { useEffect, useMemo, useRef, useState } from 'react'
import type { AccountPublic, MessageDetail, MessageSummary, SyncError } from '../../shared/types'
import AccountModal from './AccountModal'
import { demoAccounts, demoDetails, demoMessages, demoPreviews } from './demo'
import {
  AlertIcon, ArrowLeftIcon, EyeIcon, InboxIcon, PaperclipIcon,
  PlusIcon, RefreshIcon, SearchIcon, ShieldIcon, StarIcon, TrashIcon
} from './icons'

type MailFilter = 'all' | 'unread' | 'flagged' | 'attachments'
type ContentMode = 'html' | 'text'

function cleanError(error: unknown): string {
  if (!(error instanceof Error)) return '操作失败，请稍后重试。'
  const parts = error.message.split('Error: ')
  return parts.at(-1)?.trim() || error.message
}

function formatMessageDate(value: string): string {
  const date = new Date(value)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
  }
  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(date)
  }
  return new Intl.DateTimeFormat('zh-CN', { year: '2-digit', month: 'numeric', day: 'numeric' }).format(date)
}

function formatFullDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value))
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function App() {
  const [accounts, setAccounts] = useState<AccountPublic[]>([])
  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<MessageSummary | null>(null)
  const [detail, setDetail] = useState<MessageDetail | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mailFilter, setMailFilter] = useState<MailFilter>('all')
  const [contentMode, setContentMode] = useState<ContentMode>('html')
  const [syncLimit, setSyncLimit] = useState(60)
  const [downloadNotice, setDownloadNotice] = useState('')
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([])
  const [fatalError, setFatalError] = useState('')
  const [lastSynced, setLastSynced] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const initialized = useRef(false)
  const detailRequestId = useRef(0)

  const visibleAccounts = demoMode ? demoAccounts : accounts
  const sourceMessages = demoMode ? demoMessages : messages

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
    return sourceMessages.filter((message) => {
      if (selectedAccount !== 'all' && message.accountId !== selectedAccount) return false
      if (mailFilter === 'unread' && !message.unread) return false
      if (mailFilter === 'flagged' && !message.flagged) return false
      if (mailFilter === 'attachments' && !message.hasAttachments) return false
      if (!normalizedQuery) return true
      return [message.subject, message.fromName, message.fromAddress, message.to]
        .some((value) => value.toLocaleLowerCase('zh-CN').includes(normalizedQuery))
    })
  }, [sourceMessages, selectedAccount, query, mailFilter])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    void initialize()
  }, [])

  async function initialize() {
    try {
      const savedAccounts = await window.mail.listAccounts()
      setAccounts(savedAccounts)
      if (savedAccounts.length) await syncMail()
    } catch (error) {
      setFatalError(cleanError(error))
    }
  }

  async function syncMail(limit = syncLimit) {
    setSyncing(true)
    setFatalError('')
    try {
      const result = await window.mail.syncAll(limit)
      setMessages(result.messages)
      setSyncErrors(result.errors)
      setLastSynced(result.syncedAt)
      if (selectedMessage) {
        const refreshed = result.messages.find((message) => message.id === selectedMessage.id)
        if (!refreshed) {
          clearSelectedMessage()
        }
      }
    } catch (error) {
      setFatalError(cleanError(error))
    } finally {
      setSyncing(false)
    }
  }

  async function openMessage(message: MessageSummary) {
    const requestId = ++detailRequestId.current
    setSelectedMessage(message)
    setDetail(null)
    setContentMode('html')
    setDownloadNotice('')
    setDetailLoading(true)
    try {
      const nextDetail = demoMode
        ? demoDetails[message.id]
        : await window.mail.getMessage(message.accountId, message.uid)
      if (requestId === detailRequestId.current) setDetail(nextDetail)
    } catch (error) {
      if (requestId === detailRequestId.current) setFatalError(cleanError(error))
    } finally {
      if (requestId === detailRequestId.current) setDetailLoading(false)
    }
  }

  function clearSelectedMessage() {
    detailRequestId.current += 1
    setSelectedMessage(null)
    setDetail(null)
    setDetailLoading(false)
  }

  function selectMailbox(accountId: string) {
    setSelectedAccount(accountId)
    setMailFilter('all')
    clearSelectedMessage()
  }

  function selectSmartMailbox(filter: Exclude<MailFilter, 'all'>) {
    setSelectedAccount('all')
    setMailFilter(filter)
    clearSelectedMessage()
  }

  async function downloadAttachment(attachmentIndex: number) {
    if (!selectedMessage || demoMode) return
    setDownloadNotice('正在准备附件…')
    try {
      const result = await window.mail.downloadAttachment(selectedMessage.accountId, selectedMessage.uid, attachmentIndex)
      setDownloadNotice(result.saved ? '附件已保存。' : '')
    } catch (error) {
      setDownloadNotice(cleanError(error))
    }
  }

  async function loadMore() {
    const nextLimit = Math.min(200, syncLimit + 50)
    setSyncLimit(nextLimit)
    await syncMail(nextLimit)
  }

  async function removeAccount(account: AccountPublic) {
    const confirmed = window.confirm(`移除邮箱“${account.label}”？\n\n这只会删除本机连接信息，不会影响服务器上的邮件。`)
    if (!confirmed) return
    try {
      await window.mail.removeAccount(account.id)
      setAccounts((current) => current.filter((item) => item.id !== account.id))
      setMessages((current) => current.filter((message) => message.accountId !== account.id))
      if (selectedAccount === account.id) setSelectedAccount('all')
      if (selectedMessage?.accountId === account.id) {
        clearSelectedMessage()
      }
    } catch (error) {
      setFatalError(cleanError(error))
    }
  }

  function handleAdded(account: AccountPublic) {
    setDemoMode(false)
    setAccounts((current) => [...current, account])
    setShowAccountModal(false)
    selectMailbox(account.id)
    void syncMail()
  }

  function enterDemo() {
    setDemoMode(true)
    selectMailbox('all')
    setSyncErrors([])
    setLastSynced(new Date().toISOString())
  }

  function exitDemo() {
    setDemoMode(false)
    selectMailbox('all')
    setQuery('')
    setMailFilter('all')
  }

  const currentAccount = visibleAccounts.find((account) => account.id === selectedMessage?.accountId)
  const unreadCount = filteredMessages.filter((message) => message.unread).length
  const selectedAccountName = visibleAccounts.find((account) => account.id === selectedAccount)?.label
  const mailboxTitle = selectedAccount !== 'all'
    ? `收件箱 — ${selectedAccountName || '邮箱'}`
    : mailFilter === 'unread'
      ? '未读'
      : mailFilter === 'flagged'
        ? '已加星标'
        : mailFilter === 'attachments'
          ? '附件'
          : '收件箱'

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="邮箱侧边栏">
        <div className="sidebar-titlebar" aria-hidden="true" />
        <div className="sidebar-section-title native-section-title"><span>个人收藏</span></div>
        <button
          className={selectedAccount === 'all' && mailFilter === 'all' ? 'nav-item active' : 'nav-item'}
          onClick={() => selectMailbox('all')}
        >
          <span className="nav-icon"><InboxIcon /></span><span>收件箱</span>
          <b>{sourceMessages.filter((message) => message.unread).length || ''}</b>
        </button>

        <div className="sidebar-section-title native-section-title"><span>智能邮箱</span></div>
        <button className={mailFilter === 'unread' ? 'nav-item active' : 'nav-item'} onClick={() => selectSmartMailbox('unread')}>
          <span className="nav-icon unread-nav-icon" /><span>未读</span>
        </button>
        <button className={mailFilter === 'flagged' ? 'nav-item active' : 'nav-item'} onClick={() => selectSmartMailbox('flagged')}>
          <span className="nav-icon"><StarIcon /></span><span>已加星标</span>
        </button>
        <button className={mailFilter === 'attachments' ? 'nav-item active' : 'nav-item'} onClick={() => selectSmartMailbox('attachments')}>
          <span className="nav-icon"><PaperclipIcon /></span><span>附件</span>
        </button>

        <div className="sidebar-section-title native-section-title"><span>邮箱</span><button onClick={() => setShowAccountModal(true)} aria-label="添加邮箱"><PlusIcon /></button></div>
        <div className="account-list">
          {visibleAccounts.map((account) => {
            const unread = sourceMessages.filter((message) => message.accountId === account.id && message.unread).length
            return (
              <div className="mailbox-account-group" key={account.id}>
                <div className="account-group-name">{account.label}</div>
                <div className={selectedAccount === account.id ? 'account-row active' : 'account-row'}>
                  <button className="account-select" onClick={() => selectMailbox(account.id)}>
                    <span className="nav-icon account-inbox-icon"><InboxIcon /></span>
                    <span className="account-copy"><strong>收件箱</strong><small>{account.email}</small></span>
                    {unread > 0 && <b>{unread}</b>}
                  </button>
                  {!demoMode && <button className="remove-account" onClick={() => void removeAccount(account)} title="移除邮箱"><TrashIcon /></button>}
                </div>
              </div>
            )
          })}
          {!visibleAccounts.length && <button className="empty-account-button" onClick={() => setShowAccountModal(true)}><PlusIcon />添加第一个邮箱</button>}
        </div>

        <div className="sidebar-footer">
          <div className="privacy-chip"><ShieldIcon /><div><strong>本地优先</strong><span>凭据经系统加密</span></div></div>
          {demoMode && <button className="exit-demo" onClick={exitDemo}>退出演示模式</button>}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="mailbox-heading">
            <h1>{mailboxTitle}</h1>
            <span>{filteredMessages.length} 封邮件，{unreadCount} 封未读</span>
          </div>
          <div className="topbar-actions">
            {(searchOpen || query) && <label className="search-box"><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => !query && setSearchOpen(false)} placeholder="搜索" /></label>}
            {!searchOpen && !query && <button className="icon-button" onClick={() => setSearchOpen(true)} title="搜索" aria-label="搜索"><SearchIcon /></button>}
            <button className={syncing ? 'icon-button spinning' : 'icon-button'} onClick={() => demoMode ? setLastSynced(new Date().toISOString()) : void syncMail()} disabled={syncing || (!accounts.length && !demoMode)} title="刷新"><RefreshIcon /></button>
            <button className="icon-button" onClick={() => setShowAccountModal(true)} title="添加邮箱" aria-label="添加邮箱"><PlusIcon /></button>
          </div>
        </header>

        {fatalError && <div className="error-banner"><AlertIcon /><span>{fatalError}</span><button onClick={() => setFatalError('')}>知道了</button></div>}
        {syncErrors.length > 0 && (
          <div className="warning-banner"><AlertIcon /><span>{syncErrors.length} 个邮箱同步失败：{syncErrors.map((error) => visibleAccounts.find((account) => account.id === error.accountId)?.label || error.accountId).join('、')}</span></div>
        )}

        {!visibleAccounts.length ? (
          <section className="onboarding">
            <div className="onboarding-mail-icon" aria-hidden="true"><InboxIcon /></div>
            <h2>添加邮箱账号</h2>
            <p>连接 Gmail、iCloud、QQ、网易或其他支持 IMAP 的邮箱，在统一收件箱中查看邮件。</p>
            <div className="onboarding-actions">
              <button className="primary-button large-button" onClick={() => setShowAccountModal(true)}>添加邮箱</button>
              <button className="text-button" onClick={enterDemo}><EyeIcon />查看演示</button>
            </div>
            <div className="trust-row"><span><ShieldIcon />本机处理</span><span><ShieldIcon />系统加密</span><span><ShieldIcon />默认屏蔽跟踪图片</span></div>
          </section>
        ) : (
          <div className="mail-layout">
            <section className={selectedMessage ? 'message-list mobile-hidden' : 'message-list'}>
              <div className="list-meta">
                <span>{syncing ? '正在从邮箱服务器读取…' : lastSynced ? `更新于 ${formatMessageDate(lastSynced)}` : '尚未同步'}</span>
                {demoMode && <span className="demo-badge">演示数据</span>}
              </div>
              {filteredMessages.length ? filteredMessages.map((message) => {
                const account = visibleAccounts.find((item) => item.id === message.accountId)
                return (
                  <button key={message.id} className={`${selectedMessage?.id === message.id ? 'message-row selected' : 'message-row'}${message.unread ? ' unread' : ''}`} onClick={() => void openMessage(message)}>
                    <span className="message-account-line" style={{ backgroundColor: account?.color }} />
                    <div className="message-row-top"><strong>{message.fromName}</strong><time>{formatMessageDate(message.date)}</time></div>
                    <div className="message-subject">{message.subject}</div>
                    <div className="message-preview">{demoMode ? demoPreviews[message.id] : message.fromAddress}</div>
                    <div className="message-row-bottom"><span>{account?.label}</span><div>{message.hasAttachments && <PaperclipIcon />}{message.flagged && <StarIcon className="starred" />}</div></div>
                  </button>
                )
              }) : (
                <div className="list-empty"><InboxIcon /><h3>这里很安静</h3><p>{query ? '没有找到匹配的邮件。' : '这个邮箱暂时没有可显示的邮件。'}</p></div>
              )}
              {!demoMode && sourceMessages.length >= syncLimit && syncLimit < 200 && (
                <button className="load-more" disabled={syncing} onClick={() => void loadMore()}>{syncing ? '正在加载…' : '加载更早的邮件'}</button>
              )}
            </section>

            <section className={selectedMessage ? 'reader open' : 'reader'}>
              {!selectedMessage ? (
                <div className="reader-empty"><div className="reader-empty-icon"><InboxIcon /></div><h3>选择一封邮件开始阅读</h3><p>邮件正文只在你打开时从服务器读取。</p></div>
              ) : (
                <>
                  <button className="reader-back" onClick={clearSelectedMessage}><ArrowLeftIcon />返回邮件列表</button>
                  <header className="reader-header">
                    <div className="reader-account"><span style={{ backgroundColor: currentAccount?.color }} />{currentAccount?.label}</div>
                    <h2>{selectedMessage.subject}</h2>
                    <div className="sender-line">
                      <div className="avatar" style={{ backgroundColor: currentAccount?.color }}>{selectedMessage.fromName.slice(0, 1).toUpperCase()}</div>
                      <div><strong>{selectedMessage.fromName}</strong><span>{selectedMessage.fromAddress}</span></div>
                      <time>{formatFullDate(selectedMessage.date)}</time>
                    </div>
                    <div className="recipient-line">收件人：{selectedMessage.to || currentAccount?.email}</div>
                  </header>
                  <div className="tracking-note"><ShieldIcon />为保护隐私，远程图片与跟踪像素已被拦截</div>
                  <div className="content-mode-bar">
                    <span>正文显示</span>
                    <div>
                      <button className={contentMode === 'html' ? 'active' : ''} onClick={() => setContentMode('html')}>清洁排版</button>
                      <button className={contentMode === 'text' ? 'active' : ''} onClick={() => setContentMode('text')}>纯文本</button>
                    </div>
                  </div>
                  <article className="message-content">
                    {detailLoading && <div className="reader-loading"><span /><span /><span /></div>}
                    {!detailLoading && detail && (
                      contentMode === 'html' && detail.html
                        ? <div className="email-html" dangerouslySetInnerHTML={{ __html: detail.html }} />
                        : <pre className="email-text">{detail.text || '这封邮件没有可显示的纯文本正文。'}</pre>
                    )}
                  </article>
                  {detail?.attachments.length ? (
                    <footer className="attachment-panel">
                      <h3><PaperclipIcon />附件 · {detail.attachments.length}</h3>
                      <div className="attachment-list">{detail.attachments.map((attachment, index) => (
                        <div className="attachment-card" key={`${attachment.filename}-${index}`}><span className="file-badge">{attachment.filename.split('.').at(-1)?.toUpperCase() || 'FILE'}</span><div><strong>{attachment.filename}</strong><small>{formatBytes(attachment.size)} · {attachment.contentType}</small></div><button disabled={demoMode} onClick={() => void downloadAttachment(attachment.index)}>{demoMode ? '演示' : '下载'}</button></div>
                      ))}</div>
                      {downloadNotice && <div className="download-notice">{downloadNotice}</div>}
                    </footer>
                  ) : null}
                </>
              )}
            </section>
          </div>
        )}
      </main>

      {showAccountModal && <AccountModal onClose={() => setShowAccountModal(false)} onAdded={handleAdded} />}
    </div>
  )
}
