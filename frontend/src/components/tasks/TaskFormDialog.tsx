import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Task, TeamMember, TaskCreateInput } from "@/types"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z.string().optional().nullable(),
  assignee_id: z.string().optional().nullable(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  due_date: z.string().optional().nullable(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormDialogProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: Task | null
  members: TeamMember[]
  onSubmit: (data: TaskCreateInput) => Promise<void>
  isSubmitting: boolean
}

export function TaskFormDialog({
  isOpen,
  onClose,
  taskToEdit,
  members,
  onSubmit,
  isSubmitting,
}: TaskFormDialogProps) {
  const isEditing = Boolean(taskToEdit)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee_id: "UNASSIGNED",
      status: "To Do",
      priority: "Medium",
      due_date: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        reset({
          title: taskToEdit.title,
          description: taskToEdit.description || "",
          assignee_id: taskToEdit.assignee_id ? String(taskToEdit.assignee_id) : "UNASSIGNED",
          status: taskToEdit.status,
          priority: taskToEdit.priority,
          due_date: taskToEdit.due_date || "",
        })
      } else {
        reset({
          title: "",
          description: "",
          assignee_id: "UNASSIGNED",
          status: "To Do",
          priority: "Medium",
          due_date: "",
        })
      }
    }
  }, [isOpen, taskToEdit, reset])

  const handleFormSubmit = async (values: TaskFormValues) => {
    const parsedAssigneeId =
      values.assignee_id && values.assignee_id !== "UNASSIGNED"
        ? parseInt(values.assignee_id, 10)
        : null

    const payload: TaskCreateInput = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      assignee_id: parsedAssigneeId,
      status: values.status,
      priority: values.priority,
      due_date: values.due_date && values.due_date.trim() ? values.due_date : null,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Create New Task"}
      description={
        isEditing
          ? "Update details, reassign, or adjust schedule."
          : "Fill in task details to organize team deliverables."
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Design user interface prototype"
            {...register("title")}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Add context, acceptance criteria, or links..."
            rows={3}
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Status
            </label>
            <Select {...register("status")}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Priority
            </label>
            <Select {...register("priority")}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Assignee <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Select {...register("assignee_id")}>
              <option value="UNASSIGNED">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name} ({m.email})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Due Date <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Input type="date" {...register("due_date")} />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
              ? "Save Changes"
              : "Create Task"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
