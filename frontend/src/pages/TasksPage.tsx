import { useState } from "react"
import type { Task, TaskCreateInput, TaskFilters } from "@/types"
import {
  useTasks,
  useMembers,
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
import { Plus, ListTodo } from "lucide-react"

interface TasksPageProps {
  initialFilters?: TaskFilters
}

export function TasksPage({ initialFilters }: TasksPageProps) {
  const { showToast } = useToast()

  const [filters, setFilters] = useState<TaskFilters>(
    initialFilters || {
      search: "",
      status: "ALL",
      priority: "ALL",
      assignee_id: "ALL",
    }
  )

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const { data: members = [] } = useMembers()
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTasks(filters)

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

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
        onFilterChange={setFilters}
        members={members}
      />

      {isLoading ? (
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
            filters.search ||
            (filters.status && filters.status !== "ALL") ||
            (filters.priority && filters.priority !== "ALL") ||
            (filters.assignee_id && filters.assignee_id !== "ALL")
              ? "No tasks match your current filter criteria. Try adjusting or clearing your filters."
              : "Get started by adding your team's first deliverable."
          }
          actionLabel={
            filters.search ||
            (filters.status && filters.status !== "ALL") ||
            (filters.priority && filters.priority !== "ALL") ||
            (filters.assignee_id && filters.assignee_id !== "ALL")
              ? "Clear filters"
              : "Create first task"
          }
          onAction={
            filters.search ||
            (filters.status && filters.status !== "ALL") ||
            (filters.priority && filters.priority !== "ALL") ||
            (filters.assignee_id && filters.assignee_id !== "ALL")
              ? () =>
                  setFilters({
                    search: "",
                    status: "ALL",
                    priority: "ALL",
                    assignee_id: "ALL",
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
        </>
      )}

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        taskToEdit={taskToEdit}
        members={members}
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
