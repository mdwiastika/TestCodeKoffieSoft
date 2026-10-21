import { CheckSquare, LayoutDashboard, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabType = "dashboard" | "tasks" | "members"

interface NavbarProps {
  currentTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Navbar({ currentTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
    { id: "tasks" as TabType, label: "Tasks", shortLabel: "Tasks", icon: CheckSquare },
    { id: "members" as TabType, label: "Team Members", shortLabel: "Team", icon: Users },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-bold text-xs tracking-wider shrink-0">
            TM
          </div>
          <span className="hidden sm:inline text-sm font-semibold tracking-tight text-slate-900">
            Task Management
          </span>
        </div>

        <nav className="flex items-center space-x-1" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center space-x-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-slate-900" : "text-slate-400")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
