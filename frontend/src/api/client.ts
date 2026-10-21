import type {
  TeamMember,
  MemberCreateInput,
  MemberUpdateInput,
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  DashboardStats,
  TaskFilters,
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
  getMembers: (): Promise<TeamMember[]> => apiFetch<TeamMember[]>("/members"),
  getMember: (id: number): Promise<TeamMember> => apiFetch<TeamMember>(`/members/${id}`),
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

  getTasks: (filters?: TaskFilters): Promise<Task[]> => {
    const params = new URLSearchParams()
    if (filters?.search) params.append("search", filters.search)
    if (filters?.status && filters.status !== "ALL") params.append("status", filters.status)
    if (filters?.priority && filters.priority !== "ALL") params.append("priority", filters.priority)
    if (filters?.assignee_id && filters.assignee_id !== "ALL")
      params.append("assignee_id", String(filters.assignee_id))

    const queryString = params.toString() ? `?${params.toString()}` : ""
    return apiFetch<Task[]>(`/tasks${queryString}`)
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
