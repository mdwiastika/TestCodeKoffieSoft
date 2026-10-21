import { useState } from "react"
import { CheckSquare, LayoutDashboard, Menu, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet } from "@/components/ui/dialog"
import { Logo } from "@/components/ui/logo"

export type TabType = "dashboard" | "tasks" | "members"

interface NavbarProps {
  currentTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Navbar({ currentTab, onTabChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const tabs = [
    { id: "dashboard" as TabType, path: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
    { id: "tasks" as TabType, path: "/tasks", label: "Tasks", shortLabel: "Tasks", icon: CheckSquare },
    { id: "members" as TabType, path: "/members", label: "Team Members", shortLabel: "Team", icon: Users },
  ]

  const handleSelectTab = (tabId: TabType) => {
    onTabChange(tabId)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault()
            handleSelectTab("dashboard")
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-md"
        >
          <Logo variant="full" size="md" />
        </a>

        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            return (
              <a
                key={tab.id}
                href={tab.path}
                onClick={(e) => {
                  e.preventDefault()
                  handleSelectTab(tab.id)
                }}
                className={cn(
                  "flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-slate-900" : "text-slate-400")} />
                <span>{tab.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            aria-label="Open main menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Sheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navigation"
      >
        <div className="flex flex-col space-y-1.5 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            return (
              <a
                key={tab.id}
                href={tab.path}
                onClick={(e) => {
                  e.preventDefault()
                  handleSelectTab(tab.id)
                }}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer",
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                <span>{tab.label}</span>
              </a>
            )
          })}
        </div>
      </Sheet>
    </header>
  )
}
