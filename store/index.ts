import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { baseApi } from './api/baseApi'
// Import all APIs to ensure their endpoints are registered
import './api/authApi'
import './api/usersApi'
import './api/productsApi'
import './api/categoriesApi'
import './api/cartApi'
import './api/ordersApi'
import './api/reviewsApi'
import './api/couponsApi'
import './api/paymentsApi'
import './api/adminApi'
import './api/analyticsApi'
import './api/bannersApi'
import './api/contactApi'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import uiReducer from './slices/uiSlice'

// Configure persistence for cart - only persist items, not isOpen state
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'], // Only persist cart items, not isOpen
}

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer)

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: persistedCartReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware),
})

setupListeners(store.dispatch)

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

