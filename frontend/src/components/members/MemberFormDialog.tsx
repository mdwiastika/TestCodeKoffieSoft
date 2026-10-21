import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { TeamMember, MemberCreateInput } from "@/types"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

const memberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address (e.g. name@company.com)"),
})

type MemberFormValues = z.infer<typeof memberSchema>

interface MemberFormDialogProps {
  isOpen: boolean
  onClose: () => void
  memberToEdit?: TeamMember | null
  onSubmit: (data: MemberCreateInput) => Promise<void>
  isSubmitting: boolean
}

export function MemberFormDialog({
  isOpen,
  onClose,
  memberToEdit,
  onSubmit,
  isSubmitting,
}: MemberFormDialogProps) {
  const isEditing = Boolean(memberToEdit)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const handleClose = () => {
    setServerError(null)
    clearErrors()
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      if (memberToEdit) {
        reset({
          name: memberToEdit.name,
          email: memberToEdit.email,
        })
      } else {
        reset({
          name: "",
          email: "",
        })
      }
    }
  }, [isOpen, memberToEdit, reset])

  const handleFormSubmit = async (values: MemberFormValues) => {
    setServerError(null)
    clearErrors()
    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
      })
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save team member"
      setServerError(msg)
      if (msg.toLowerCase().includes("email")) {
        setError("email", { type: "server", message: msg })
      }
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Team Member" : "Add Team Member"}
      description={
        isEditing
          ? "Update member profile information."
          : "Add a colleague to assign tasks and track contributions."
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md bg-red-50 p-2.5 text-xs font-medium text-red-800 border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. John Doe"
            {...register("name", {
              onChange: () => {
                if (serverError) setServerError(null)
              },
            })}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="e.g. john@company.com"
            {...register("email", {
              onChange: () => {
                if (serverError) setServerError(null)
                clearErrors("email")
              },
            })}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
              ? "Save Changes"
              : "Add Member"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
