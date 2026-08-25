import type { ReactNode, SVGProps } from 'react'

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export const InboxIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M4 4h16v13H4z"/><path d="m4 5 8 6 8-6"/><path d="M8 20h8"/></Icon>
export const PlusIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M12 5v14M5 12h14"/></Icon>
export const SearchIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>
export const RefreshIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 8A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 11.9-2"/></Icon>
export const StarIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m12 3 2.7 5.4 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9z"/></Icon>
export const PaperclipIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m20.5 11.5-8.7 8.7a6 6 0 0 1-8.5-8.5l9.4-9.4a4 4 0 0 1 5.7 5.7L9 17.4a2 2 0 0 1-2.8-2.8l8.7-8.7"/></Icon>
export const TrashIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></Icon>
export const CloseIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m6 6 12 12M18 6 6 18"/></Icon>
export const ShieldIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M12 3 5 6v5c0 4.8 2.8 8.1 7 10 4.2-1.9 7-5.2 7-10V6z"/><path d="m9 12 2 2 4-5"/></Icon>
export const ChevronIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m9 18 6-6-6-6"/></Icon>
export const AlertIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M12 3 2.7 20h18.6z"/><path d="M12 9v4M12 17h.01"/></Icon>
export const CheckIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m5 12 4 4L19 6"/></Icon>
export const LockIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></Icon>
export const ServerIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></Icon>
export const EyeIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12"/><circle cx="12" cy="12" r="2.5"/></Icon>
export const ArrowLeftIcon = (props: SVGProps<SVGSVGElement>) => <Icon {...props}><path d="m15 18-6-6 6-6"/></Icon>
