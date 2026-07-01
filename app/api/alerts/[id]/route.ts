import { NextResponse } from 'next/server'
import { updateAlert } from '@/lib/repositories'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await updateAlert(id, { isActive: false })

    return NextResponse.json(
      { message: '알림 설정이 삭제되었습니다' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete Alert API error:', error)
    return NextResponse.json(
      {
        error: '알림 설정을 삭제할 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
