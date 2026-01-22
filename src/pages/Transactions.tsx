import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useFilterStore } from '@/stores/useFilterStore'
import type { Transaction } from '@/types'
import type { CreateTransactionForm } from '@/schemas/transaction'

export function Transactions() {
  const { filters } = useFilterStore()
  const { data: transactionsData, isLoading } = useTransactions(filters)
  const { data: categories } = useCategories()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  const transactions = transactionsData?.data || []

  const handleCreate = async (data: CreateTransactionForm) => {
    await createMutation.mutateAsync({
      ...data,
      date: new Date(data.date).toISOString(),
    })
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: CreateTransactionForm) => {
    if (!editingTransaction) return

    await updateMutation.mutateAsync({
      id: editingTransaction.id,
      ...data,
      date: new Date(data.date).toISOString(),
    })
    setEditingTransaction(null)
  }

  const handleDelete = async () => {
    if (!deletingTransaction) return

    await deleteMutation.mutateAsync(deletingTransaction.id)
    setDeletingTransaction(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your income and expenses
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilters compact />

      {/* Transactions List */}
      <Card padding="none">
        <CardHeader className="p-4 pb-0">
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <TransactionList
            transactions={transactions}
            categories={categories || []}
            isLoading={isLoading}
            onEdit={setEditingTransaction}
            onDelete={setDeletingTransaction}
          />
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Transaction"
        description="Create a new income or expense transaction"
      >
        <TransactionForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
        description="Update transaction details"
      >
        {editingTransaction && (
          <TransactionForm
            initialData={editingTransaction}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        size="sm"
      >
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeletingTransaction(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
