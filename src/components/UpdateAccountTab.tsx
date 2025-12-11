import { useEffect, useMemo, useState } from 'react'
import { School } from '../data/schools'
import { getMasterSkills, getAssistSkills, updateMasterSkill, updateAssistSkill, Skill } from '../services/skillService'
import { getCultivations as getCultivationsService, updateCultivation as updateCultivationService, Cultivation } from '../services/cultivationService'
import SkillCalculator from '../utils/skillCalculator'
import CultivationCalculator from '../utils/cultivationCalculator'
import { cultivationPerLevel } from '../data/cultivationCosts'
import Button from './ui/button'
import { addSpendLog } from '../services/spendService'
import { addChangeLog } from '../services/changeLogService'
import { showToast } from './ui/toast'

interface Props { accountId: number; school: School | null; onUpdated: () => void }

export default function UpdateAccountTab({ accountId, school: _school, onUpdated }: Props) {
  const [master, setMaster] = useState<Skill[]>([])
  const [assist, setAssist] = useState<Skill[]>([])
  const [cultivations, setCultivations] = useState<Cultivation[]>([])
  const [mNew, setMNew] = useState<Record<number, string>>({})
  const [aNew, setANew] = useState<Record<number, string>>({})
  const [cNewLvl, setCNewLvl] = useState<Record<number, string>>({})
  const [cNewExp, setCNewExp] = useState<Record<number, string>>({})

  useEffect(() => {
    const load = async () => {
      const [ms, as, cs] = await Promise.all([
        getMasterSkills(accountId),
        getAssistSkills(accountId),
        getCultivationsService(accountId),
      ])
      setMaster(ms)
      setAssist(as)
      setCultivations(cs as Cultivation[])
    }
    load()
  }, [accountId])

  const totalMoney = useMemo(() => {
    let sum = 0
    master.forEach(s => {
      const nv = parseInt(mNew[s.id] || '')
      if (!isNaN(nv) && nv > s.current_level) {
        sum += SkillCalculator.calculateMasterCost(s.current_level, nv).money
      }
    })
    assist.forEach(s => {
      const nv = parseInt(aNew[s.id] || '')
      if (!isNaN(nv) && nv > s.current_level) {
        sum += SkillCalculator.calculateAssistCost(s.current_level, nv).money
      }
    })
    cultivations.forEach(c => {
      const nl = parseInt(cNewLvl[c.id] || '')
      const neRaw = cNewExp[c.id]
      const ne = neRaw !== undefined && neRaw !== '' ? parseInt(neRaw) : NaN
      const unit = c.mode === '2w' ? 20000 : 30000
      if (!isNaN(nl) && nl > c.current_level) {
        // 跨等级升级：如果新经验为空，默认为0
        const newExpForCalc = !isNaN(ne) ? ne : 0
        if (nl > c.current_level + 1) {
          // 跨等级升级：先计算到新等级-1的满经验
          const costToPrevLevel = CultivationCalculator.calculateCost(c.current_level, nl - 1, c.mode, c.current_exp)
          // 获取 nl-1 级的满经验值
          const prevLevelMaxExp = cultivationPerLevel[c.mode][nl - 1]?.exp || 0
          // 从 nl-1 级满经验升到 nl 级，nl 级经验为 newExpForCalc
          // 计算从 nl-1 级满经验到 nl 级满经验的消耗
          const costToNlMax = CultivationCalculator.calculateCost(nl - 1, nl, c.mode, prevLevelMaxExp)
          // 如果新经验小于 nl 级满经验，需要减去从 newExpForCalc 到满经验的部分
          const nlLevelMaxExp = cultivationPerLevel[c.mode][nl]?.exp || 0
          if (newExpForCalc < nlLevelMaxExp) {
            // 计算从 nl 级 newExpForCalc 到 nl 级满经验的消耗（手动计算）
            const excessExp = nlLevelMaxExp - newExpForCalc
            const excessSteps = Math.ceil(excessExp / 10)
            const excessMoney = excessSteps * unit
            sum += costToPrevLevel.money + costToNlMax.money - excessMoney
          } else {
            sum += costToPrevLevel.money + costToNlMax.money
          }
        } else {
          // 只升一级，使用新经验（如果为空则为0）
          const costWithNewExp = CultivationCalculator.calculateCost(c.current_level, nl, c.mode, !isNaN(ne) ? ne : 0)
          sum += costWithNewExp.money
        }
      } else if (!isNaN(ne) && ne > c.current_exp) {
        const inc = Math.floor((ne - c.current_exp) / 10)
        if (inc > 0) sum += inc * unit
      }
    })
    return sum
  }, [master, assist, cultivations, mNew, aNew, cNewLvl, cNewExp])

  const handleApply = async () => {
    try {
      // accumulate updates
      let money = 0
      const today = new Date().toISOString().slice(0,10)
      for (const s of master) {
        const nv = parseInt(mNew[s.id] || '')
        if (!isNaN(nv) && nv > s.current_level) {
          money += SkillCalculator.calculateMasterCost(s.current_level, nv).money
          await updateMasterSkill(s.id, nv, s.target_level)
          const cost = SkillCalculator.calculateMasterCost(s.current_level, nv)
          await addChangeLog({
            account_id: accountId, category: 'master', name: s.skill_name,
            from_level: s.current_level, to_level: nv, from_exp: undefined, to_exp: undefined,
            consumed_exp: cost.experience, consumed_money: cost.money, consumed_gang: 0, consumed_cultivation_exp: 0, date: today,
          })
        }
      }
      for (const s of assist) {
        const nv = parseInt(aNew[s.id] || '')
        if (!isNaN(nv) && nv > s.current_level) {
          money += SkillCalculator.calculateAssistCost(s.current_level, nv).money
          await updateAssistSkill(s.id, nv, s.target_level)
          const cost = SkillCalculator.calculateAssistCost(s.current_level, nv)
          await addChangeLog({
            account_id: accountId, category: 'assist', name: s.skill_name,
            from_level: s.current_level, to_level: nv, from_exp: undefined, to_exp: undefined,
            consumed_exp: cost.experience, consumed_money: cost.money, consumed_gang: cost.gang || 0, consumed_cultivation_exp: 0, date: today,
          })
        }
      }
      for (const c of cultivations) {
        const nlRaw = cNewLvl[c.id]
        const nl = nlRaw !== undefined && nlRaw !== '' ? parseInt(nlRaw) : NaN
        const neRaw = cNewExp[c.id]
        const ne = neRaw !== undefined && neRaw !== '' ? parseInt(neRaw) : NaN
        const unit = c.mode === '2w' ? 20000 : 30000
        if (!isNaN(nl) && nl > c.current_level) {
          // 跨等级升级：如果新经验为空，默认为0
          const newExpForSave = !isNaN(ne) ? ne : 0
          let cost: { experience: number, money: number }
          
          if (nl > c.current_level + 1) {
            // 跨等级升级：先计算到新等级-1的满经验
            const costToPrevLevel = CultivationCalculator.calculateCost(c.current_level, nl - 1, c.mode, c.current_exp)
            // 获取 nl-1 级的满经验值
            const prevLevelMaxExp = cultivationPerLevel[c.mode][nl - 1]?.exp || 0
            // 从 nl-1 级满经验升到 nl 级，nl 级经验为 newExpForSave
            const costToNlMax = CultivationCalculator.calculateCost(nl - 1, nl, c.mode, prevLevelMaxExp)
            // 如果新经验小于 nl 级满经验，需要减去从 newExpForSave 到满经验的部分
            const nlLevelMaxExp = cultivationPerLevel[c.mode][nl]?.exp || 0
            if (newExpForSave < nlLevelMaxExp) {
              const excessExp = nlLevelMaxExp - newExpForSave
              const excessSteps = Math.ceil(excessExp / 10)
              const excessMoney = excessSteps * unit
              const excessExpTotal = excessExp
              cost = {
                experience: costToPrevLevel.experience + costToNlMax.experience - excessExpTotal,
                money: costToPrevLevel.money + costToNlMax.money - excessMoney
              }
            } else {
              cost = {
                experience: costToPrevLevel.experience + costToNlMax.experience,
                money: costToPrevLevel.money + costToNlMax.money
              }
            }
          } else {
            // 只升一级，使用新经验（如果为空则为0）
            cost = CultivationCalculator.calculateCost(c.current_level, nl, c.mode, newExpForSave)
          }
          
          money += cost.money
          await updateCultivationService(c.id, c.mode, newExpForSave, nl, c.target_level)
          await addChangeLog({
            account_id: accountId, category: 'cultivation', name: c.name || (c.mode==='2w'?'防御修炼':'攻击修炼'),
            from_level: c.current_level, to_level: nl, from_exp: c.current_exp, to_exp: newExpForSave,
            consumed_exp: 0, consumed_money: cost.money, consumed_gang: 0, consumed_cultivation_exp: cost.experience, date: today,
          })
        } else if (!isNaN(ne) && ne > c.current_exp) {
          const inc = Math.floor((ne - c.current_exp) / 10)
          if (inc > 0) money += inc * unit
          await updateCultivationService(c.id, c.mode, ne, c.current_level, c.target_level)
          await addChangeLog({
            account_id: accountId, category: 'cultivation', name: c.name || (c.mode==='2w'?'防御修炼':'攻击修炼'),
            from_level: c.current_level, to_level: c.current_level, from_exp: c.current_exp, to_exp: ne,
            consumed_exp: 0, consumed_money: inc * unit, consumed_gang: 0, consumed_cultivation_exp: inc * 10, date: today,
          })
        }
      }
      if (money > 0) {
        await addSpendLog(accountId, money, today, '更新技能自动记录')
      }
      showToast('已更新并记录消耗', 'success')
      onUpdated()
      window.dispatchEvent(new Event('mhxy:dataChanged'))
      setMNew({}); setANew({}); setCNewLvl({}); setCNewExp({})
    } catch (e) {
      console.error(e)
      showToast('更新失败', 'error')
    }
  }

  const toWanInt = (v: number) => Math.floor(v / 10000)

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3">
      <h3 className="text-base font-semibold pl-3 mb-3">更新技能</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <h4 className="text-sm font-semibold pl-3 mb-2">师门技能</h4>
          <div className="space-y-2">
            {master.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
                <div className="text-sm text-gray-800">{s.skill_name} · 当前 {s.current_level}</div>
                <input className="w-24 border border-gray-300 rounded px-2 py-1 text-sm" inputMode="numeric" value={mNew[s.id] || ''} onChange={(e)=>{const v=e.target.value; if(/^\d*$/.test(v)) setMNew(prev=>({...prev,[s.id]:v}))}} placeholder="新等级" />
              </div>
            ))}
            {master.length===0 && <div className="text-xs text-gray-500">暂无师门技能</div>}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold pl-3 mb-2">辅助技能</h4>
          <div className="space-y-2">
            {assist.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
                <div className="text-sm text-gray-800">{s.skill_name} · 当前 {s.current_level}</div>
                <input className="w-24 border border-gray-300 rounded px-2 py-1 text-sm" inputMode="numeric" value={aNew[s.id] || ''} onChange={(e)=>{const v=e.target.value; if(/^\d*$/.test(v)) setANew(prev=>({...prev,[s.id]:v}))}} placeholder="新等级" />
              </div>
            ))}
            {assist.length===0 && <div className="text-xs text-gray-500">暂无辅助技能</div>}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-semibold pl-3 mb-2">修炼</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {cultivations.map(c => (
            <div key={c.id} className="rounded border border-gray-200 p-3">
              <div className="text-sm text-gray-800 mb-2">{c.name || (c.mode==='2w'?'防御修炼':'攻击修炼')} · 当前 等级 {c.current_level} · 经验 {c.current_exp}</div>
              <div className="flex gap-2">
                <input className="w-24 border border-gray-300 rounded px-2 py-1 text-sm" inputMode="numeric" value={cNewLvl[c.id] || ''} onChange={(e)=>{const v=e.target.value; if(/^\d*$/.test(v)) setCNewLvl(prev=>({...prev,[c.id]:v}))}} placeholder="新等级" />
                <input className="w-28 border border-gray-300 rounded px-2 py-1 text-sm" inputMode="numeric" value={cNewExp[c.id] || ''} onChange={(e)=>{const v=e.target.value; if(/^\d*$/.test(v)) setCNewExp(prev=>({...prev,[c.id]:v}))}} placeholder="新当前经验" />
              </div>
              {(() => {
                const nlRaw = cNewLvl[c.id]
                const nl = nlRaw !== undefined && nlRaw !== '' ? parseInt(nlRaw) : NaN
                const neRaw = cNewExp[c.id]
                const ne = neRaw !== undefined && neRaw !== '' ? parseInt(neRaw) : NaN
                const unit = c.mode === '2w' ? 20000 : 30000
                let money = 0
                if (!isNaN(nl) && nl > c.current_level) {
                  // 跨等级升级：如果新经验为空，默认为0
                  const newExpForCalc = !isNaN(ne) ? ne : 0
                  if (nl > c.current_level + 1) {
                    // 跨等级升级：先计算到新等级-1的满经验
                    const costToPrevLevel = CultivationCalculator.calculateCost(c.current_level, nl - 1, c.mode, c.current_exp)
                    const prevLevelMaxExp = cultivationPerLevel[c.mode][nl - 1]?.exp || 0
                    const costToNlMax = CultivationCalculator.calculateCost(nl - 1, nl, c.mode, prevLevelMaxExp)
                    const nlLevelMaxExp = cultivationPerLevel[c.mode][nl]?.exp || 0
                    if (newExpForCalc < nlLevelMaxExp) {
                      const excessExp = nlLevelMaxExp - newExpForCalc
                      const excessSteps = Math.ceil(excessExp / 10)
                      const excessMoney = excessSteps * unit
                      money = costToPrevLevel.money + costToNlMax.money - excessMoney
                    } else {
                      money = costToPrevLevel.money + costToNlMax.money
                    }
                  } else {
                    // 只升一级，使用新经验（如果为空则为0）
                    const cost = CultivationCalculator.calculateCost(c.current_level, nl, c.mode, newExpForCalc)
                    money = cost.money
                  }
                } else if (!isNaN(ne) && ne > c.current_exp) {
                  const inc = Math.floor((ne - c.current_exp) / 10)
                  if (inc > 0) money = inc * unit
                }
                return money > 0 ? (
                  <div className="mt-2 text-xs text-emerald-700">预计消耗：{Math.floor(money/10000)} 万</div>
                ) : null
              })()}
            </div>
          ))}
          {cultivations.length===0 && <div className="text-xs text-gray-500 pl-3">暂无修炼</div>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700 pl-3">预计消耗金钱：<span className="font-semibold text-emerald-700">{toWanInt(totalMoney)} 万</span></div>
        <Button size="sm" onClick={handleApply} disabled={totalMoney<=0}>应用更新并记录</Button>
      </div>
    </div>
  )
}


