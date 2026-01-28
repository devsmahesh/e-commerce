'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetDashboardStatsQuery, useGetDashboardRevenueQuery } from '@/store/api/adminApi'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react'
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
} from 'recharts'

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery()
  const { data: revenue, isLoading: revenueLoading } = useGetDashboardRevenueQuery({ period: '30d' })

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      change: '+12.5%',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      change: '+8.2%',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: '+15.3%',
    },
    {
      title: 'Growth Rate',
      value: `${stats?.growthRate || 0}%`,
      icon: TrendingUp,
      change: stats?.growthRate && stats.growthRate > 0 ? `+${stats.growthRate}%` : `${stats?.growthRate || 0}%`,
    },
  ]

  // Mock data for charts if no data is available
  const chartData = revenue?.data || [
    { date: 'Day 1', revenue: 0, orders: 0 },
    { date: 'Day 2', revenue: 0, orders: 0 },
    { date: 'Day 3', revenue: 0, orders: 0 },
    { date: 'Day 4', revenue: 0, orders: 0 },
    { date: 'Day 5', revenue: 0, orders: 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
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
                    <p className="text-xs text-slate-500 mt-1">{stat.change} from last month</p>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
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
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
                    fill="#0F172A" 
                    radius={[8, 8, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

