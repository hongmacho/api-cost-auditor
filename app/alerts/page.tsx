'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, Bell, ArrowLeft, Trash2 } from 'lucide-react'

interface Alert {
  id: string
  type: string
  threshold?: number
  channel: string
  isActive: boolean
  createdAt: string
}

export default function AlertsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [newThreshold, setNewThreshold] = useState('')
  const [newChannel, setNewChannel] = useState('in-app')

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts')
        if (!res.ok) throw new Error('알림 설정을 불러올 수 없습니다')
        const data = await res.json()
        setAlerts(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const handleAddAlert = async () => {
    if (!newThreshold) {
      alert('임계값을 입력해주세요')
      return
    }

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threshold: parseFloat(newThreshold),
          channel: newChannel,
        }),
      })

      if (!res.ok) throw new Error('알림 설정을 추가할 수 없습니다')
      const newAlert = await res.json()
      setAlerts([...alerts, newAlert])
      setNewThreshold('')
      setNewChannel('in-app')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('알림 설정을 삭제할 수 없습니다')
      setAlerts(alerts.filter((a) => a.id !== alertId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">알림 설정</h1>
          </div>
          <p className="text-gray-600">API 비용 임계값 알림을 관리하세요</p>
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

        {/* Add Alert Form */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">새 알림 추가</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                임계값 (원)
              </label>
              <Input
                type="number"
                placeholder="예: 3000000"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                채널
              </label>
              <select
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in-app">인앱</option>
                <option value="email">이메일</option>
                <option value="slack">Slack</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddAlert}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                알림 추가
              </Button>
            </div>
          </div>
        </Card>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">설정된 알림이 없습니다</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      비용 임계값 알림
                    </h3>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>임계값:</strong> {alert.threshold ? formatCurrency(alert.threshold) : '-'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>채널:</strong> {alert.channel === 'in-app' ? '인앱' : alert.channel}
                      </p>
                      <p className="text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            alert.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {alert.isActive ? '활성' : '비활성'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
