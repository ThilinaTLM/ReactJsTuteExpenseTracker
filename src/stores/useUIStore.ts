import { create } from 'zustand'
import type { Toast, ModalState } from '@/types'

interface UIState {
  // Sidebar
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Modal
  modal: ModalState
  openModal: (type: ModalState['type'], data?: unknown) => void
  closeModal: () => void

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  clearToasts: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  isSidebarOpen: true,
  isSidebarCollapsed: false,

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open })
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ isSidebarCollapsed: collapsed })
  },

  // Modal
  modal: {
    isOpen: false,
    type: null,
    data: undefined,
  },

  openModal: (type: ModalState['type'], data?: unknown) => {
    set({ modal: { isOpen: true, type, data } })
  },

  closeModal: () => {
    set({ modal: { isOpen: false, type: null, data: undefined } })
  },

  // Toasts
  toasts: [],

  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
  },

  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// Convenience functions for toasts
export const toast = {
  success: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'success', message, duration })
  },
  error: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'error', message, duration })
  },
  warning: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'warning', message, duration })
  },
  info: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: 'info', message, duration })
  },
}
