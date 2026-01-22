import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '@/components/ui/Toast'
import { useUIStore } from '@/stores/useUIStore'
import { cn } from '@/utils/cn'

export function Layout() {
  const { isSidebarOpen, isSidebarCollapsed, toasts, dismissToast } = useUIStore()

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isSidebarOpen && !isSidebarCollapsed && 'lg:ml-64',
          isSidebarOpen && isSidebarCollapsed && 'lg:ml-20'
        )}
      >
        <Header />

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
