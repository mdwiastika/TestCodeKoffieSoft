export type TaskStatus = "To Do" | "In Progress" | "Done"
export type TaskPriority = "Low" | "Medium" | "High"

export interface TeamMember {
  id: number
  name: string
  email: string
  created_at: string
}

export interface MemberOption {
  id: number
  name: string
}

export interface MemberCreateInput {
  name: string
  email: string
}

export interface MemberUpdateInput {
  name?: string
  email?: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  assignee_id: number | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  is_overdue: boolean
  assignee?: TeamMember | null
}

export interface TaskCreateInput {
  title: string
  description?: string | null
  assignee_id?: number | null
  status: TaskStatus
  priority: TaskPriority
  due_date?: string | null
}

export interface TaskUpdateInput {
  title?: string
  description?: string | null
  assignee_id?: number | null
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
}

export interface DashboardStats {
  total: number
  todo: number
  in_progress: number
  done: number
  overdue: number
  needs_attention: Task[]
}

export interface TaskFilters {
  search?: string
  status?: string
  priority?: string
  assignee_id?: string | number
  is_overdue?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type PaginatedTasks = PaginatedResponse<Task>
export type PaginatedMembers = PaginatedResponse<TeamMember>
