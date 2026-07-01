import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/services'
import { getCurrentMonth, getLastNMonths } from '@/lib/utils'

export async function GET() {
  try {
    const currentMonth = getCurrentMonth()
    const lastNMonths = getLastNMonths(2)
    const previousMonth = lastNMonths[1]

    // For demo, use a hardcoded user ID
    const userId = 'demo-user-1'

    const stats = await getDashboardStats(userId, currentMonth, previousMonth)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      {
        error: '대시보드 데이터를 불러올 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
