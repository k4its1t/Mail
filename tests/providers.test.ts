import { describe, expect, it } from 'vitest'
import { getProviderPreset, PROVIDERS } from '../src/shared/providers'

describe('provider presets', () => {
  it('uses TLS IMAP defaults for built-in providers', () => {
    for (const provider of Object.values(PROVIDERS).filter((item) => item.id !== 'custom')) {
      expect(provider.secure).toBe(true)
      expect(provider.port).toBe(993)
      expect(provider.host).toContain('.')
    }
  })

  it('returns the selected preset', () => {
    expect(getProviderPreset('gmail').host).toBe('imap.gmail.com')
    expect(getProviderPreset('qq').host).toBe('imap.qq.com')
  })
})
