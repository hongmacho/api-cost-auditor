import { NextResponse } from 'next/server'
import { getTeamsByUserId, getTeamAPICost } from '@/lib/repositories'
import { getCurrentMonth } from '@/lib/utils'

export async function GET() {
  try {
    const userId = 'demo-user-1'
    const currentMonth = getCurrentMonth()
    const teams = await getTeamsByUserId(userId)

    const teamsData = await Promise.all(
      teams.map(async (team) => ({
        id: team.id,
        name: team.name,
        apis: team.teamAPIs.map((ta) => ({
          id: ta.id,
          apiName: ta.api.name,
          allocatedBudget: ta.allocatedBudget,
        })),
        totalCost: await getTeamAPICost(team.id, currentMonth),
      }))
    )

    return NextResponse.json(teamsData, { status: 200 })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json(
      {
        error: '팀 데이터를 불러올 수 없습니다',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
