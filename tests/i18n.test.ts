import { describe, expect, it } from 'vitest'
import { coreString, normalizeLocale } from '../src/shared/i18n'
import { getDemoData } from '../src/renderer/src/demo'
import { providerHint, providerName, translator } from '../src/renderer/src/i18n'

describe('localization', () => {
  it('normalizes Chinese system locales and falls back to English', () => {
    expect(normalizeLocale('zh-TW')).toBe('zh-CN')
    expect(normalizeLocale('zh-CN')).toBe('zh-CN')
    expect(normalizeLocale('en-US')).toBe('en')
    expect(normalizeLocale('fr-FR')).toBe('en')
  })

  it('translates renderer strings and placeholder values', () => {
    expect(translator('en')('messagesSummary', { count: 5, unread: 2 })).toBe('5 messages, 2 unread')
    expect(translator('zh-CN')('messagesSummary', { count: 5, unread: 2 })).toBe('5 封邮件，2 封未读')
  })

  it('localizes provider names, setup hints, and main-process messages', () => {
    expect(providerName('en', 'icloud')).toBe('iCloud Mail')
    expect(providerName('zh-CN', 'icloud')).toBe('iCloud 邮箱')
    expect(providerHint('en', 'gmail')).toContain('app password')
    expect(coreString('zh-CN', 'accountNotFound')).toContain('找不到')
  })

  it('provides fully English demo content for documentation screenshots', () => {
    const englishDemo = JSON.stringify(getDemoData('en'))
    expect(englishDemo).not.toMatch(/\p{Script=Han}/u)
    expect(englishDemo).toContain('Fall product launch')
    expect(JSON.stringify(getDemoData('zh-CN'))).toMatch(/\p{Script=Han}/u)
  })
})
