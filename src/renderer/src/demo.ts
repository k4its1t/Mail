import type { AccountPublic, MessageDetail, MessageSummary } from '../../shared/types'
import type { AppLocale } from '../../shared/i18n'

interface DemoData {
  accounts: AccountPublic[]
  messages: MessageSummary[]
  previews: Record<string, string>
  details: Record<string, MessageDetail>
}

const NOW = Date.now()

function iso(hoursAgo: number): string {
  return new Date(NOW - hoursAgo * 60 * 60 * 1000).toISOString()
}

export function getDemoData(locale: AppLocale): DemoData {
  const chinese = locale === 'zh-CN'
  const accounts: AccountPublic[] = [
    {
      id: 'demo-work',
      label: chinese ? '工作' : 'Work',
      email: 'work@example.com',
      username: 'work@example.com',
      provider: 'icloud',
      imapHost: 'imap.mail.me.com',
      imapPort: 993,
      secure: true,
      color: '#007aff',
      createdAt: iso(240)
    },
    {
      id: 'demo-personal',
      label: chinese ? '个人 Gmail' : 'Personal Gmail',
      email: 'personal@example.com',
      username: 'personal@example.com',
      provider: 'gmail',
      imapHost: 'imap.gmail.com',
      imapPort: 993,
      secure: true,
      color: '#ff9f0a',
      createdAt: iso(360)
    }
  ]

  const messages: MessageSummary[] = chinese
    ? [
        {
          id: 'demo-work:504',
          accountId: 'demo-work',
          uid: 504,
          fromName: '林晓雯',
          fromAddress: 'xiaowen@example.com',
          to: 'work@example.com',
          subject: '秋季产品发布会：最终流程确认',
          date: iso(1),
          unread: true,
          flagged: false,
          hasAttachments: true,
          size: 284_120
        },
        {
          id: 'demo-personal:163',
          accountId: 'demo-personal',
          uid: 163,
          fromName: '岛屿周刊',
          fromAddress: 'weekly@example.com',
          to: 'personal@example.com',
          subject: '本周阅读清单 · 第 32 期',
          date: iso(4),
          unread: true,
          flagged: false,
          hasAttachments: false,
          size: 42_300
        },
        {
          id: 'demo-work:503',
          accountId: 'demo-work',
          uid: 503,
          fromName: '陈嘉宁',
          fromAddress: 'jianing@example.com',
          to: 'work@example.com',
          subject: '回复：首页设计第二轮反馈',
          date: iso(7),
          unread: false,
          flagged: true,
          hasAttachments: false,
          size: 31_920
        },
        {
          id: 'demo-personal:162',
          accountId: 'demo-personal',
          uid: 162,
          fromName: '云服务',
          fromAddress: 'billing@example.com',
          to: 'personal@example.com',
          subject: '你的八月账单已生成',
          date: iso(27),
          unread: false,
          flagged: false,
          hasAttachments: true,
          size: 310_440
        },
        {
          id: 'demo-work:502',
          accountId: 'demo-work',
          uid: 502,
          fromName: '周远',
          fromAddress: 'yuan@example.com',
          to: 'work@example.com',
          subject: '会议纪要｜网站改版启动会',
          date: iso(31),
          unread: false,
          flagged: false,
          hasAttachments: false,
          size: 28_710
        }
      ]
    : [
        {
          id: 'demo-work:504',
          accountId: 'demo-work',
          uid: 504,
          fromName: 'Xiaowen Lin',
          fromAddress: 'xiaowen@example.com',
          to: 'work@example.com',
          subject: 'Fall product launch: final run of show',
          date: iso(1),
          unread: true,
          flagged: false,
          hasAttachments: true,
          size: 284_120
        },
        {
          id: 'demo-personal:163',
          accountId: 'demo-personal',
          uid: 163,
          fromName: 'Island Weekly',
          fromAddress: 'weekly@example.com',
          to: 'personal@example.com',
          subject: 'Weekly reading list · Issue 32',
          date: iso(4),
          unread: true,
          flagged: false,
          hasAttachments: false,
          size: 42_300
        },
        {
          id: 'demo-work:503',
          accountId: 'demo-work',
          uid: 503,
          fromName: 'Jianing Chen',
          fromAddress: 'jianing@example.com',
          to: 'work@example.com',
          subject: 'Re: Second-round homepage design feedback',
          date: iso(7),
          unread: false,
          flagged: true,
          hasAttachments: false,
          size: 31_920
        },
        {
          id: 'demo-personal:162',
          accountId: 'demo-personal',
          uid: 162,
          fromName: 'Cloud Service',
          fromAddress: 'billing@example.com',
          to: 'personal@example.com',
          subject: 'Your August invoice is ready',
          date: iso(27),
          unread: false,
          flagged: false,
          hasAttachments: true,
          size: 310_440
        },
        {
          id: 'demo-work:502',
          accountId: 'demo-work',
          uid: 502,
          fromName: 'Yuan Zhou',
          fromAddress: 'yuan@example.com',
          to: 'work@example.com',
          subject: 'Meeting notes | Website redesign kickoff',
          date: iso(31),
          unread: false,
          flagged: false,
          hasAttachments: false,
          size: 28_710
        }
      ]

  const previews = chinese
    ? {
        'demo-work:504': '团队好，最终流程已经整理完毕，请大家在今天下班前确认各自负责的环节。',
        'demo-personal:163': '本期精选：空间设计、独立出版，以及一份适合周末的长篇访谈。',
        'demo-work:503': '第二轮意见已经合并，导航层级与移动端留白会在明天的版本中更新。',
        'demo-personal:162': '本月服务费用明细已生成，可在附件中查看完整账单。',
        'demo-work:502': '今天讨论了新版网站的目标、内容迁移范围与第一阶段时间安排。'
      }
    : {
        'demo-work:504': 'The final schedule is ready. Please confirm the segment you own before the end of the day.',
        'demo-personal:163': 'This issue features spatial design, independent publishing, and a long-form weekend interview.',
        'demo-work:503': 'The second round of feedback is merged. Navigation and mobile spacing will be updated tomorrow.',
        'demo-personal:162': 'Your monthly service charges are ready. The complete invoice is attached.',
        'demo-work:502': 'Today we aligned on the redesign goals, content migration scope, and the first delivery phase.'
      }

  const firstHtml = chinese
    ? `<p>团队好，</p><p>秋季产品发布会的最终流程已经整理完毕。请大家在今天下班前确认各自负责的环节，并直接回复需要调整的内容。</p><p>彩排将在周四下午 3:00 开始，完整流程见附件。</p><p>谢谢，<br>晓雯</p>`
    : `<p>Hi team,</p><p>The final run of show for the fall product launch is ready. Please confirm the segment you own before the end of the day and reply with any changes.</p><p>The rehearsal begins Thursday at 3:00 PM. The complete schedule is attached.</p><p>Thanks,<br>Xiaowen</p>`
  const firstText = chinese
    ? '团队好，\n\n秋季产品发布会的最终流程已经整理完毕。请大家在今天下班前确认各自负责的环节，并直接回复需要调整的内容。\n\n彩排将在周四下午 3:00 开始，完整流程见附件。\n\n谢谢，\n晓雯'
    : 'Hi team,\n\nThe final run of show for the fall product launch is ready. Please confirm the segment you own before the end of the day and reply with any changes.\n\nThe rehearsal begins Thursday at 3:00 PM. The complete schedule is attached.\n\nThanks,\nXiaowen'

  const genericText = chinese
    ? '这是一封用于展示 Mail 阅读体验的示例邮件。连接真实邮箱后，这里会显示邮件的完整正文与附件。'
    : 'This is a sample message for the Mail reading experience. Connect a real account to view complete message bodies and attachments here.'
  const genericHtml = `<p>${genericText}</p>`

  const details = Object.fromEntries(
    messages.map((message) => [
      message.id,
      {
        ...message,
        messageId: `<${message.id}@demo.mail>`,
        text: message.id === 'demo-work:504' ? firstText : genericText,
        html: message.id === 'demo-work:504' ? firstHtml : genericHtml,
        attachments:
          message.id === 'demo-work:504'
            ? [
                {
                  index: 0,
                  filename: chinese ? '活动流程-v4.pdf' : 'run-of-show-v4.pdf',
                  contentType: 'application/pdf',
                  size: 248_320
                }
              ]
            : []
      } satisfies MessageDetail
    ])
  )

  return { accounts, messages, previews, details }
}
