import { useEffect, useMemo, useRef, useState } from 'react'
import { normalizeLocale, type AppLocale } from '../../shared/i18n'
import type { AccountPublic, MessageDetail, MessageSummary, SyncError } from '../../shared/types'
import AccountModal from './AccountModal'
import { getDemoData } from './demo'
import { translator, type Translator } from './i18n'
import {
  AlertIcon, ArrowLeftIcon, EyeIcon, InboxIcon, PaperclipIcon,
  PlusIcon, RefreshIcon, SearchIcon, ShieldIcon, StarIcon, TrashIcon
} from './icons'

type MailFilter = 'all' | 'unread' | 'flagged' | 'attachments'
type ContentMode = 'html' | 'text'

function cleanError(error: unknown, t: Translator): string {
  if (!(error instanceof Error)) return t('genericError')
  const parts = error.message.split('Error: ')
  return parts.at(-1)?.trim() || error.message
}

function formatMessageDate(value: string, locale: AppLocale): string {
  const date = new Date(value)
  const now = new Date()
  const dateLocale = locale === 'zh-CN' ? 'zh-CN' : 'en-US'
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat(dateLocale, {
      hour: 'numeric', minute: '2-digit', hour12: locale === 'en'
    }).format(date)
  }
  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat(dateLocale, { month: 'short', day: 'numeric' }).format(date)
  }
  return new Intl.DateTimeFormat(dateLocale, { year: '2-digit', month: 'numeric', day: 'numeric' }).format(date)
}

