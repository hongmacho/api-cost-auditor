'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, AlertCircle, TrendingDown } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardData {
  totalCost: number
  activeAPIs: number
  teams: number
  monthlyData: Array<{ month: string; cost: number }>
  providerData: Array<{ provider: string; cost: number }>
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Failed to fetch dashboard data')
        const result = await res.json()
        setData(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">API 비용 분석 플랫폼</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-12">
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">오류 발생</h3>
                <p className="text-gray-700">{error}</p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">API 비용 분석 플랫폼</h1>
            <p className="text-gray-600">SaaS 회사의 API 비용을 한눈에 추적하고 최적화하세요</p>
          </div>
          <nav className="flex gap-4 flex-wrap">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">대시보드</Button>
            </Link>
            <Link href="/apis">
              <Button variant="outline">API 목록</Button>
            </Link>
            <Link href="/logs">
              <Button variant="outline">사용 로그</Button>
            </Link>
            <Link href="/teams">
              <Button variant="outline">팀 분석</Button>
            </Link>
            <Link href="/alerts">
              <Button variant="outline">알림 설정</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">설정</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">총 월별 비용</p>
            <p className="text-3xl font-bold text-gray-900">
              {data ? formatCurrency(data.totalCost) : '로딩 중...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">이번 달</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">활성 API</p>
            <p className="text-3xl font-bold text-gray-900">{data?.activeAPIs || 0}개</p>
            <p className="text-xs text-gray-500 mt-2">제공자</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">팀</p>
            <p className="text-3xl font-bold text-gray-900">{data?.teams || 0}개</p>
            <p className="text-xs text-gray-500 mt-2">총 팀</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">월별 비용 추세</h2>
            {data?.monthlyData && data.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="비용" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">제공자별 비용</h2>
            {data?.providerData && data.providerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.providerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="cost" fill="#3b82f6" name="비용" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 border-2 border-dashed">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">API 관리</h2>
                <p className="text-gray-600 mb-4">
                  모든 API의 비용과 사용량을 한 곳에서 관리하세요.
                </p>
                <Link href="/apis">
                  <Button className="bg-blue-600 hover:bg-blue-700">API 관리하기</Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={24} />
              주요 기능
            </h2>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                실시간 비용 추적
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                월별 추세 분석
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                팀별 비용 분배
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                비용 알림 설정
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
}
