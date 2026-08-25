import { contextBridge, ipcRenderer } from 'electron'
import type { AccountInput, MailApi } from '../shared/types'

const api: MailApi = {
  listAccounts: () => ipcRenderer.invoke('accounts:list'),
  addAccount: (input: AccountInput) => ipcRenderer.invoke('accounts:add', input),
  removeAccount: (accountId: string) => ipcRenderer.invoke('accounts:remove', accountId),
  testConnection: (input: AccountInput) => ipcRenderer.invoke('accounts:test', input),
  syncAll: (limit?: number) => ipcRenderer.invoke('mail:sync-all', limit),
  syncAccount: (accountId: string, limit?: number) => ipcRenderer.invoke('mail:sync-account', accountId, limit),
  getMessage: (accountId: string, uid: number) => ipcRenderer.invoke('mail:get-message', accountId, uid),
  downloadAttachment: (accountId: string, uid: number, attachmentIndex: number) => ipcRenderer.invoke('mail:download-attachment', accountId, uid, attachmentIndex)
}

contextBridge.exposeInMainWorld('mail', api)
