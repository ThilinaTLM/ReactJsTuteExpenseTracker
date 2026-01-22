import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold text-slate-200 dark:text-slate-800">404</h1>

        {/* Message */}
        <div className="-mt-8 relative">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page not found</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => window.history.back()} variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Go back
          </Button>
          <Link to="/">
            <Button leftIcon={<Home className="h-4 w-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
