'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  useGetDashboardStatsQuery, 
  useGetDashboardRevenueQuery,
  useGetRecentOrdersQuery,
  useGetTopProductsQuery
} from '@/store/api/adminApi'
import { formatPrice, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Package,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Link from 'next/link'
import Image from 'next/image'
import { Order } from '@/types'

type Period = '7d' | '30d' | '90d' | '1y' | 'all'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
]

const CHART_COLORS = {
  revenue: '#F59E0B',
  orders: '#0F172A',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
}

const PIE_COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('30d')

  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery({ period })
  const { data: revenueData, isLoading: revenueLoading } = useGetDashboardRevenueQuery({ period })
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrdersQuery({ limit: 5 })
  const { data: topProducts, isLoading: productsLoading } = useGetTopProductsQuery({ limit: 5, period })

  // Format chart data with proper dates
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const chartData = revenueData?.map((item: any) => ({
    ...item,
    date: item.formattedDate || formatShortDate(item.date),
    revenue: item.revenue || 0,
    orders: item.orders || 0,
  })) || []

  // Order status breakdown for pie chart
  const orderStatusData = stats ? [
    { name: 'Delivered', value: stats.deliveredOrders || 0, color: CHART_COLORS.success },
    { name: 'Shipped', value: stats.shippedOrders || 0, color: CHART_COLORS.info },
    { name: 'Processing', value: stats.processingOrders || 0, color: CHART_COLORS.warning },
    { name: 'Pending', value: stats.pendingOrders || 0, color: '#94A3B8' },
    { name: 'Cancelled', value: stats.cancelledOrders || 0, color: CHART_COLORS.danger },
  ].filter(item => item.value > 0) : []

  // Calculate percentage change display
  const formatChange = (change: number | undefined) => {
    if (change === undefined || change === null) return { text: 'N/A', isPositive: null }
    const isPositive = change >= 0
    const sign = isPositive ? '+' : ''
    return {
      text: `${sign}${change.toFixed(1)}%`,
      isPositive,
    }
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      change: formatChange(stats?.revenueChange),
      description: 'from previous period',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingBag,
      change: formatChange(stats?.ordersChange),
      description: 'from previous period',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      icon: Users,
      change: formatChange(stats?.usersChange),
      description: 'from previous period',
    },
    {
      title: 'Average Order Value',
      value: formatPrice(stats?.averageOrderValue || 0),
      icon: TrendingUp,
      change: formatChange(stats?.growthRate),
      description: 'growth rate',
    },
  ]

  const alertCards = [
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      href: '/admin/orders?status=pending',
    },
    {
      title: 'Low Stock Products',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      href: '/admin/products?lowStock=true',
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/admin/reviews?status=pending',
    },
    {
      title: 'Failed Payments',
      value: stats?.failedPayments || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      href: '/admin/orders?paymentStatus=failed',
    },
  ]

  const statusCards = [
    {
      title: 'Processing',
      value: stats?.processingOrders || 0,
      icon: Package,
      color: CHART_COLORS.warning,
    },
    {
      title: 'Shipped',
      value: stats?.shippedOrders || 0,
      icon: Truck,
      color: CHART_COLORS.info,
    },
    {
      title: 'Delivered',
      value: stats?.deliveredOrders || 0,
      icon: CheckCircle2,
      color: CHART_COLORS.success,
    },
    {
      title: 'Paid',
      value: stats?.paidOrders || 0,
      icon: DollarSign,
      color: CHART_COLORS.success,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">Welcome to the admin dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Period:</span>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const change = stat.change
          return (
            <Card key={index} className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <Icon className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {change.isPositive !== null ? (
                        <>
                          {change.isPositive ? (
                            <ArrowUpRight className="h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                          )}
                          <p className={`text-xs font-medium ${
                            change.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {change.text}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500">{change.text}</p>
                      )}
                      <span className="text-xs text-slate-500"> {stat.description}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alert Cards */}
      {(stats?.pendingOrders > 0 || stats?.lowStockProducts > 0 || stats?.pendingReviews > 0 || stats?.failedPayments > 0) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {alertCards.map((alert, index) => {
            if (alert.value === 0) return null
            const Icon = alert.icon
            return (
              <Link key={index} href={alert.href}>
                <Card className={`bg-white border-2 ${alert.borderColor} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{alert.title}</p>
                        <p className={`text-2xl font-bold ${alert.color} mt-1`}>{alert.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${alert.bgColor}`}>
                        <Icon className={`h-6 w-6 ${alert.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-slate-400">No revenue data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatPrice(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={CHART_COLORS.revenue} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.revenue, r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-slate-400">No orders data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="orders" 
                    fill={CHART_COLORS.orders} 
                    radius={[8, 8, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      {orderStatusData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Summary Cards */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Order Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {statusCards.map((status, index) => {
                  const Icon = status.icon
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${status.color}20` }}>
                        <Icon className="h-5 w-5" style={{ color: status.color }} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">{status.title}</p>
                        <p className="text-xl font-bold text-slate-900">{status.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Orders & Top Products */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-slate-900">Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order: Order) => (
                  <Link 
                    key={order.id} 
                    href={`/admin/orders?orderId=${order.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">#{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatPrice(order.total)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-slate-400">No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product: any, index: number) => (
                  <div key={product.id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {index + 1}
                    </div>
                    {product.product?.images?.[0] && (
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                        <Image
                          src={product.product.images[0]}
                          alt={product.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {product.product?.name || product.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.quantitySold || product.sold || 0} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatPrice(product.totalRevenue || product.revenue || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-slate-400">No product data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
