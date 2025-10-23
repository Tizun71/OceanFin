import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white shadow-md hover:bg-accent/90 active:bg-accent/80 transition-all duration-200',
        destructive:
          'bg-destructive text-white shadow-md hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20',
        outline:
          'border-2 border-accent bg-white text-accent shadow-sm hover:bg-accent hover:text-white active:bg-accent/90',
        secondary:
          'bg-gray-100 text-gray-800 shadow-sm hover:bg-gray-200 active:bg-gray-300 border border-gray-200',
        ghost:
          'text-gray-600 hover:bg-accent/10 hover:text-accent active:bg-accent/20',
        link: 'text-accent font-medium hover:text-accent/80 active:text-accent/70 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2 has-[>svg]:px-4 text-sm font-medium',
        sm: 'h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3 text-xs font-medium',
        lg: 'h-12 rounded-md px-6 has-[>svg]:px-5 text-base font-medium',
        icon: 'size-10 p-2',
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
