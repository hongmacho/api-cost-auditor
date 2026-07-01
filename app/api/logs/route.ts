import { NextResponse } from 'next/server'
import { getAPIsByUserId } from '@/lib/repositories'

export async function GET() {
  try {
    const userId = 'demo-user-1'
    const apis = await getAPIsByUserId(userId)

    const logs = apis.flatMap((api) =>
      api.costs.map((cost) => ({
        id: `${api.id}-${cost.month}`,
        apiName: api.name,
        month: cost.month,
        cost: cost.cost,
        usage: cost.usage || 0,
      }))
    )

    return NextResponse.json(logs, { status: 200 })
  } catch (error) {
    console.error('Logs API error:', error)
    return NextResponse.json(
      {
        error: '로그를 불러올 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
