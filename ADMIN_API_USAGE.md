# Admin API Usage Guide

This guide shows how to use the Admin APIs in your React components.

## Table of Contents

1. [Dashboard APIs](#dashboard-apis)
2. [Users Management](#users-management)
3. [Products Management](#products-management)
4. [Orders Management](#orders-management)
5. [Coupons Management](#coupons-management)
6. [Banners Management](#banners-management)
7. [Categories Management](#categories-management)
8. [Reviews Management](#reviews-management)
9. [Inventory Management](#inventory-management)
10. [Reports & Exports](#reports--exports)
11. [Analytics](#analytics)

---

## Dashboard APIs

### Get Dashboard Stats

```typescript
import { useGetDashboardStatsQuery } from '@/store/api/adminApi'

function DashboardPage() {
  const { data, isLoading, error } = useGetDashboardStatsQuery()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading dashboard</div>
  
  return (
    <div>
      <p>Total Revenue: {data?.totalRevenue}</p>
      <p>Total Orders: {data?.totalOrders}</p>
      <p>Total Users: {data?.totalUsers}</p>
    </div>
  )
}
```

### Get Dashboard Revenue

```typescript
import { useGetDashboardRevenueQuery } from '@/store/api/adminApi'

function RevenueChart() {
  const { data, isLoading } = useGetDashboardRevenueQuery({ period: '30d' })
  
  // Use data.data for chart data
  const chartData = data?.data || []
  
  return <Chart data={chartData} />
}
```

---

## Users Management

### Get All Users

```typescript
import { useGetUsersQuery } from '@/store/api/adminApi'

function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  const { data, isLoading } = useGetUsersQuery({ 
    page, 
    limit: 10,
    search: search || undefined 
  })
  
  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search users..."
      />
      {data?.data.map(user => (
        <div key={user.id}>{user.name} - {user.email}</div>
      ))}
    </div>
  )
}
```

### Get User by ID

```typescript
import { useGetUserByIdQuery } from '@/store/api/adminApi'

function UserDetailPage({ userId }: { userId: string }) {
  const { data, isLoading } = useGetUserByIdQuery(userId)
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>{data?.name} - {data?.email}</div>
}
```

### Update User Status

```typescript
import { useUpdateUserStatusMutation } from '@/store/api/adminApi'
import { useToast } from '@/hooks/use-toast'

function UserStatusToggle({ userId, isActive }: { userId: string, isActive: boolean }) {
  const [updateStatus] = useUpdateUserStatusMutation()
  const { toast } = useToast()
  
  const handleToggle = async () => {
    try {
      await updateStatus({ 
        userId, 
        data: { isActive: !isActive } 
      }).unwrap()
      toast({ title: 'User status updated' })
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }
  
  return <button onClick={handleToggle}>Toggle Status</button>
}
```

### Update User Information

```typescript
import { useUpdateUserMutation } from '@/store/api/adminApi'

function EditUserForm({ userId }: { userId: string }) {
  const [updateUser] = useUpdateUserMutation()
  
  const handleSubmit = async (formData: any) => {
    await updateUser({ 
      userId, 
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      }
    }).unwrap()
  }
  
  // Form implementation...
}
```

### Update User Role

```typescript
import { useUpdateUserRoleMutation } from '@/store/api/adminApi'

function RoleSelector({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [updateRole] = useUpdateUserRoleMutation()
  
  const handleRoleChange = async (newRole: 'admin' | 'user') => {
    await updateRole({ 
      userId, 
      data: { role: newRole } 
    }).unwrap()
  }
  
  return (
    <select onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'user')}>
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  )
}
```

### Delete User

```typescript
import { useDeleteUserMutation } from '@/store/api/adminApi'

function DeleteUserButton({ userId }: { userId: string }) {
  const [deleteUser] = useDeleteUserMutation()
  
  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteUser(userId).unwrap()
    }
  }
  
  return <button onClick={handleDelete}>Delete User</button>
}
```

---

## Products Management

Products APIs are in `productsApi.ts`. See existing implementation in:
- `app/admin/products/page.tsx` - List products
- `app/admin/products/new/page.tsx` - Create product
- `app/admin/products/[id]/edit/page.tsx` - Update product

---

## Orders Management

Orders APIs are in `ordersApi.ts`. See existing implementation in:
- `app/admin/orders/page.tsx` - List and update orders

---

## Coupons Management

Coupons APIs are in `couponsApi.ts`. See existing implementation in:
- `app/admin/coupons/page.tsx` - List coupons

---

## Banners Management

### Get All Banners

```typescript
import { useGetBannersQuery } from '@/store/api/adminApi'

function BannersPage() {
  const { data, isLoading } = useGetBannersQuery()
  
  return (
    <div>
      {data?.map(banner => (
        <div key={banner.id}>{banner.title}</div>
      ))}
    </div>
  )
}
```

### Create Banner

```typescript
import { useCreateBannerMutation } from '@/store/api/adminApi'

function CreateBannerForm() {
  const [createBanner] = useCreateBannerMutation()
  
  const handleSubmit = async (formData: any) => {
    await createBanner({
      title: formData.title,
      image: formData.image,
      position: formData.position,
      active: formData.active,
      link: formData.link,
    }).unwrap()
  }
  
  // Form implementation...
}
```

---

## Categories Management

Categories APIs are in `categoriesApi.ts`. They're already used in product forms.

---

## Reviews Management

### Get Admin Reviews

```typescript
import { useGetAdminReviewsQuery } from '@/store/api/adminApi'

function ReviewsPage() {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>()
  
  const { data, isLoading } = useGetAdminReviewsQuery({
    page: 1,
    limit: 10,
    status,
  })
  
  return (
    <div>
      {data?.data.map(review => (
        <div key={review.id}>
          <p>{review.comment}</p>
          <p>Rating: {review.rating}</p>
        </div>
      ))}
    </div>
  )
}
```

### Update Review Status

```typescript
import { useUpdateReviewStatusMutation } from '@/store/api/adminApi'

function ReviewActions({ reviewId }: { reviewId: string }) {
  const [updateStatus] = useUpdateReviewStatusMutation()
  
  const handleApprove = async () => {
    await updateStatus({ 
      reviewId, 
      data: { status: 'approved' } 
    }).unwrap()
  }
  
  const handleReject = async () => {
    await updateStatus({ 
      reviewId, 
      data: { status: 'rejected' } 
    }).unwrap()
  }
  
  return (
    <div>
      <button onClick={handleApprove}>Approve</button>
      <button onClick={handleReject}>Reject</button>
    </div>
  )
}
```

---

## Inventory Management

### Get Inventory

```typescript
import { useGetInventoryQuery } from '@/store/api/adminApi'

function InventoryPage() {
  const [lowStockOnly, setLowStockOnly] = useState(false)
  
  const { data, isLoading } = useGetInventoryQuery({
    page: 1,
    limit: 20,
    lowStock: lowStockOnly || undefined,
  })
  
  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
        />
        Low Stock Only
      </label>
      {data?.data.map(product => (
        <div key={product.id}>
          {product.name} - Stock: {product.stock}
        </div>
      ))}
    </div>
  )
}
```

### Get Low Stock Products

```typescript
import { useGetLowStockProductsQuery } from '@/store/api/adminApi'

function LowStockAlert() {
  const { data, isLoading } = useGetLowStockProductsQuery({ limit: 10 })
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h3>Low Stock Alert</h3>
      {data?.map(product => (
        <div key={product.id}>
          {product.name} - Only {product.stock} left!
        </div>
      ))}
    </div>
  )
}
```

### Update Product Stock

```typescript
import { useUpdateProductStockMutation } from '@/store/api/adminApi'

function StockUpdater({ productId }: { productId: string }) {
  const [updateStock] = useUpdateProductStockMutation()
  
  const handleUpdate = async (newStock: number) => {
    await updateStock({ 
      productId, 
      data: { stock: newStock } 
    }).unwrap()
  }
  
  return (
    <input 
      type="number" 
      onChange={(e) => handleUpdate(parseInt(e.target.value))}
    />
  )
}
```

---

## Reports & Exports

### Get Sales Report

```typescript
import { useGetSalesReportQuery } from '@/store/api/adminApi'

function SalesReport() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const { data, isLoading } = useGetSalesReportQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })
  
  return (
    <div>
      {/* Date pickers */}
      {/* Display report data */}
    </div>
  )
}
```

### Export Orders

```typescript
import { useExportOrdersQuery } from '@/store/api/adminApi'
import { downloadBlob, getExportFilename } from '@/lib/admin-utils'

function ExportOrdersButton() {
  const [exportParams, setExportParams] = useState<{
    startDate?: string
    endDate?: string
    status?: string
    format?: 'csv' | 'excel'
  } | null>(null)
  
  const { data: blob, isLoading } = useExportOrdersQuery(exportParams!, {
    skip: !exportParams,
  })
  
  useEffect(() => {
    if (blob && exportParams) {
      const filename = getExportFilename('orders', exportParams.format)
      downloadBlob(blob, filename)
      setExportParams(null) // Reset after download
    }
  }, [blob, exportParams])
  
  const handleExport = (format: 'csv' | 'excel') => {
    setExportParams({
      format,
      // Add other filters as needed
    })
  }
  
  return (
    <div>
      <button onClick={() => handleExport('csv')}>Export as CSV</button>
      <button onClick={() => handleExport('excel')}>Export as Excel</button>
    </div>
  )
}
```

### Export Products

```typescript
import { useExportProductsQuery } from '@/store/api/adminApi'
import { downloadBlob, getExportFilename } from '@/lib/admin-utils'

function ExportProductsButton() {
  const [exportParams, setExportParams] = useState<{
    format?: 'csv' | 'excel'
    categoryId?: string
  } | null>(null)
  
  const { data: blob } = useExportProductsQuery(exportParams!, {
    skip: !exportParams,
  })
  
  useEffect(() => {
    if (blob && exportParams) {
      const filename = getExportFilename('products', exportParams.format)
      downloadBlob(blob, filename)
      setExportParams(null)
    }
  }, [blob, exportParams])
  
  return (
    <button onClick={() => setExportParams({ format: 'csv' })}>
      Export Products
    </button>
  )
}
```

---

## Analytics

Analytics APIs are in `analyticsApi.ts`. They can be used for advanced analytics beyond the dashboard.

---

## Error Handling

All mutations should include error handling:

```typescript
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const [mutation] = useSomeMutation()
  const { toast } = useToast()
  
  const handleAction = async () => {
    try {
      await mutation(data).unwrap()
      toast({
        title: 'Success',
        description: 'Operation completed successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      })
    }
  }
}
```

---

## Loading States

Always handle loading states:

```typescript
const { data, isLoading, error } = useSomeQuery()

if (isLoading) return <Skeleton />
if (error) return <ErrorComponent />
if (!data) return <EmptyState />

// Render data
```

---

## Pagination

For paginated queries:

```typescript
const [page, setPage] = useState(1)
const { data } = useSomeQuery({ page, limit: 10 })

// Use data.meta for pagination info
const { total, totalPages, page: currentPage } = data?.meta || {}
```

