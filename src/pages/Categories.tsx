import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useCategories } from '@/hooks/useCategories'

export function Categories() {
  const { data: categories, isLoading } = useCategories()

  const expenseCategories = categories?.filter((c) => c.type === 'expense') || []
  const incomeCategories = categories?.filter((c) => c.type === 'income') || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize your transactions by category
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <div className="space-y-4">
                <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize your transactions by category
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-danger-500" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    <CategoryIcon name={category.icon} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{category.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {category.type}
                    </p>
                  </div>
                  <div
                    className="ml-auto h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success-500" />
              Income Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    <CategoryIcon name={category.icon} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{category.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {category.type}
                    </p>
                  </div>
                  <div
                    className="ml-auto h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Simple icon component - in a real app, you'd map to actual Lucide icons
function CategoryIcon({ name }: { name: string }) {
  return (
    <span className="text-lg">
      {getIconEmoji(name)}
    </span>
  )
}

function getIconEmoji(name: string): string {
  const iconMap: Record<string, string> = {
    utensils: '🍽️',
    car: '🚗',
    film: '🎬',
    'shopping-bag': '🛍️',
    'file-text': '📄',
    'heart-pulse': '❤️',
    'graduation-cap': '🎓',
    'more-horizontal': '•••',
    briefcase: '💼',
    laptop: '💻',
    'trending-up': '📈',
    'plus-circle': '➕',
  }
  return iconMap[name] || '📁'
}
