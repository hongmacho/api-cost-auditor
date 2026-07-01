'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Search, AlertCircle, ArrowLeft } from 'lucide-react'

interface API {
  id: string
  name: string
  provider: string
  monthlyBudget?: number
  status: string
  costs: Array<{ month: string; cost: number; usage?: number }>
}

export default function ApisPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apis, setApis] = useState<API[]>([])
  const [search, setSearch] = useState('')
  const [filterProvider, setFilterProvider] = useState('')

  useEffect(() => {
    const fetchApis = async () => {
      try {
        const res = await fetch('/api/apis')
        if (!res.ok) throw new Error('API 데이터를 불러올 수 없습니다')
        const data = await res.json()
        setApis(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchApis()
  }, [])

  const filteredApis = apis.filter((api) => {
    const matchSearch = api.name.toLowerCase().includes(search.toLowerCase())
    const matchProvider = !filterProvider || api.provider === filterProvider
    return matchSearch && matchProvider
  })

  const providers = Array.from(new Set(apis.map((a) => a.provider)))

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
            <h1 className="text-3xl font-bold text-gray-900">API 관리</h1>
          </div>
          <p className="text-gray-600">모든 API의 비용과 상태를 확인하세요</p>
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
                  placeholder="API 이름 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제공자</label>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 제공자</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* APIs List */}
        {filteredApis.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">API가 없습니다</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApis.map((api) => {
              const currentCost = api.costs[0]?.cost || 0
              const budget = api.monthlyBudget || 0
              const usage = Math.round(((currentCost / budget) * 100) || 0)

              return (
                <Card key={api.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900">{api.name}</h3>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <strong>제공자:</strong> {api.provider}
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            api.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {api.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">월별 비용</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(currentCost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">예산 사용률</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usage, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm mt-1 font-semibold">{usage}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
