// 梦幻西游师门技能升级单级消耗表（部分，单位：经验/师门金钱）
// 数据优先使用用户提供的权威“累计表”（见 data/skillCosts.ts），通过差分得到单级消耗；
// 若缺失则退回到此处单级表；仍缺失则用回退公式估算。
import { cumulativeSkillCost } from '../data/skillCosts'
import { assistPerLevel } from '../data/assistSkillCosts'
const SKILL_COST_TABLE: Record<number, { exp: number; money: number }> = {
  // 等级: { 经验, 师门金钱 }
  1: { exp: 16, money: 6 },
  2: { exp: 32, money: 12 },
  3: { exp: 52, money: 19 },
  4: { exp: 75, money: 28 },
  5: { exp: 103, money: 38 },
  6: { exp: 136, money: 51 },
  7: { exp: 179, money: 67 },
  8: { exp: 231, money: 86 },
  9: { exp: 295, money: 110 },
  10: { exp: 372, money: 139 },
  11: { exp: 466, money: 174 },
  12: { exp: 578, money: 216 },
  13: { exp: 711, money: 266 },
  14: { exp: 867, money: 325 },
  15: { exp: 1049, money: 393 },
  16: { exp: 1260, money: 472 },
  17: { exp: 1503, money: 563 },
  18: { exp: 1780, money: 667 },
  19: { exp: 2096, money: 786 },
  20: { exp: 2452, money: 919 },
  21: { exp: 2854, money: 1070 },
  22: { exp: 3304, money: 1238 },
  23: { exp: 3807, money: 1426 },
  24: { exp: 4364, money: 1636 },
  25: { exp: 4983, money: 1868 },
  26: { exp: 5664, money: 2124 },
  27: { exp: 6415, money: 2404 },
  28: { exp: 7238, money: 2714 },
  29: { exp: 8138, money: 3050 },
  30: { exp: 9120, money: 3420 },
  31: { exp: 10188, money: 3820 },
  32: { exp: 11347, money: 4255 },
  33: { exp: 12602, money: 4725 },
  34: { exp: 13959, money: 5234 },
  35: { exp: 15423, money: 5783 },
  36: { exp: 16998, money: 6374 },
  37: { exp: 18692, money: 7009 },
  38: { exp: 20508, money: 7690 },
  39: { exp: 22452, money: 8419 },
  40: { exp: 24532, money: 9199 },
  41: { exp: 26753, money: 10032 },
  42: { exp: 29121, money: 10920 },
  43: { exp: 31642, money: 11865 },
  44: { exp: 34323, money: 12871 },
  45: { exp: 37169, money: 13938 },
  46: { exp: 40188, money: 15070 },
  47: { exp: 43388, money: 16270 },
  48: { exp: 46773, money: 17540 },
  49: { exp: 50352, money: 18882 },
  50: { exp: 54132, money: 20299 },
}

function getSkillCostPerLevel(level: number): { exp: number; money: number } {
  // 本表按“单级消耗”录入（非累计）。优先使用 1-180 明确数据。
  const row = cumulativeSkillCost[level]
  if (row) return row
  // 其次使用本地补全的 1-50 单级表
  if (SKILL_COST_TABLE[level]) return SKILL_COST_TABLE[level]
  // 回退公式（仅用于缺失等级的估算）
  const exp = Math.floor(12 * level + Math.pow(level, 2) * 3.6)
  const money = Math.floor(4 * level + Math.pow(level, 1.7) * 2.4)
  return { exp, money }
}

export type SkillCost = { experience: number; money: number; gang?: number }

class SkillCalculator {
  static calculateMasterCost(currentLevel: number, targetLevel: number): SkillCost {
    if (currentLevel >= targetLevel || currentLevel < 0 || targetLevel > 150) {
      return { experience: 0, money: 0 }
    }

    let totalExp = 0
    let totalMoney = 0

    for (let level = currentLevel + 1; level <= targetLevel; level++) {
      const cost = getSkillCostPerLevel(level)
      totalExp += cost.exp
      totalMoney += cost.money
    }

    return { experience: totalExp, money: totalMoney }
  }

  static calculateAssistCost(currentLevel: number, targetLevel: number): SkillCost {
    if (currentLevel >= targetLevel || currentLevel < 0 || targetLevel > 180) {
      return { experience: 0, money: 0, gang: 0 }
    }

    let exp = 0, money = 0, gang = 0
    for (let level = currentLevel + 1; level <= targetLevel; level++) {
      const row = assistPerLevel[level]
      if (row) {
        exp += row.exp
        money += row.money
        gang += row.gang
      }
    }
    return { experience: exp, money, gang }
  }
}

export default SkillCalculator

