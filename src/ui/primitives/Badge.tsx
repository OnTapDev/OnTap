import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-olive-gold/20 text-olive-gold",
        secondary: "bg-warm-sand/20 text-warm-sand",
        success: "bg-green-500/20 text-green-400",
        warning: "bg-yellow-500/20 text-yellow-400",
        destructive: "bg-red-500/20 text-red-400",
        outline: "border border-warm-sand/30 text-warm-sand",
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
