import {
  getAPIsByUserId,
  getTotalCostByMonth,
  getAPICostsHistory,
  getTeamsByUserId,
  getTeamAPICost,
  getAlertsByUserId,
} from './repositories'
import { getLastNMonths, calculatePercentageChange } from './utils'

export interface DashboardStats {
  totalCost: number
  monthlyChange: number
  monthlyChangePercent: number
  topAPIs: Array<{
    id: string
    name: string
    cost: number
    provider: string
  }>
  costTrend: Array<{
    month: string
    cost: number
  }>
  teamDistribution: Array<{
    id: string
    name: string
    cost: number
    percent: number
  }>
}

export async function getDashboardStats(
  userId: string,
  currentMonth: string,
  previousMonth: string
): Promise<DashboardStats> {
  try {
    const currentCost = await getTotalCostByMonth(userId, currentMonth)
    const previousCost = await getTotalCostByMonth(userId, previousMonth)
    const monthlyChange = currentCost - previousCost
    const monthlyChangePercent = calculatePercentageChange(currentCost, previousCost)

    const userAPIs = await getAPIsByUserId(userId)
    const lastThreeMonths = getLastNMonths(3)

    // Get top APIs by current month cost
    const apiCosts: { [key: string]: number } = {}
    for (const api of userAPIs) {
      const cost = await getTotalCostByMonth(userId, currentMonth)
      apiCosts[api.id] = cost
    }

    const topAPIs = userAPIs
      .sort((a, b) => {
        const costA = apiCosts[a.id] || 0
        const costB = apiCosts[b.id] || 0
        return costB - costA
      })
      .slice(0, 5)
      .map((api) => ({
        id: api.id,
        name: api.name,
        cost: apiCosts[api.id] || 0,
        provider: api.provider,
      }))

    // Get cost trend
    const costTrend = []
    for (const month of lastThreeMonths) {
      const cost = await getTotalCostByMonth(userId, month)
      costTrend.push({
        month,
        cost,
      })
    }
    costTrend.reverse()

    // Get team distribution
    const teams = await getTeamsByUserId(userId)
    const teamDistribution = []
    let totalTeamCost = 0

    for (const team of teams) {
      const teamCost = await getTeamAPICost(team.id, currentMonth)
      totalTeamCost += teamCost
      teamDistribution.push({
        id: team.id,
        name: team.name,
        cost: teamCost,
        percent: 0,
      })
    }

    // Calculate percentages
    if (totalTeamCost > 0) {
      teamDistribution.forEach((team) => {
        team.percent = (team.cost / totalTeamCost) * 100
      })
    }

    return {
      totalCost: currentCost,
      monthlyChange,
      monthlyChangePercent,
      topAPIs,
      costTrend,
      teamDistribution,
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

export interface APIDetail {
  id: string
  name: string
  provider: string
  monthlyBudget?: number
  status: string
  costs: Array<{
    month: string
    cost: number
    usage?: number
  }>
  predictedNextCost: number
  teamAllocation: Array<{
    teamId: string
    allocatedBudget?: number
  }>
}

export async function getAPIDetailWithPrediction(
  apiId: string
): Promise<APIDetail | null> {
  try {
    const lastThreeMonths = getLastNMonths(3)

    return {
      id: apiId,
      name: '',
      provider: '',
      status: 'active',
      costs: lastThreeMonths.map((month) => ({
        month,
        cost: 0,
        usage: 0,
      })),
      predictedNextCost: 0,
      teamAllocation: [],
    }
  } catch (error) {
    console.error('Error getting API detail:', error)
    throw error
  }
}

export async function detectAnomalies(userId: string, threshold: number) {
  try {
    const currentMonth = new Date()
    const month = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, '0')}`

    const currentCost = await getTotalCostByMonth(userId, month)

    if (currentCost > threshold) {
      return {
        detected: true,
        message: `월간 비용이 예산 ${threshold}을(를) 초과했습니다: ${currentCost}`,
        severity: 'high',
      }
    }

    return {
      detected: false,
      message: '이상이 감지되지 않았습니다.',
      severity: 'low',
    }
  } catch (error) {
    console.error('Error detecting anomalies:', error)
    throw error
  }
}

export async function getUnusedAPIs(userId: string) {
  try {
    const userAPIs = await getAPIsByUserId(userId)
    const currentMonth = new Date()
    const month = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, '0')}`

    const unusedAPIs = []

    for (const api of userAPIs) {
      const cost = await getTotalCostByMonth(userId, month)
      if (cost === 0) {
        unusedAPIs.push(api)
      }
    }

    return unusedAPIs
  } catch (error) {
    console.error('Error getting unused APIs:', error)
    throw error
  }
}
