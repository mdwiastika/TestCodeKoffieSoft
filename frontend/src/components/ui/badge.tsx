import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white shadow hover:bg-slate-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
        destructive:
          "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
        outline: "border-slate-200 text-slate-800",
        todo: "border-slate-200 bg-slate-50 text-slate-700",
        inProgress: "border-blue-200 bg-blue-50 text-blue-700",
        done: "border-emerald-200 bg-emerald-50 text-emerald-700",
        low: "border-slate-200 bg-slate-50 text-slate-600",
        medium: "border-amber-200 bg-amber-50 text-amber-700",
        high: "border-rose-200 bg-rose-50 text-rose-700",
        overdue: "border-red-300 bg-red-50 text-red-700 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
