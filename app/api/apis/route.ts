import { NextResponse } from 'next/server'
import { getAPIsByUserId } from '@/lib/repositories'

export async function GET() {
  try {
    const userId = 'demo-user-1'
    const apis = await getAPIsByUserId(userId)

    return NextResponse.json(apis, { status: 200 })
  } catch (error) {
    console.error('APIs API error:', error)
    return NextResponse.json(
      {
        error: 'API 데이터를 불러올 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
