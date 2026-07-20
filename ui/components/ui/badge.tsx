import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "[&_svg]:size-3 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-border bg-surface-2 text-foreground",
        destructive:
          "border-destructive/30 bg-destructive/15 text-destructive",
        success:
          "border-success/30 bg-success/15 text-success",
        warning:
          "border-warning/30 bg-warning/15 text-warning",
        // Was `bg-background` — an opaque navy chip punched through the glass
        // surfaces it sat on. Transparent lets the card show through.
        outline:
          "text-muted-foreground border-border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };