import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TransactionFilters } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'

interface FilterState {
  filters: TransactionFilters
  setFilters: (filters: Partial<TransactionFilters>) => void
  resetFilters: () => void
  setSearch: (search: string) => void
  setType: (type: TransactionFilters['type']) => void
  setCategory: (categoryId: string | undefined) => void
  setDateRange: (startDate: string | undefined, endDate: string | undefined) => void
}

const initialFilters: TransactionFilters = {
  type: undefined,
  categoryId: undefined,
  startDate: undefined,
  endDate: undefined,
  search: '',
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: initialFilters,

      setFilters: (newFilters: Partial<TransactionFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }))
      },

      resetFilters: () => {
        set({ filters: initialFilters })
      },

      setSearch: (search: string) => {
        set((state) => ({
          filters: { ...state.filters, search },
        }))
      },

      setType: (type: TransactionFilters['type']) => {
        set((state) => ({
          filters: { ...state.filters, type },
        }))
      },

      setCategory: (categoryId: string | undefined) => {
        set((state) => ({
          filters: { ...state.filters, categoryId },
        }))
      },

      setDateRange: (startDate: string | undefined, endDate: string | undefined) => {
        set((state) => ({
          filters: { ...state.filters, startDate, endDate },
        }))
      },
    }),
    {
      name: STORAGE_KEYS.FILTERS,
    }
  )
)
