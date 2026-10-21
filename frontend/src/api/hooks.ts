import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { api } from "./client"
import type {
  MemberCreateInput,
  MemberUpdateInput,
  TaskCreateInput,
  TaskUpdateInput,
  TaskFilters,
} from "@/types"

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  members: (page = 1, pageSize = 10) => ["members", page, pageSize] as const,
  memberOptions: ["members", "options"] as const,
  tasks: (filters?: TaskFilters, page = 1, pageSize = 10) =>
    ["tasks", filters, page, pageSize] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.getDashboardStats(),
  })
}

export function useMembers(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: queryKeys.members(page, pageSize),
    queryFn: () => api.getMembers(page, pageSize),
    placeholderData: keepPreviousData,
  })
}

export function useMemberOptions() {
  return useQuery({
    queryKey: queryKeys.memberOptions,
    queryFn: () => api.getMemberOptions(),
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MemberCreateInput) => api.createMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] })
    },
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MemberUpdateInput }) =>
      api.updateMember(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

export function useDeleteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useTasks(filters?: TaskFilters, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: queryKeys.tasks(filters, page, pageSize),
    queryFn: () => api.getTasks(filters, page, pageSize),
    placeholderData: keepPreviousData,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskCreateInput) => api.createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TaskUpdateInput }) =>
      api.updateTask(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}
