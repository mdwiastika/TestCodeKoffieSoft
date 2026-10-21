import { useState } from "react"
import type { TaskFilters, MemberOption } from "@/types"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/dialog"
import { Search, SlidersHorizontal, X } from "lucide-react"

interface TaskFiltersBarProps {
  filters: TaskFilters
  onFilterChange: (filters: TaskFilters) => void
  members: MemberOption[]
}

export function TaskFiltersBar({
  filters,
  onFilterChange,
  members,
}: TaskFiltersBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value })
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value })
  }

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, assignee_id: e.target.value })
  }

  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      status: "ALL",
      priority: "ALL",
      assignee_id: "ALL",
      is_overdue: undefined,
    })
  }

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      (filters.status && filters.status !== "ALL") ||
      (filters.priority && filters.priority !== "ALL") ||
      (filters.assignee_id && filters.assignee_id !== "ALL") ||
      filters.is_overdue
  )

  const activeCount = [
    Boolean(filters.search && filters.search.trim().length > 0),
    Boolean(filters.status && filters.status !== "ALL"),
    Boolean(filters.priority && filters.priority !== "ALL"),
    Boolean(filters.assignee_id && filters.assignee_id !== "ALL"),
    Boolean(filters.is_overdue),
  ].filter(Boolean).length

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search tasks by title..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="md:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMobileSheetOpen(true)}
            className="relative h-9 px-3"
            aria-label="Open filter sheet"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="w-36">
            <Select
              value={filters.status || "ALL"}
              onChange={handleStatusChange}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </Select>
          </div>

          <div className="w-36">
            <Select
              value={filters.priority || "ALL"}
              onChange={handlePriorityChange}
              aria-label="Filter by priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>

          <div className="w-44">
            <Select
              value={filters.assignee_id || "ALL"}
              onChange={handleAssigneeChange}
              aria-label="Filter by assignee"
            >
              <option value="ALL">All Assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {filters.is_overdue && (
        <div className="flex items-center gap-2 pt-0.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <span>Filtered by: <strong>Overdue tasks only</strong></span>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, is_overdue: undefined })}
              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-rose-600 hover:bg-rose-200/50 hover:text-rose-900"
              aria-label="Remove overdue filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      <Sheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        title="Filter Tasks"
      >
        <div className="flex flex-col space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Status
            </label>
            <Select
              value={filters.status || "ALL"}
              onChange={handleStatusChange}
            >
              <option value="ALL">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Priority
            </label>
            <Select
              value={filters.priority || "ALL"}
              onChange={handlePriorityChange}
            >
              <option value="ALL">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Assignee
            </label>
            <Select
              value={filters.assignee_id || "ALL"}
              onChange={handleAssigneeChange}
            >
              <option value="ALL">All Assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Overdue Tasks
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(filters.is_overdue)}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    is_overdue: e.target.checked ? true : undefined,
                  })
                }
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Show only overdue tasks</span>
            </label>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleClearFilters()
                  setIsMobileSheetOpen(false)
                }}
              >
                Clear all filters
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => setIsMobileSheetOpen(false)}
            >
              Apply & Close
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
