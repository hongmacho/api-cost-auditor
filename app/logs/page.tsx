'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, ArrowLeft, Search } from 'lucide-react'

interface UsageLog {
  id: string
  apiName: string
  month: string
  cost: number
  usage: number
}

export default function LogsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs')
        if (!res.ok) throw new Error('로그를 불러올 수 없습니다')
        const data = await res.json()
        setLogs(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchSearch = log.apiName.toLowerCase().includes(search.toLowerCase())
    const matchMonth = !filterMonth || log.month === filterMonth
    return matchSearch && matchMonth
  })

  const months = Array.from(new Set(logs.map((l) => l.month))).sort().reverse()

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                돌아가기
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">사용량 로그</h1>
          </div>
          <p className="text-gray-600">API 사용량과 비용 기록을 확인하세요</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Card className="p-6 bg-red-50 border-red-200 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">오류 발생</h3>
                <p className="text-gray-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="API 이름으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">월</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 월</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">로그가 없습니다</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Card>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      API 이름
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      월
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      사용량
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      비용
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {log.apiName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.month}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">
                        {log.usage.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(log.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          총 {filteredLogs.length}개의 로그
        </div>
      </main>
    </div>
  )
}
