import { useDashboardStats, useTasks } from "@/api/hooks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Layers,
  ArrowRight,
  Plus,
  AlertCircle,
  User,
} from "lucide-react"

interface DashboardProps {
  onNavigateToTasks: (statusFilter?: string) => void
  onOpenCreateTask: () => void
}

export function Dashboard({ onNavigateToTasks, onOpenCreateTask }: DashboardProps) {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats()

  const {
    data: allTasks = [],
    isLoading: isTasksLoading,
  } = useTasks()

  if (isStatsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-14" />
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

  const completionRate =
    stats && stats.total > 0
      ? Math.round((stats.done / stats.total) * 100)
      : 0

  const urgentTasks = allTasks
    .filter((t) => t.is_overdue || (t.status !== "Done" && t.priority === "High"))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team Workspace Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time status of deliverables, individual assignments, and pending deadlines.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onOpenCreateTask} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
          <Button
            onClick={() => onNavigateToTasks()}
            variant="outline"
            size="sm"
          >
            View All Tasks
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card
          className="cursor-pointer hover:border-slate-400 transition-colors"
          onClick={() => onNavigateToTasks()}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600 font-medium">
              Total tasks
            </CardTitle>
            <Layers className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.total ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              {completionRate}% completed
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-slate-400 transition-colors"
          onClick={() => onNavigateToTasks("To Do")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600 font-medium">
              To do
            </CardTitle>
            <ListTodo className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats?.todo ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">Pending start</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => onNavigateToTasks("In Progress")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-blue-700 font-medium">
              In progress
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats?.in_progress ?? 0}</div>
            <p className="text-xs text-blue-600 mt-1.5 font-medium">Active work</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-emerald-300 transition-colors"
          onClick={() => onNavigateToTasks("Done")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-emerald-800 font-medium">
              Done
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{stats?.done ?? 0}</div>
            <p className="text-xs text-emerald-800 mt-1.5 font-medium">Resolved</p>
          </CardContent>
        </Card>

        <Card
          className="col-span-2 sm:col-span-1 border-red-300 bg-red-50/50 cursor-pointer hover:bg-red-50/80 transition-colors"
          onClick={() => onNavigateToTasks()}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-red-700 font-semibold">
              Overdue
            </CardTitle>
            <AlertOctagon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats?.overdue ?? 0}</div>
            <p className="text-xs text-red-600 font-medium mt-1.5">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Immediate Attention Items
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Overdue deliverables and high priority tasks currently open.
            </p>
          </div>
          <Button
            onClick={() => onNavigateToTasks()}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            View all tasks <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>

        {isTasksLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : urgentTasks.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">
            No urgent or overdue tasks at this time. All schedules are on track!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {urgentTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors rounded px-2 -mx-2"
              >
                <div className="flex items-start space-x-3">
                  {task.is_overdue ? (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {task.title}
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                      <span>Due: {formatDate(task.due_date)}</span>
                      <span>&bull;</span>
                      <span>Priority: {task.priority}</span>
                      <span>&bull;</span>
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{task.assignee ? task.assignee.name : "Unassigned"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:self-center">
                  {task.is_overdue && (
                    <Badge variant="overdue">Overdue</Badge>
                  )}
                  <Badge
                    variant={
                      task.status === "To Do"
                        ? "todo"
                        : task.status === "In Progress"
                        ? "inProgress"
                        : "done"
                    }
                  >
                    {task.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onNavigateToTasks()}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-900">Assessment Rule:</span>
          <span>
            Overdue tasks are strictly calculated as{" "}
            <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
              due_date &lt; today
            </code>{" "}
            AND{" "}
            <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
              status != Done
            </code>
            .
          </span>
        </div>
        <span className="text-slate-600 font-semibold">Done tasks are never marked overdue.</span>
      </div>
    </div>
  )
}
