import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

const initialState: CartState = {
  items: [],
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      // Find existing item by both product ID and variant ID
      // This ensures different variants of the same product are treated as separate items
      const existingItem = state.items.find(
        (item) => 
          item.product.id === action.payload.product.id &&
          (item.variantId || 'default') === (action.payload.variantId || 'default')
      )
      if (existingItem) {
        // Same product with same variant - just update quantity
        existingItem.quantity += action.payload.quantity
        // Also ensure price is updated in case it changed
        existingItem.price = action.payload.price
      } else {
        // Different variant or new product - add as new item
        state.items.push(action.payload)
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
      }
    },
    clearCart: (state) => {
      state.items = []
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    openCart: (state) => {
      state.isOpen = true
    },
    closeCart: (state) => {
      state.isOpen = false
    },
  },
})

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setCartItems,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions
export default cartSlice.reducer

