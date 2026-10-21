import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/components/ui/toast"
import { Navbar, type TabType } from "@/components/layout/Navbar"
import { Dashboard } from "@/pages/Dashboard"
import { TasksPage } from "@/pages/TasksPage"
import { MembersPage } from "@/pages/MembersPage"
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog"
import { useMembers, useCreateTask } from "@/api/hooks"
import { useToast } from "@/components/ui/toast"
import type { TaskCreateInput, TaskFilters } from "@/types"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function MainApp() {
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard")
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    search: "",
    status: "ALL",
    priority: "ALL",
    assignee_id: "ALL",
  })
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)

  const { data: members = [] } = useMembers()
  const createTaskMutation = useCreateTask()
  const { showToast } = useToast()

  const handleNavigateToTasks = (statusFilter?: string) => {
    if (statusFilter) {
      setTaskFilters({
        search: "",
        status: statusFilter,
        priority: "ALL",
        assignee_id: "ALL",
      })
    }
    setCurrentTab("tasks")
  }

  const handleQuickCreateSubmit = async (data: TaskCreateInput) => {
    try {
      await createTaskMutation.mutateAsync(data)
      showToast("Task created successfully", "success")
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to create task",
        "error"
      )
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-5 sm:px-6 py-6 sm:py-8">
        {currentTab === "dashboard" && (
          <Dashboard
            onNavigateToTasks={handleNavigateToTasks}
            onOpenCreateTask={() => setIsQuickCreateOpen(true)}
          />
        )}

        {currentTab === "tasks" && (
          <TasksPage key={JSON.stringify(taskFilters)} initialFilters={taskFilters} />
        )}

        {currentTab === "members" && <MembersPage />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-600 font-medium">
        Task Management Assessment &bull; PostgreSQL, FastAPI & React &bull; KoffieSoft
      </footer>

      <TaskFormDialog
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        members={members}
        onSubmit={handleQuickCreateSubmit}
        isSubmitting={createTaskMutation.isPending}
      />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </QueryClientProvider>
  )
}
