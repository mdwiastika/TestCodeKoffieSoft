import type { Task } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { AlertCircle, Edit, Trash2, User } from "lucide-react"

interface TaskTableProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onQuickStatusChange: (task: Task, newStatus: Task["status"]) => void
}

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onQuickStatusChange,
}: TaskTableProps) {
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
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
            <th className="py-3 px-4 w-2/5">Title</th>
            <th className="py-3 px-3">Assignee</th>
            <th className="py-3 px-3">Status</th>
            <th className="py-3 px-3">Priority</th>
            <th className="py-3 px-3">Due Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            return (
              <tr
                key={task.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="py-3 px-4 align-top">
                  <div className="font-semibold text-slate-900 leading-snug">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-slate-500 line-clamp-1 mt-0.5 text-[11px]">
                      {task.description}
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 align-top whitespace-nowrap">
                  {task.assignee ? (
                    <div className="flex items-center space-x-1.5 text-slate-700">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium truncate max-w-[120px]">
                        {task.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic flex items-center space-x-1">
                      <User className="h-3 w-3 inline" />
                      <span>Unassigned</span>
                    </span>
                  )}
                </td>

                <td className="py-3 px-3 align-top whitespace-nowrap">
                  <div className="flex items-center space-x-1.5">
                    {getStatusBadge(task.status)}
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onQuickStatusChange(task, e.target.value as Task["status"])
                      }
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[10px] text-slate-500 bg-transparent border border-slate-200 rounded px-1 py-0.5 transition-opacity cursor-pointer"
                      title="Quick change status"
                      aria-label="Change task status"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </td>

                <td className="py-3 px-3 align-top whitespace-nowrap">
                  {getPriorityBadge(task.priority)}
                </td>

                <td className="py-3 px-3 align-top whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span
                      className={
                        task.is_overdue
                          ? "font-semibold text-red-600"
                          : "text-slate-600"
                      }
                    >
                      {formatDate(task.due_date)}
                    </span>
                    {task.is_overdue && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-red-600">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                      aria-label="Edit task"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(task)}
                      className="h-7 w-7 p-0 text-slate-500 hover:text-red-600"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
