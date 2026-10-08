import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

// Botões grandes (mínimo 48px) para facilitar o toque no celular.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-3 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        outline: 'border-2 border-border bg-card hover:bg-muted',
        ghost: 'hover:bg-muted',
      },
      size: {
        default: 'min-h-12 px-6 text-lg',
        lg: 'min-h-16 px-8 text-xl',
        sm: 'min-h-10 px-4 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
