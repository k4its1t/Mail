import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { AccountStore } from './account-store'
import { fetchAttachment, fetchMessageDetail, fetchMessageSummaries, testImapConnection } from './mail-service'
import { coreString, normalizeLocale, type AppLocale } from '../shared/i18n'
import type { AccountInput, SyncResult } from '../shared/types'

const currentDir = dirname(fileURLToPath(import.meta.url))
let activeLocale: AppLocale = 'en'

function readableError(error: unknown, locale: AppLocale): string {
  if (!(error instanceof Error)) return coreString(locale, 'unknownError')
  const message = error.message.replace(/^Error:\s*/i, '').trim()
  if (/authentication|auth.*fail|invalid credentials|login failed/i.test(message)) {
    return coreString(locale, 'authenticationFailed')
  }
  if (/certificate|self signed|unable to verify/i.test(message)) {
    return coreString(locale, 'certificateFailed')
  }
  if (/timeout|timed out|etimedout/i.test(message)) {
    return coreString(locale, 'connectionTimeout')
  }
  return message || coreString(locale, 'mailOperationFailed')
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: 'Mail',
    backgroundColor: '#f6f4ef',
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay: process.platform === 'win32'
      ? { color: '#00000000', symbolColor: '#8e8e93', height: 38 }
      : undefined,
    webPreferences: {
      preload: join(currentDir, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  window.once('ready-to-show', () => window.show())
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?:|mailto:)/i.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, url) => {
    const currentUrl = window.webContents.getURL()
    if (url !== currentUrl) event.preventDefault()
  })

  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (rendererUrl) void window.loadURL(rendererUrl)
  else void window.loadFile(join(currentDir, '../renderer/index.html'))

  return window
}

function registerIpc(store: AccountStore): void {
  ipcMain.handle('app:set-locale', (_event, locale: string) => {
    activeLocale = normalizeLocale(locale)
  })

  ipcMain.handle('accounts:list', () => store.list(activeLocale))

  ipcMain.handle('accounts:test', async (_event, input: AccountInput) => {
    try {
      await testImapConnection(input, activeLocale)
      return { ok: true as const }
    } catch (error) {
      throw new Error(readableError(error, activeLocale))
    }
  })

  ipcMain.handle('accounts:add', async (_event, input: AccountInput) => {
    try {
      await testImapConnection(input, activeLocale)
      return await store.add(input, activeLocale)
    } catch (error) {
      throw new Error(readableError(error, activeLocale))
    }
  })

  ipcMain.handle('accounts:remove', async (_event, accountId: string) => {
    await store.remove(accountId, activeLocale)
  })

  ipcMain.handle('mail:sync-account', async (_event, accountId: string, limit?: number) => {
    try {
      const account = await store.getDecrypted(accountId, activeLocale)
      return await fetchMessageSummaries(account, limit, activeLocale)
    } catch (error) {
      throw new Error(readableError(error, activeLocale))
    }
  })

  ipcMain.handle('mail:sync-all', async (_event, limit?: number): Promise<SyncResult> => {
    const accounts = await store.list(activeLocale)
    const settled = await Promise.allSettled(
      accounts.map(async (account) => {
        const decrypted = await store.getDecrypted(account.id, activeLocale)
        return fetchMessageSummaries(decrypted, limit, activeLocale)
      })
    )
    const messages = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    const errors = settled.flatMap((result, index) => result.status === 'rejected'
      ? [{ accountId: accounts[index].id, message: readableError(result.reason, activeLocale) }]
      : [])
    return {
      messages: messages.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
      errors,
      syncedAt: new Date().toISOString()
    }
  })

  ipcMain.handle('mail:get-message', async (_event, accountId: string, uid: number) => {
    try {
      const account = await store.getDecrypted(accountId, activeLocale)
      return await fetchMessageDetail(account, uid, activeLocale)
    } catch (error) {
      throw new Error(readableError(error, activeLocale))
    }
  })

  ipcMain.handle('mail:download-attachment', async (_event, accountId: string, uid: number, attachmentIndex: number) => {
    try {
      const account = await store.getDecrypted(accountId, activeLocale)
      const attachment = await fetchAttachment(account, uid, attachmentIndex, activeLocale)
      const safeFilename = attachment.filename
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
        .replace(/^\.+/, '')
        .slice(0, 180) || `attachment-${attachmentIndex + 1}`
      const result = await dialog.showSaveDialog({
        title: coreString(activeLocale, 'saveAttachmentTitle'),
        defaultPath: safeFilename,
        buttonLabel: coreString(activeLocale, 'save')
      })
      if (result.canceled || !result.filePath) return { saved: false }
      await writeFile(result.filePath, attachment.content)
      return { saved: true, path: result.filePath }
    } catch (error) {
      throw new Error(readableError(error, activeLocale))
    }
  })
}

const hasSingleInstanceLock = app.requestSingleInstanceLock()
if (!hasSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0]
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
    }
  })

  app.whenReady().then(() => {
    activeLocale = normalizeLocale(app.getLocale())
    app.setAppUserModelId('com.mail.desktop')
    registerIpc(new AccountStore())
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
