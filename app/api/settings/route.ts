import { NextResponse } from 'next/server'
import { getUserById } from '@/lib/repositories'

export async function GET() {
  try {
    const userId = 'demo-user-1'
    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        email: user.email,
        name: user.name,
        currency: user.currency,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      {
        error: '설정을 불러올 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = 'demo-user-1'
    const body = await request.json()

    return NextResponse.json(
      {
        email: body.email,
        name: body.name,
        currency: body.currency,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Save Settings API error:', error)
    return NextResponse.json(
      {
        error: '설정을 저장할 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
