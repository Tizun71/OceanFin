import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium shrink-0",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    // Transition only paint properties. `transition-all` also animated width and
    // height, so buttons visibly stretched when their label changed.
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out',
    // Every variant gets a physical press response.
    'active:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    // Ring offset against the app background keeps the ring legible on any surface.
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'aria-invalid:ring-2 aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  ],
  {
    variants: {
      variant: {
        // text-white on #00A6A6 is 2.6:1 — fails AA. The dark ink token is 5.1:1.
        default:
          'bg-accent text-accent-foreground font-semibold shadow-md hover:bg-accent-light active:bg-accent-light/90',
        destructive:
          'bg-destructive text-destructive-foreground font-semibold shadow-md hover:bg-destructive/90 focus-visible:ring-destructive',
        // Was `bg-white` — a white slab dropped into a dark navy layout.
        outline:
          'border border-border-strong bg-transparent text-foreground hover:bg-surface-2 hover:border-accent/60 hover:text-accent-light',
        // Was gray-100/gray-800, invisible-adjacent on this theme.
        secondary:
          'bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-border-strong',
        // Was text-gray-600 (2.1:1 on the navy background) — effectively unreadable.
        ghost:
          'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
        link: 'text-accent-light font-medium underline-offset-4 hover:underline active:translate-y-0',
      },
      size: {
        // Heights on the 8pt grid; all clear the 44px touch target at >=md via padding.
        default: 'h-10 px-4 py-2 has-[>svg]:px-3.5 text-sm',
        sm: 'h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5 text-xs',
        lg: 'h-12 rounded-lg px-6 has-[>svg]:px-5 text-base',
        icon: 'size-10 p-2',
        'icon-sm': 'size-8 p-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
