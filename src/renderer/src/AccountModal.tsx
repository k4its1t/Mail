import { useMemo, useState } from 'react'
import { PROVIDERS } from '../../shared/providers'
import type { AppLocale } from '../../shared/i18n'
import type { AccountInput, AccountPublic, ProviderId } from '../../shared/types'
import { providerHint, providerName, type Translator } from './i18n'
import { CheckIcon, CloseIcon, LockIcon, ServerIcon, ShieldIcon } from './icons'

const COLORS = ['#d5673e', '#398a72', '#4c6f99', '#8b5e83', '#b18a36', '#58616c']

interface AccountModalProps {
  locale: AppLocale
  t: Translator
  onClose: () => void
  onAdded: (account: AccountPublic) => void
}

function cleanError(error: unknown, t: Translator): string {
  if (!(error instanceof Error)) return t('genericError')
  const parts = error.message.split('Error: ')
  return parts.at(-1)?.trim() || error.message
}

export default function AccountModal({ locale, t, onClose, onAdded }: AccountModalProps) {
  const [provider, setProvider] = useState<ProviderId>('gmail')
  const [form, setForm] = useState<AccountInput>({
    label: '', email: '', username: '', password: '', provider: 'gmail',
    imapHost: PROVIDERS.gmail.host, imapPort: PROVIDERS.gmail.port,
    secure: PROVIDERS.gmail.secure, color: COLORS[0]
  })
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tested, setTested] = useState(false)
  const [error, setError] = useState('')

  const valid = useMemo(() => (
    form.email.includes('@') && form.username.trim() && form.password &&
    form.imapHost.trim() && form.imapPort > 0
  ), [form])

  function update<K extends keyof AccountInput>(key: K, value: AccountInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setTested(false)
    setError('')
  }

  function selectProvider(nextProvider: ProviderId) {
    const nextPreset = PROVIDERS[nextProvider]
    setProvider(nextProvider)
    setForm((current) => ({
      ...current,
      provider: nextProvider,
      imapHost: nextPreset.host,
      imapPort: nextPreset.port,
      secure: nextPreset.secure
    }))
    setTested(false)
    setError('')
  }

  async function testConnection() {
    if (!valid) return
    setTesting(true)
    setError('')
    try {
      await window.mail.testConnection(form)
      setTested(true)
    } catch (connectionError) {
      setTested(false)
      setError(cleanError(connectionError, t))
    } finally {
      setTesting(false)
    }
  }

  async function save() {
    if (!valid) return
    setSaving(true)
    setError('')
    try {
      const account = await window.mail.addAccount(form)
      onAdded(account)
    } catch (saveError) {
      setError(cleanError(saveError, t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="add-account-title">
        <header className="modal-header">
          <div>
            <div className="eyebrow">{t('connectMailbox')}</div>
            <h2 id="add-account-title">{t('addInbox')}</h2>
            <p>{t('readOnlyDescription')}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label={t('close')}><CloseIcon /></button>
        </header>

        <div className="modal-body">
          <label className="field full-field">
            <span>{t('provider')}</span>
            <select value={provider} onChange={(event) => selectProvider(event.target.value as ProviderId)}>
              {Object.values(PROVIDERS).map((item) => <option key={item.id} value={item.id}>{providerName(locale, item.id)}</option>)}
            </select>
          </label>

          <div className="provider-note"><ShieldIcon /><span>{providerHint(locale, provider)}</span></div>

          <div className="form-grid">
            <label className="field">
              <span>{t('displayName')}</span>
              <input value={form.label} onChange={(event) => update('label', event.target.value)} placeholder={t('displayNamePlaceholder')} />
            </label>
            <label className="field">
              <span>{t('color')}</span>
              <div className="color-picker">
                {COLORS.map((color) => (
                  <button
                    type="button" key={color} className={form.color === color ? 'color-dot selected' : 'color-dot'}
                    style={{ backgroundColor: color }} onClick={() => update('color', color)} aria-label={t('selectColor', { color })}
                  >{form.color === color && <CheckIcon />}</button>
                ))}
              </div>
            </label>
            <label className="field full-field">
              <span>{t('emailAddress')}</span>
              <input
                type="email" value={form.email} placeholder="name@example.com"
                onChange={(event) => {
                  const email = event.target.value
                  setForm((current) => ({ ...current, email, username: current.username || email }))
                  setTested(false)
                }}
              />
            </label>
            <label className="field full-field">
              <span>{t('username')}</span>
              <input value={form.username} onChange={(event) => update('username', event.target.value)} placeholder={t('usernamePlaceholder')} />
            </label>
            <label className="field full-field">
              <span>{t('appPassword')}</span>
              <div className="input-with-icon"><LockIcon /><input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder={t('passwordPlaceholder')} /></div>
            </label>
            <label className="field server-field">
              <span>{t('imapServer')}</span>
              <div className="input-with-icon"><ServerIcon /><input value={form.imapHost} onChange={(event) => update('imapHost', event.target.value)} placeholder="imap.example.com" /></div>
            </label>
            <label className="field port-field">
              <span>{t('port')}</span>
              <input type="number" min="1" max="65535" value={form.imapPort} onChange={(event) => update('imapPort', Number(event.target.value))} />
            </label>
            <label className="checkbox-field full-field">
              <input type="checkbox" checked={form.secure} onChange={(event) => update('secure', event.target.checked)} />
              <span>{t('secureConnection')}</span>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}
          {tested && <div className="form-success"><CheckIcon />{t('connectionSuccess')}</div>}
        </div>

        <footer className="modal-footer">
          <div className="local-note"><LockIcon />{t('localCredentialNote')}</div>
          <div className="modal-actions">
            <button className="secondary-button" disabled={!valid || testing || saving} onClick={testConnection}>
              {testing ? t('testing') : t('testConnection')}
            </button>
            <button className="primary-button" disabled={!valid || testing || saving} onClick={save}>
              {saving ? t('connecting') : t('addEmail')}
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
