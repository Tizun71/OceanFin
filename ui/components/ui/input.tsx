import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // h-10 matches Button's default height so inputs and buttons line up in
        // a filter row; h-9 left a 4px baseline mismatch everywhere they paired.
        'flex h-10 w-full min-w-0 rounded-md border border-border bg-input px-3 py-2',
        'text-base md:text-sm text-foreground shadow-sm',
        // Placeholder must stay distinguishable from an entered value.
        'placeholder:text-muted-foreground-subtle',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'selection:bg-primary selection:text-primary-foreground',
        'transition-[color,box-shadow,border-color] outline-none',
        'hover:border-border-strong',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
