import type {
  TeamMember,
  MemberOption,
  MemberCreateInput,
  MemberUpdateInput,
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  DashboardStats,
  TaskFilters,
  PaginatedTasks,
  PaginatedMembers,
} from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 204) {
    return {} as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail || `Request failed with status ${response.status}`
    throw new Error(detail)
  }

  return data as T
}

export const api = {
  getMembers: (page = 1, pageSize = 10): Promise<PaginatedMembers> =>
    apiFetch<PaginatedMembers>(`/members?page=${page}&page_size=${pageSize}`),
  getMemberOptions: (): Promise<MemberOption[]> =>
    apiFetch<MemberOption[]>("/members/options"),
  getMember: (id: number): Promise<TeamMember> =>
    apiFetch<TeamMember>(`/members/${id}`),
  createMember: (input: MemberCreateInput): Promise<TeamMember> =>
    apiFetch<TeamMember>("/members", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateMember: (id: number, input: MemberUpdateInput): Promise<TeamMember> =>
    apiFetch<TeamMember>(`/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteMember: (id: number): Promise<void> =>
    apiFetch<void>(`/members/${id}`, {
      method: "DELETE",
    }),

  getTasks: (
    filters?: TaskFilters,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedTasks> => {
    const params = new URLSearchParams()
    params.append("page", String(page))
    params.append("page_size", String(pageSize))
    if (filters?.search) params.append("search", filters.search)
    if (filters?.status && filters.status !== "ALL") params.append("status", filters.status)
    if (filters?.priority && filters.priority !== "ALL") params.append("priority", filters.priority)
    if (filters?.assignee_id && filters.assignee_id !== "ALL")
      params.append("assignee_id", String(filters.assignee_id))
    if (filters?.is_overdue) {
      params.append("is_overdue", "true")
    }

    return apiFetch<PaginatedTasks>(`/tasks?${params.toString()}`)
  },
  getTask: (id: number): Promise<Task> => apiFetch<Task>(`/tasks/${id}`),
  createTask: (input: TaskCreateInput): Promise<Task> =>
    apiFetch<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateTask: (id: number, input: TaskUpdateInput): Promise<Task> =>
    apiFetch<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteTask: (id: number): Promise<void> =>
    apiFetch<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),

  getDashboardStats: (): Promise<DashboardStats> =>
    apiFetch<DashboardStats>("/dashboard"),
}
