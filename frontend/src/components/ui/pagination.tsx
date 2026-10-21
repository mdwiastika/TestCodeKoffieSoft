import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (newPage: number) => void
  className?: string
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (total <= 0) return null

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (page > 3) {
        pages.push("ellipsis-start")
      }
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (page < totalPages - 2) {
        pages.push("ellipsis-end")
      }
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100",
        className
      )}
    >
      <div className="text-xs text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
        Showing <span className="font-semibold text-slate-800">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-800">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-800">{total}</span> items
      </div>

      <div className="flex items-center space-x-1.5 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 px-2.5 text-xs text-slate-700"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="sm:hidden px-2 text-xs font-semibold text-slate-700">
          Page {page} of {totalPages || 1}
        </div>

        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span
                  key={`${p}-${idx}`}
                  className="px-2 text-xs text-slate-400 select-none"
                >
                  &hellip;
                </span>
              )
            }
            const isCurrent = p === page
            return (
              <Button
                key={p}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  isCurrent
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                {p}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 px-2.5 text-xs text-slate-700"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
        </Button>
      </div>
    </div>
  )
}
