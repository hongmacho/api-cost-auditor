'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, ArrowLeft, Save } from 'lucide-react'

interface Settings {
  email: string
  name: string
  currency: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    email: '',
    name: '',
    currency: 'KRW',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('설정을 불러올 수 없습니다')
        const data = await res.json()
        setSettings(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error('설정을 저장할 수 없습니다')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
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
            <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          </div>
          <p className="text-gray-600">계정 설정을 관리하세요</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
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

        {success && (
          <Card className="p-6 bg-green-50 border-green-200 mb-8">
            <div className="flex gap-3">
              <div className="text-green-600 flex-shrink-0 mt-1">✓</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">저장됨</h3>
                <p className="text-gray-700">설정이 성공적으로 저장되었습니다</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <Input
                id="name"
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="사용자 이름"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="example@example.com"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                통화
              </label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="KRW">한국원 (KRW)</option>
                <option value="USD">미국 달러 (USD)</option>
                <option value="EUR">유로 (EUR)</option>
                <option value="JPY">일본 엔 (JPY)</option>
              </select>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                설정 저장
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">정보</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>앱 버전:</strong> 1.0.0</p>
              <p><strong>마지막 업데이트:</strong> 2024년 7월</p>
              <p><strong>제공자:</strong> API 비용 분석 팀</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
