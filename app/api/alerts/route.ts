import { NextResponse } from 'next/server'
import { getAlertsByUserId, createAlert } from '@/lib/repositories'
import { v4 as uuid } from 'uuid'

export async function GET() {
  try {
    const userId = 'demo-user-1'
    const alerts = await getAlertsByUserId(userId)

    return NextResponse.json(alerts, { status: 200 })
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json(
      {
        error: '알림 설정을 불러올 수 없습니다',
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

    const alertId = uuid()
    await createAlert({
      id: alertId,
      userId,
      type: 'threshold',
      threshold: body.threshold,
      channel: body.channel,
      isActive: true,
    })

    return NextResponse.json(
      {
        id: alertId,
        type: 'threshold',
        threshold: body.threshold,
        channel: body.channel,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create Alert API error:', error)
    return NextResponse.json(
      {
        error: '알림 설정을 추가할 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
