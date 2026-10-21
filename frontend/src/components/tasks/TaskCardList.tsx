import type { Task } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { AlertCircle, Calendar, Edit, Trash2, User } from "lucide-react"

interface TaskCardListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onQuickStatusChange: (task: Task, newStatus: Task["status"]) => void
}

export function TaskCardList({
  tasks,
  onEdit,
  onDelete,
  onQuickStatusChange,
}: TaskCardListProps) {
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

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "Low":
        return <Badge variant="low">Low</Badge>
      case "Medium":
        return <Badge variant="medium">Medium</Badge>
      case "High":
        return <Badge variant="high">High</Badge>
    }
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
            task.is_overdue
              ? "border-red-300 bg-red-50/10"
              : "border-slate-200"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-1.5">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>

            {task.is_overdue && (
              <Badge variant="overdue" className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>Overdue</span>
              </Badge>
            )}
          </div>

          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
            {task.title}
          </h4>
          {task.description && (
            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              {task.assignee ? (
                <>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-700">
                    {task.assignee.name}
                  </span>
                </>
              ) : (
                <span className="italic text-slate-400 flex items-center space-x-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Unassigned</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span
                className={
                  task.is_overdue ? "font-semibold text-red-600" : "text-slate-600"
                }
              >
                {formatDate(task.due_date)}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-400">Move to:</span>
              <select
                value={task.status}
                onChange={(e) =>
                  onQuickStatusChange(task, e.target.value as Task["status"])
                }
                className="text-[11px] bg-slate-100 text-slate-700 rounded px-1.5 py-0.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                aria-label="Quick status select"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 px-2 text-slate-600 hover:text-slate-900"
                aria-label="Edit task"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task)}
                className="h-8 px-2 text-slate-600 hover:text-red-600"
                aria-label="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
