import { useState, useEffect, useCallback } from "react"
import type { Task, TaskCreateInput, TaskFilters } from "@/types"
import {
  useTasks,
  useMemberOptions,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/api/hooks"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { TaskFiltersBar } from "@/components/tasks/TaskFiltersBar"
import { TaskTable } from "@/components/tasks/TaskTable"
import { TaskCardList } from "@/components/tasks/TaskCardList"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { Pagination } from "@/components/ui/pagination"
import { Plus, ListTodo } from "lucide-react"

const PAGE_SIZE = 10

interface TasksPageProps {
  initialFilters?: TaskFilters
}

function getInitialState(initialFilters?: TaskFilters) {
  const params = new URLSearchParams(window.location.search)
  const p = parseInt(params.get("page") || "1", 10)
  const isOverdue =
    params.get("is_overdue") === "true" ||
    params.get("status") === "Overdue" ||
    Boolean(initialFilters?.is_overdue) ||
    initialFilters?.status === "Overdue"

  const rawStatus = params.get("status") || initialFilters?.status || "ALL"
  const status = rawStatus === "Overdue" ? "ALL" : rawStatus

  return {
    page: isNaN(p) || p < 1 ? 1 : p,
    filters: {
      search: params.get("search") || initialFilters?.search || "",
      status,
      priority: params.get("priority") || initialFilters?.priority || "ALL",
      assignee_id: params.get("assignee_id") || initialFilters?.assignee_id || "ALL",
      is_overdue: isOverdue ? true : undefined,
    },
  }
}

export function TasksPage({ initialFilters }: TasksPageProps) {
  const { showToast } = useToast()

  const [initial] = useState(() => getInitialState(initialFilters))
  const [page, setPage] = useState<number>(initial.page)
  const [filters, setFilters] = useState<TaskFilters>(initial.filters)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const { data: memberOptions = [] } = useMemberOptions()
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useTasks(filters, page, PAGE_SIZE)

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const tasks = data?.items || []
  const total = data?.total || 0
  const totalPages = data?.total_pages || 0

  const syncUrl = useCallback((newPage: number, newFilters: TaskFilters) => {
    const url = new URL(window.location.href)
    if (newPage > 1) {
      url.searchParams.set("page", String(newPage))
    } else {
      url.searchParams.delete("page")
    }

    if (newFilters.search && newFilters.search.trim()) {
      url.searchParams.set("search", newFilters.search.trim())
    } else {
      url.searchParams.delete("search")
    }

    if (newFilters.status && newFilters.status !== "ALL") {
      url.searchParams.set("status", newFilters.status)
    } else {
      url.searchParams.delete("status")
    }

    if (newFilters.priority && newFilters.priority !== "ALL") {
      url.searchParams.set("priority", newFilters.priority)
    } else {
      url.searchParams.delete("priority")
    }

    if (newFilters.assignee_id && newFilters.assignee_id !== "ALL") {
      url.searchParams.set("assignee_id", String(newFilters.assignee_id))
    } else {
      url.searchParams.delete("assignee_id")
    }

    if (newFilters.is_overdue) {
      url.searchParams.set("is_overdue", "true")
    } else {
      url.searchParams.delete("is_overdue")
    }

    window.history.pushState(null, "", url.pathname + url.search)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    syncUrl(newPage, filters)
  }, [filters, syncUrl])

  const handleFilterChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters)
    setPage(1)
    syncUrl(1, newFilters)
  }, [syncUrl])

  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialState()
      setPage(state.page)
      setFilters(state.filters)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const handleOpenCreate = () => {
    setTaskToEdit(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: TaskCreateInput) => {
    try {
      if (taskToEdit) {
        await updateTaskMutation.mutateAsync({
          id: taskToEdit.id,
          input: data,
        })
        showToast("Task updated successfully", "success")
      } else {
        await createTaskMutation.mutateAsync(data)
        showToast("Task created successfully", "success")
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save task",
        "error"
      )
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return
    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id)
      showToast("Task deleted successfully", "success")
      setTaskToDelete(null)
      if (tasks.length === 1 && page > 1) {
        handlePageChange(page - 1)
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete task",
        "error"
      )
    }
  }

  const handleQuickStatusChange = async (
    task: Task,
    newStatus: Task["status"]
  ) => {
    if (task.status === newStatus) return
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        input: { status: newStatus },
      })
      showToast(`Task moved to "${newStatus}"`, "success")
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update status",
        "error"
      )
    }
  }

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      (filters.status && filters.status !== "ALL") ||
      (filters.priority && filters.priority !== "ALL") ||
      (filters.assignee_id && filters.assignee_id !== "ALL") ||
      filters.is_overdue
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Task Management
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Organize, prioritize, and assign tasks across your team.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create Task
        </Button>
      </div>

      <TaskFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        members={memberOptions}
      />

      {isLoading && tasks.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load tasks"
          message={error instanceof Error ? error.message : "Network error fetching task records"}
          onRetry={() => refetch()}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={
            hasActiveFilters
              ? "No tasks match your current filter criteria. Try adjusting or clearing your filters."
              : "Get started by adding your team's first deliverable."
          }
          actionLabel={hasActiveFilters ? "Clear filters" : "Create first task"}
          onAction={
            hasActiveFilters
              ? () =>
                  handleFilterChange({
                    search: "",
                    status: "ALL",
                    priority: "ALL",
                    assignee_id: "ALL",
                    is_overdue: undefined,
                  })
              : handleOpenCreate
          }
          icon={<ListTodo className="h-6 w-6" />}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <TaskTable
              tasks={tasks}
              onEdit={handleOpenEdit}
              onDelete={(task) => setTaskToDelete(task)}
              onQuickStatusChange={handleQuickStatusChange}
            />
          </div>

          <div className="md:hidden">
            <TaskCardList
              tasks={tasks}
              onEdit={handleOpenEdit}
              onDelete={(task) => setTaskToDelete(task)}
              onQuickStatusChange={handleQuickStatusChange}
            />
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        taskToEdit={taskToEdit}
        members={memberOptions}
        onSubmit={handleFormSubmit}
        isSubmitting={
          createTaskMutation.isPending || updateTaskMutation.isPending
        }
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  )
}
