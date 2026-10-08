import { Briefcase } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Logo({ claro, className }: { claro?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xl font-extrabold tracking-tight', className)}>
      <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-xl shadow-sm">
        <Briefcase className="size-5" strokeWidth={2.5} />
      </span>
      <span className={claro ? 'text-white' : 'text-foreground'}>
        Meu<span className={claro ? 'text-accent' : 'text-primary'}>Emprego</span>
      </span>
    </span>
  )
}
