import { create } from 'zustand'

export type ViewType = 'catalog' | 'cart' | 'checkout' | 'admin' | 'admin-products' | 'admin-orders' | 'order-success'

interface ViewState {
  currentView: ViewType
  selectedOrderId: string | null
  navigate: (view: ViewType, orderId?: string) => void
}

export const useViewStore = create<ViewState>()((set) => ({
  currentView: 'catalog',
  selectedOrderId: null,
  navigate: (view, orderId) =>
    set({ currentView: view, selectedOrderId: orderId ?? null }),
}))
