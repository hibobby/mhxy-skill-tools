import { cultivationPerLevel, CultivationMode } from '../data/cultivationCosts'

function getCultivationCost(level: number, mode: CultivationMode): { exp: number, money: number } {
  if (level <= 0) return { exp: 0, money: 0 }
  const row = cultivationPerLevel[mode][level]
  if (row) return { exp: row.exp, money: row.money * 10000 }
  // 超出范围时返回 0，避免误差
  return { exp: 0, money: 0 }
}

class CultivationCalculator {
  static calculateCost(currentLevel: number, targetLevel: number, mode: CultivationMode = '2w', currentExp: number = 0): { experience: number, money: number } {
    if (currentLevel >= targetLevel || currentLevel < 0 || targetLevel > 25) {
      return { experience: 0, money: 0 }
    }

    let totalExp = 0
    let totalMoney = 0

    const unit = mode === '2w' ? 20000 : 30000

    for (let level = currentLevel + 1; level <= targetLevel; level++) {
      const per = getCultivationCost(level, mode)
      if (level === currentLevel + 1) {
        // 当前等级需要扣除已积累经验（10点一跳收费）
        const remain = Math.max(0, per.exp - (currentExp || 0))
        const steps = Math.ceil(remain / 10)
        totalExp += remain
        totalMoney += steps * unit
      } else {
        // 后续等级按整级计算
        const steps = Math.ceil(per.exp / 10)
        totalExp += per.exp
        totalMoney += steps * unit
      }
    }

    return { experience: totalExp, money: totalMoney }
  }
}

export default CultivationCalculator

