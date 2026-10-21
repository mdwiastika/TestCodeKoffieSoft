import { useState } from "react"
import type { Task, TaskCreateInput } from "@/types"
import { useDashboardStats, useMemberOptions, useUpdateTask } from "@/api/hooks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { Button } from "@/components/ui/button"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Plus,
  AlertCircle,
  Calendar,
  Sparkles,
} from "lucide-react"

interface DashboardProps {
  onNavigateToTasks: (statusFilter?: string) => void
  onOpenCreateTask: () => void
}

export function Dashboard({ onNavigateToTasks, onOpenCreateTask }: DashboardProps) {
  const { showToast } = useToast()
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats()

  const { data: memberOptions = [] } = useMemberOptions()
  const updateTaskMutation = useUpdateTask()

  if (isStatsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isStatsError) {
    return (
      <ErrorState
        title="Failed to load dashboard metrics"
        message={statsError instanceof Error ? statsError.message : "Unable to fetch summary counts"}
        onRetry={() => refetchStats()}
      />
    )
  }

  const total = stats?.total ?? 0
  const done = stats?.done ?? 0
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
  const needsAttention = stats?.needs_attention || []

  const handleEditSubmit = async (data: TaskCreateInput) => {
    if (!taskToEdit) return
    try {
      await updateTaskMutation.mutateAsync({
        id: taskToEdit.id,
        input: data,
      })
      showToast("Task updated successfully", "success")
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update task",
        "error"
      )
      throw err
    }
  }

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "To Do":
        return <Badge variant="todo">To Do</Badge>
      case "In Progress":
        return <Badge variant="inProgress">In Progress</Badge>
      case "Done":
        return <Badge variant="done">Done</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Workspace Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time status of deliverables and pending deadlines.
          </p>
        </div>
        <div className="flex items-center">
          <Button onClick={onOpenCreateTask} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card
          className="cursor-pointer hover:border-slate-400 transition-colors"
          onClick={() => onNavigateToTasks()}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Total
            </CardTitle>
            <Layers className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{total}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-slate-400 transition-colors"
          onClick={() => onNavigateToTasks("To Do")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              To Do
            </CardTitle>
            <ListTodo className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800">{stats?.todo ?? 0}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => onNavigateToTasks("In Progress")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs text-blue-700 font-medium uppercase tracking-wider">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">{stats?.in_progress ?? 0}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-emerald-300 transition-colors"
          onClick={() => onNavigateToTasks("Done")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs text-emerald-800 font-medium uppercase tracking-wider">
              Done
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-900">{done}</div>
          </CardContent>
        </Card>

        <Card
          className="col-span-2 sm:col-span-1 border-red-300 bg-red-50/40 cursor-pointer hover:bg-red-50/70 transition-colors"
          onClick={() => onNavigateToTasks()}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <div className="flex items-center space-x-1.5">
              <AlertOctagon className="h-4 w-4 text-red-600 shrink-0" />
              <CardTitle className="text-xs text-red-700 font-bold uppercase tracking-wider">
                Overdue
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-red-700">{stats?.overdue ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700">Project Completion</span>
          <span className="font-bold text-slate-900">{completionRate}% ({done}/{total})</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Needs Attention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Overdue and soonest upcoming tasks (max 5)
            </p>
          </div>
          {needsAttention.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              Click a task to review
            </span>
          )}
        </div>

        {needsAttention.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-600 mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-500 mt-0.5">
              No overdue or urgent deliverables pending.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {needsAttention.map((task) => (
              <div
                key={task.id}
                onClick={() => setTaskToEdit(task)}
                className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setTaskToEdit(task)
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    {task.is_overdue && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                    )}
                    <h3 className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-slate-500">
                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className={task.is_overdue ? "font-semibold text-red-600" : "text-slate-600"}>
                      {formatDate(task.due_date)}
                    </span>
                    {task.is_overdue && (
                      <span className="font-semibold text-red-600">&bull; Overdue</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-1.5">
                  {getStatusBadge(task.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskFormDialog
        isOpen={Boolean(taskToEdit)}
        onClose={() => setTaskToEdit(null)}
        taskToEdit={taskToEdit}
        members={memberOptions}
        onSubmit={handleEditSubmit}
        isSubmitting={updateTaskMutation.isPending}
      />
    </div>
  )
}