function formatFullDate(value: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit'
  }).format(new Date(value))
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function App() {
  const [locale, setLocale] = useState<AppLocale>(() => normalizeLocale(localStorage.getItem('mail.locale') || navigator.language))
  const t = useMemo(() => translator(locale), [locale])
  const demoData = useMemo(() => getDemoData(locale), [locale])
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

  const visibleAccounts = demoMode ? demoData.accounts : accounts
  const sourceMessages = demoMode ? demoData.messages : messages

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale)
    return sourceMessages.filter((message) => {
      if (selectedAccount !== 'all' && message.accountId !== selectedAccount) return false
      if (mailFilter === 'unread' && !message.unread) return false
      if (mailFilter === 'flagged' && !message.flagged) return false
      if (mailFilter === 'attachments' && !message.hasAttachments) return false
      if (!normalizedQuery) return true
      return [message.subject, message.fromName, message.fromAddress, message.to]
        .some((value) => value.toLocaleLowerCase(locale).includes(normalizedQuery))
    })
  }, [sourceMessages, selectedAccount, query, mailFilter, locale])

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem('mail.locale', locale)
    if (!initialized.current) {
      initialized.current = true
      void window.mail.setLocale(locale).then(initialize)
      return
    }
    void window.mail.setLocale(locale)
    clearSelectedMessage()
  }, [locale])

  async function initialize() {
    try {
      const savedAccounts = await window.mail.listAccounts()
      setAccounts(savedAccounts)
      if (savedAccounts.length) await syncMail()
    } catch (error) {
      setFatalError(cleanError(error, t))
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
        if (!refreshed) clearSelectedMessage()
      }
    } catch (error) {
      setFatalError(cleanError(error, t))
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
        ? demoData.details[message.id]
        : await window.mail.getMessage(message.accountId, message.uid)
      if (requestId === detailRequestId.current) setDetail(nextDetail)
    } catch (error) {
      if (requestId === detailRequestId.current) setFatalError(cleanError(error, t))
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
    setDownloadNotice(t('preparingAttachment'))
    try {
      const result = await window.mail.downloadAttachment(selectedMessage.accountId, selectedMessage.uid, attachmentIndex)
      setDownloadNotice(result.saved ? t('attachmentSaved') : '')
    } catch (error) {
      setDownloadNotice(cleanError(error, t))
    }
  }

  async function loadMore() {
    const nextLimit = Math.min(200, syncLimit + 50)
    setSyncLimit(nextLimit)
    await syncMail(nextLimit)
  }

  async function removeAccount(account: AccountPublic) {
    if (!window.confirm(t('removeConfirm', { account: account.label }))) return
    try {
      await window.mail.removeAccount(account.id)
      setAccounts((current) => current.filter((item) => item.id !== account.id))
      setMessages((current) => current.filter((message) => message.accountId !== account.id))
      if (selectedAccount === account.id) setSelectedAccount('all')
      if (selectedMessage?.accountId === account.id) clearSelectedMessage()
    } catch (error) {
      setFatalError(cleanError(error, t))
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
    ? t('mailboxForAccount', { account: selectedAccountName || t('mailboxes') })
    : mailFilter === 'unread'
      ? t('unread')
      : mailFilter === 'flagged'
        ? t('starred')
        : mailFilter === 'attachments'
          ? t('attachments')
          : t('inbox')

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label={t('mailboxes')}>
        <div className="sidebar-titlebar" aria-hidden="true" />
        <div className="sidebar-section-title native-section-title"><span>{t('personalFavorites')}</span></div>
        <button
          className={selectedAccount === 'all' && mailFilter === 'all' ? 'nav-item active' : 'nav-item'}
          onClick={() => selectMailbox('all')}
        >
          <span className="nav-icon"><InboxIcon /></span><span>{t('inbox')}</span>
          <b>{sourceMessages.filter((message) => message.unread).length || ''}</b>
        </button>

        <div className="sidebar-section-title native-section-title"><span>{t('smartMailboxes')}</span></div>
        <button className={mailFilter === 'unread' ? 'nav-item active' : 'nav-item'} onClick={() => selectSmartMailbox('unread')}>
          <span className="nav-icon unread-nav-icon" /><span>{t('unread')}</span>
        </button>
        <button className={mailFilter === 'flagged' ? 'nav-item active' : 'nav-item'} onClick={() => selectSmartMailbox('flagged')}>
          <span className="nav-icon"><StarIcon /></span><span>{t('starred')}</span>
        </button>
        <button className={mailFilter === 'attachments' ? 'nav-item active' : 'nav-item'} onClick={() => selectSmartMailbox('attachments')}>
          <span className="nav-icon"><PaperclipIcon /></span><span>{t('attachments')}</span>
        </button>

        <div className="sidebar-section-title native-section-title"><span>{t('mailboxes')}</span><button onClick={() => setShowAccountModal(true)} aria-label={t('addMailbox')}><PlusIcon /></button></div>
        <div className="account-list">
          {visibleAccounts.map((account) => {
            const unread = sourceMessages.filter((message) => message.accountId === account.id && message.unread).length
            return (
              <div className="mailbox-account-group" key={account.id}>
                <div className="account-group-name">{account.label}</div>
                <div className={selectedAccount === account.id ? 'account-row active' : 'account-row'}>
                  <button className="account-select" onClick={() => selectMailbox(account.id)}>
                    <span className="nav-icon account-inbox-icon"><InboxIcon /></span>
                    <span className="account-copy"><strong>{t('inbox')}</strong><small>{account.email}</small></span>
                    {unread > 0 && <b>{unread}</b>}
                  </button>
                  {!demoMode && <button className="remove-account" onClick={() => void removeAccount(account)} title={t('removeMailbox')}><TrashIcon /></button>}
                </div>
              </div>
            )
          })}
          {!visibleAccounts.length && <button className="empty-account-button" onClick={() => setShowAccountModal(true)}><PlusIcon />{t('addFirstMailbox')}</button>}
        </div>

        <div className="sidebar-footer">
          <label className="language-switcher">
            <span>{t('language')}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as AppLocale)} aria-label={t('language')}>
              <option value="en">English</option>
              <option value="zh-CN">中文</option>
            </select>
          </label>
          <div className="privacy-chip"><ShieldIcon /><div><strong>{t('localFirst')}</strong><span>{t('credentialsEncrypted')}</span></div></div>
          {demoMode && <button className="exit-demo" onClick={exitDemo}>{t('exitDemo')}</button>}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="mailbox-heading">
            <h1>{mailboxTitle}</h1>
            <span>{t('messagesSummary', { count: filteredMessages.length, unread: unreadCount })}</span>
          </div>
          <div className="topbar-actions">
            {(searchOpen || query) && <label className="search-box"><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => !query && setSearchOpen(false)} placeholder={t('search')} /></label>}
            {!searchOpen && !query && <button className="icon-button" onClick={() => setSearchOpen(true)} title={t('search')} aria-label={t('search')}><SearchIcon /></button>}
            <button className={syncing ? 'icon-button spinning' : 'icon-button'} onClick={() => demoMode ? setLastSynced(new Date().toISOString()) : void syncMail()} disabled={syncing || (!accounts.length && !demoMode)} title={t('refresh')} aria-label={t('refresh')}><RefreshIcon /></button>
            <button className="icon-button" onClick={() => setShowAccountModal(true)} title={t('addMailbox')} aria-label={t('addMailbox')}><PlusIcon /></button>
          </div>
        </header>

        {fatalError && <div className="error-banner"><AlertIcon /><span>{fatalError}</span><button onClick={() => setFatalError('')}>{t('dismiss')}</button></div>}
        {syncErrors.length > 0 && (
          <div className="warning-banner"><AlertIcon /><span>{t('syncFailures', {
            count: syncErrors.length,
            accounts: syncErrors.map((error) => visibleAccounts.find((account) => account.id === error.accountId)?.label || error.accountId).join(locale === 'zh-CN' ? '、' : ', ')
          })}</span></div>
        )}

        {!visibleAccounts.length ? (
          <section className="onboarding">
            <div className="onboarding-mail-icon" aria-hidden="true"><InboxIcon /></div>
            <h2>{t('setupTitle')}</h2>
            <p>{t('setupDescription')}</p>
            <div className="onboarding-actions">
              <button className="primary-button large-button" onClick={() => setShowAccountModal(true)}>{t('addEmail')}</button>
              <button className="text-button" onClick={enterDemo}><EyeIcon />{t('viewDemo')}</button>
            </div>
            <div className="trust-row"><span><ShieldIcon />{t('localProcessing')}</span><span><ShieldIcon />{t('systemEncryption')}</span><span><ShieldIcon />{t('remoteImagesBlocked')}</span></div>
          </section>
        ) : (
          <div className="mail-layout">
            <section className={selectedMessage ? 'message-list mobile-hidden' : 'message-list'}>
              <div className="list-meta">
                <span>{syncing ? t('syncing') : lastSynced ? t('updatedAt', { time: formatMessageDate(lastSynced, locale) }) : t('notSynced')}</span>
                {demoMode && <span className="demo-badge">{t('demoData')}</span>}
              </div>
              {filteredMessages.length ? filteredMessages.map((message) => {
                const account = visibleAccounts.find((item) => item.id === message.accountId)
                return (
                  <button key={message.id} className={`${selectedMessage?.id === message.id ? 'message-row selected' : 'message-row'}${message.unread ? ' unread' : ''}`} onClick={() => void openMessage(message)}>
                    <span className="message-account-line" style={{ backgroundColor: account?.color }} />
                    <div className="message-row-top"><strong>{message.fromName}</strong><time>{formatMessageDate(message.date, locale)}</time></div>
                    <div className="message-subject">{message.subject}</div>
                    <div className="message-preview">{demoMode ? demoData.previews[message.id] : message.fromAddress}</div>
                    <div className="message-row-bottom"><span>{account?.label}</span><div>{message.hasAttachments && <PaperclipIcon />}{message.flagged && <StarIcon className="starred" />}</div></div>
                  </button>
                )
              }) : (
                <div className="list-empty"><InboxIcon /><h3>{t('emptyTitle')}</h3><p>{query ? t('noSearchResults') : t('noMessages')}</p></div>
              )}
              {!demoMode && sourceMessages.length >= syncLimit && syncLimit < 200 && (
                <button className="load-more" disabled={syncing} onClick={() => void loadMore()}>{syncing ? t('loading') : t('loadEarlier')}</button>
              )}
            </section>

            <section className={selectedMessage ? 'reader open' : 'reader'}>
              {!selectedMessage ? (
                <div className="reader-empty"><div className="reader-empty-icon"><InboxIcon /></div><h3>{t('selectMessage')}</h3><p>{t('bodyFetchedOnOpen')}</p></div>
              ) : (
                <>
                  <button className="reader-back" onClick={clearSelectedMessage}><ArrowLeftIcon />{t('backToList')}</button>
                  <header className="reader-header">
                    <div className="reader-account"><span style={{ backgroundColor: currentAccount?.color }} />{currentAccount?.label}</div>
                    <h2>{selectedMessage.subject}</h2>
                    <div className="sender-line">
                      <div className="avatar" style={{ backgroundColor: currentAccount?.color }}>{selectedMessage.fromName.slice(0, 1).toUpperCase()}</div>
                      <div><strong>{selectedMessage.fromName}</strong><span>{selectedMessage.fromAddress}</span></div>
                      <time>{formatFullDate(selectedMessage.date, locale)}</time>
                    </div>
                    <div className="recipient-line">{t('recipient', { recipient: selectedMessage.to || currentAccount?.email || '' })}</div>
                  </header>
                  <div className="tracking-note"><ShieldIcon />{t('privacyNote')}</div>
                  <div className="content-mode-bar">
                    <span>{t('messageView')}</span>
                    <div>
                      <button className={contentMode === 'html' ? 'active' : ''} onClick={() => setContentMode('html')}>{t('cleanLayout')}</button>
                      <button className={contentMode === 'text' ? 'active' : ''} onClick={() => setContentMode('text')}>{t('plainText')}</button>
                    </div>
                  </div>
                  <article className="message-content">
                    {detailLoading && <div className="reader-loading"><span /><span /><span /></div>}
                    {!detailLoading && detail && (
                      contentMode === 'html' && detail.html
                        ? <div className="email-html" dangerouslySetInnerHTML={{ __html: detail.html }} />
                        : <pre className="email-text">{detail.text || t('noPlainText')}</pre>
                    )}
                  </article>
                  {detail?.attachments.length ? (
                    <footer className="attachment-panel">
                      <h3><PaperclipIcon />{t('attachmentCount', { count: detail.attachments.length })}</h3>
                      <div className="attachment-list">{detail.attachments.map((attachment, index) => (
                        <div className="attachment-card" key={`${attachment.filename}-${index}`}><span className="file-badge">{attachment.filename.split('.').at(-1)?.toUpperCase() || 'FILE'}</span><div><strong>{attachment.filename}</strong><small>{formatBytes(attachment.size)} · {attachment.contentType}</small></div><button disabled={demoMode} onClick={() => void downloadAttachment(attachment.index)}>{demoMode ? t('demo') : t('download')}</button></div>
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

      {showAccountModal && <AccountModal locale={locale} t={t} onClose={() => setShowAccountModal(false)} onAdded={handleAdded} />}
    </div>
  )
}
