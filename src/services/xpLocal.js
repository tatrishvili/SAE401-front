const CHALLENGE_XP_BY_STEP_KEY = 'challengeXpByStep'
const TREASURE_XP_BY_STEP_KEY = 'treasureXpByStep'

const toStepId = (stepId) => {
  const id = Number(stepId)
  return Number.isFinite(id) && id > 0 ? String(id) : null
}

const readMap = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const writeMap = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const sumPositiveNumbers = (map) =>
  Object.values(map).reduce((total, value) => {
    const num = Number(value)
    return Number.isFinite(num) && num > 0 ? total + num : total
  }, 0)

export const setChallengeXpForStep = (stepId, xp) => {
  const key = toStepId(stepId)
  if (!key) {
    return
  }

  const amount = Number.isFinite(Number(xp)) ? Math.max(0, Number(xp)) : 0
  const map = readMap(CHALLENGE_XP_BY_STEP_KEY)
  map[key] = amount
  writeMap(CHALLENGE_XP_BY_STEP_KEY, map)
}

export const getTreasureXpForStep = (stepId) => {
  const key = toStepId(stepId)
  if (!key) {
    return 0
  }

  const map = readMap(TREASURE_XP_BY_STEP_KEY)
  const amount = Number(map[key])
  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

export const claimTreasureXpForStep = (stepId, xp = 50) => {
  const key = toStepId(stepId)
  if (!key) {
    return 0
  }

  const map = readMap(TREASURE_XP_BY_STEP_KEY)
  const existing = Number(map[key])

  if (Number.isFinite(existing) && existing > 0) {
    return existing
  }

  const amount = Number.isFinite(Number(xp)) ? Math.max(0, Number(xp)) : 50
  map[key] = amount
  writeMap(TREASURE_XP_BY_STEP_KEY, map)
  return amount
}

export const getTotalLocalXp = () => {
  const challengeXp = sumPositiveNumbers(readMap(CHALLENGE_XP_BY_STEP_KEY))
  const treasureXp = sumPositiveNumbers(readMap(TREASURE_XP_BY_STEP_KEY))
  return challengeXp + treasureXp
}

export const mergeXpWithLocal = (serverXp) => {
  const safeServerXp = Number.isFinite(Number(serverXp)) ? Math.max(0, Number(serverXp)) : 0
  const localXp = getTotalLocalXp()
  return Math.max(safeServerXp, localXp)
}
