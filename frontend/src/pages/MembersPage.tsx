import { useState } from "react"
import type { TeamMember, MemberCreateInput } from "@/types"
import {
  useMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
} from "@/api/hooks"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MemberFormDialog } from "@/components/members/MemberFormDialog"
import { formatDate } from "@/lib/utils"
import { Plus, Users, Mail, Calendar, Edit, Trash2 } from "lucide-react"

export function MembersPage() {
  const { showToast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)

  const { data: members = [], isLoading, isError, error, refetch } = useMembers()
  const createMemberMutation = useCreateMember()
  const updateMemberMutation = useUpdateMember()
  const deleteMemberMutation = useDeleteMember()

  const handleOpenCreate = () => {
    setMemberToEdit(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (member: TeamMember) => {
    setMemberToEdit(member)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: MemberCreateInput) => {
    try {
      if (memberToEdit) {
        await updateMemberMutation.mutateAsync({
          id: memberToEdit.id,
          input: data,
        })
        showToast("Team member updated successfully", "success")
      } else {
        await createMemberMutation.mutateAsync(data)
        showToast("Team member added successfully", "success")
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save team member",
        "error"
      )
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return
    try {
      await deleteMemberMutation.mutateAsync(memberToDelete.id)
      showToast(
        `Deleted ${memberToDelete.name}. Any assigned tasks have been unassigned.`,
        "success"
      )
      setMemberToDelete(null)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete team member",
        "error"
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team Members
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage your colleagues and task assignees.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Member
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load team members"
          message={error instanceof Error ? error.message : "Network error fetching members"}
          onRetry={() => refetch()}
        />
      ) : members.length === 0 ? (
        <EmptyState
          title="No team members yet"
          description="Add members to assign tasks and track individual responsibilities."
          actionLabel="Add first member"
          onAction={handleOpenCreate}
          icon={<Users className="h-6 w-6" />}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-slate-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(member.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(member)}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                          aria-label="Edit member"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMemberToDelete(member)}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-red-600"
                          aria-label="Delete member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>Joined {formatDate(member.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(member)}
                      className="h-8 px-2 text-slate-600 hover:text-slate-900"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMemberToDelete(member)}
                      className="h-8 px-2 text-slate-600 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <MemberFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        memberToEdit={memberToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={
          createMemberMutation.isPending || updateMemberMutation.isPending
        }
      />

      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Team Member"
        message={`Are you sure you want to remove "${memberToDelete?.name}"? Any tasks currently assigned to this member will remain intact and be unassigned (assignee_id set to NULL).`}
        confirmText="Remove Member"
        isLoading={deleteMemberMutation.isPending}
      />
    </div>
  )
}
