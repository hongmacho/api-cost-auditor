'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ApisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">API 목록</h1>
            <Link href="/">
              <Button variant="outline">돌아가기</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">API 목록</h2>
          <p className="text-gray-600 mb-6">API 목록을 관리하는 페이지입니다.</p>
          <p className="text-sm text-gray-500">구현 중...</p>
        </Card>
      </main>
    </div>
  )
}
