'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, ArrowLeft } from 'lucide-react'

interface TeamAPI {
  id: string
  apiName: string
  allocatedBudget?: number
  cost: number
}

interface Team {
  id: string
  name: string
  apis: TeamAPI[]
  totalCost: number
}

export default function TeamsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams')
        if (!res.ok) throw new Error('팀 데이터를 불러올 수 없습니다')
        const data = await res.json()
        setTeams(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
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
            <h1 className="text-3xl font-bold text-gray-900">팀 분석</h1>
          </div>
          <p className="text-gray-600">각 팀의 API 사용 현황을 확인하세요</p>
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

        {teams.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">팀이 없습니다</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {teams.map((team) => (
              <Card key={team.id} className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
                  <p className="text-lg text-gray-600 mt-2">
                    총 비용: <span className="font-bold text-blue-600">{formatCurrency(team.totalCost)}</span>
                  </p>
                </div>

                {team.apis.length === 0 ? (
                  <p className="text-gray-500">할당된 API가 없습니다</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                            API 이름
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                            할당 예산
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                            실제 비용
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                            사용률
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {team.apis.map((api) => {
                          const usage = api.allocatedBudget
                            ? Math.round((api.cost / api.allocatedBudget) * 100)
                            : 0

                          return (
                            <tr key={api.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {api.apiName}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-gray-600">
                                {api.allocatedBudget ? formatCurrency(api.allocatedBudget) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                {formatCurrency(api.cost)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    usage > 80
                                      ? 'bg-red-100 text-red-800'
                                      : usage > 50
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {usage}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
