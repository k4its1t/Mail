import type { AccountPublic, MessageDetail, MessageSummary } from '../../shared/types'

export const demoAccounts: AccountPublic[] = [
  {
    id: 'demo-work', label: '工作邮箱', email: 'you@studio.cn', username: 'you@studio.cn',
    provider: 'custom', imapHost: 'imap.studio.cn', imapPort: 993, secure: true,
    color: '#d5673e', createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'demo-personal', label: '个人 Gmail', email: 'you@gmail.com', username: 'you@gmail.com',
    provider: 'gmail', imapHost: 'imap.gmail.com', imapPort: 993, secure: true,
    color: '#398a72', createdAt: '2026-08-02T08:00:00.000Z'
  }
]

export const demoMessages: MessageSummary[] = [
  {
    id: 'demo-work:108', accountId: 'demo-work', uid: 108, subject: '秋季产品发布会：最终流程确认',
    fromName: '林晓雯', fromAddress: 'xiaowen@northstar.co', to: 'you@studio.cn',
    date: '2026-08-10T10:42:00.000Z', unread: true, flagged: true, hasAttachments: true, size: 284103
  },
  {
    id: 'demo-personal:207', accountId: 'demo-personal', uid: 207, subject: '本周阅读清单 · 第 32 期',
    fromName: '浮岛周刊', fromAddress: 'hello@islandletters.com', to: 'you@gmail.com',
    date: '2026-08-10T08:15:00.000Z', unread: true, flagged: false, hasAttachments: false, size: 48120
  },
  {
    id: 'demo-work:107', accountId: 'demo-work', uid: 107, subject: 'Re: 品牌首页第二轮设计反馈',
    fromName: 'Daniel Chen', fromAddress: 'daniel@atelier.dev', to: 'you@studio.cn',
    date: '2026-08-09T15:26:00.000Z', unread: false, flagged: false, hasAttachments: false, size: 18742
  },
  {
    id: 'demo-personal:206', accountId: 'demo-personal', uid: 206, subject: '你的八月账单已生成',
    fromName: '云端服务', fromAddress: 'billing@cloud.example', to: 'you@gmail.com',
    date: '2026-08-09T03:07:00.000Z', unread: false, flagged: false, hasAttachments: true, size: 94018
  },
  {
    id: 'demo-work:106', accountId: 'demo-work', uid: 106, subject: '会议纪要｜官网改版项目启动会',
    fromName: '周予安', fromAddress: 'yuan@studio.cn', to: 'you@studio.cn',
    date: '2026-08-08T11:10:00.000Z', unread: false, flagged: true, hasAttachments: false, size: 24713
  }
]

export const demoPreviews: Record<string, string> = {
  'demo-work:108': '附件是发布会最终流程，请确认开场视频、产品演示与媒体问答。',
  'demo-personal:207': '本周值得阅读的产品、设计与技术文章已经整理好了。',
  'demo-work:107': '第二轮方向整体很好，我补充了首页信息层级和移动端反馈。',
  'demo-personal:206': '八月服务账单已生成，可在账户中心查看详细项目。',
  'demo-work:106': '这是官网改版项目启动会的决策记录和下一步安排。'
}

export const demoDetails: Record<string, MessageDetail> = Object.fromEntries(
  demoMessages.map((message) => [message.id, {
    ...message,
    messageId: `<${message.uid}@demo.mail.local>`,
    text: '',
    html: message.id === 'demo-work:108'
      ? '<p>你好，</p><p>附件是秋季产品发布会的最终流程。请重点确认开场视频、产品演示和媒体问答三个环节。</p><p><strong>需要在周二中午前完成：</strong></p><ul><li>确认演示设备和备用网络</li><li>补齐嘉宾姓名与职务</li><li>确认媒体签到时间</li></ul><p>谢谢！<br>晓雯</p>'
      : `<p>这是一封用于展示阅读体验的示例邮件。</p><p>连接真实邮箱后，邮件正文会在本机读取并经过安全清洗；远程图片默认不会加载。</p>`,
    attachments: message.hasAttachments ? [{ index: 0, filename: '活动流程-v4.pdf', contentType: 'application/pdf', size: 238410 }] : []
  }]))
