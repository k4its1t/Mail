import { useMemo, useState } from 'react'
import { PROVIDERS } from '../../shared/providers'
import type { AccountInput, AccountPublic, ProviderId } from '../../shared/types'
import { CheckIcon, CloseIcon, LockIcon, ServerIcon, ShieldIcon } from './icons'

const COLORS = ['#d5673e', '#398a72', '#4c6f99', '#8b5e83', '#b18a36', '#58616c']

interface AccountModalProps {
  onClose: () => void
  onAdded: (account: AccountPublic) => void
}

function cleanError(error: unknown): string {
  if (!(error instanceof Error)) return '操作失败，请稍后重试。'
  const parts = error.message.split('Error: ')
  return parts.at(-1)?.trim() || error.message
}

export default function AccountModal({ onClose, onAdded }: AccountModalProps) {
  const [provider, setProvider] = useState<ProviderId>('gmail')
  const preset = PROVIDERS[provider]
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
      setError(cleanError(connectionError))
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
      setError(cleanError(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="add-account-title">
        <header className="modal-header">
          <div>
            <div className="eyebrow">连接邮箱</div>
            <h2 id="add-account-title">添加一个收件箱</h2>
            <p>只通过 IMAP 读取邮件，不会发送或删除服务器上的内容。</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭"><CloseIcon /></button>
        </header>

        <div className="modal-body">
          <label className="field full-field">
            <span>邮箱服务商</span>
            <select value={provider} onChange={(event) => selectProvider(event.target.value as ProviderId)}>
              {Object.values(PROVIDERS).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>

          <div className="provider-note"><ShieldIcon /><span>{preset.credentialHint}</span></div>

          <div className="form-grid">
            <label className="field">
              <span>显示名称</span>
              <input value={form.label} onChange={(event) => update('label', event.target.value)} placeholder="例如：工作邮箱" />
            </label>
            <label className="field">
              <span>标记颜色</span>
              <div className="color-picker">
                {COLORS.map((color) => (
                  <button
                    type="button" key={color} className={form.color === color ? 'color-dot selected' : 'color-dot'}
                    style={{ backgroundColor: color }} onClick={() => update('color', color)} aria-label={`选择颜色 ${color}`}
                  >{form.color === color && <CheckIcon />}</button>
                ))}
              </div>
            </label>
            <label className="field full-field">
              <span>邮箱地址</span>
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
              <span>登录用户名</span>
              <input value={form.username} onChange={(event) => update('username', event.target.value)} placeholder="通常与邮箱地址相同" />
            </label>
            <label className="field full-field">
              <span>应用密码 / 授权码</span>
              <div className="input-with-icon"><LockIcon /><input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="不会显示或明文保存" /></div>
            </label>
            <label className="field server-field">
              <span>IMAP 服务器</span>
              <div className="input-with-icon"><ServerIcon /><input value={form.imapHost} onChange={(event) => update('imapHost', event.target.value)} placeholder="imap.example.com" /></div>
            </label>
            <label className="field port-field">
              <span>端口</span>
              <input type="number" min="1" max="65535" value={form.imapPort} onChange={(event) => update('imapPort', Number(event.target.value))} />
            </label>
            <label className="checkbox-field full-field">
              <input type="checkbox" checked={form.secure} onChange={(event) => update('secure', event.target.checked)} />
              <span>使用 TLS 安全连接（推荐）</span>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}
          {tested && <div className="form-success"><CheckIcon />连接成功，可以安全保存账号。</div>}
        </div>

        <footer className="modal-footer">
          <div className="local-note"><LockIcon />凭据由操作系统加密后保存在本机</div>
          <div className="modal-actions">
            <button className="secondary-button" disabled={!valid || testing || saving} onClick={testConnection}>
              {testing ? '正在测试…' : '测试连接'}
            </button>
            <button className="primary-button" disabled={!valid || testing || saving} onClick={save}>
              {saving ? '正在连接…' : '添加邮箱'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
