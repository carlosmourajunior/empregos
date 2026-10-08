import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'border-border bg-card placeholder:text-muted-foreground/70 min-h-14 w-full rounded-lg border-2 px-4 text-xl',
        'focus:border-primary aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}
