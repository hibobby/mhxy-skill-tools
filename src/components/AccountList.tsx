import { useEffect, useState } from 'react'
import AccountDetail from './AccountDetail'
import { Card, CardHeader, CardContent } from './ui/card'
import Button from './ui/button'
import { School } from '../data/schools'
import { deleteAccount as deleteAccountService, Account } from '../services/accountService'
import { getMasterSkills, getAssistSkills } from '../services/skillService'
import { getCultivations } from '../services/cultivationService'
import SkillCalculator from '../utils/skillCalculator'
import CultivationCalculator from '../utils/cultivationCalculator'
// 已移除 antd，使用 Tailwind 样式

interface Props {
  accounts: Account[]
  onEdit: (account: Account) => void
  onRefresh: () => void
}

export default function AccountList({ accounts, onEdit, onRefresh }: Props) {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [totalsMap, setTotalsMap] = useState<Record<number, {
    master: { exp: number; money: number },
    assist: { exp: number; money: number; gang: number },
    cultivation: { exp: number; money: number },
    allMoney: number,
  }>>({})

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个账号吗？')) {
      try {
        await deleteAccountService(id)
        onRefresh()
        if (selectedAccount === id) {
          setSelectedAccount(null)
        }
      } catch (error) {
        console.error('删除账号失败:', error)
        alert('删除账号失败')
      }
    }
  }

  const school = School.getSchoolByName(accounts.find(a => a.id === selectedAccount)?.school || '')

  useEffect(() => {
    const loadTotals = async () => {
      const map: Record<number, any> = {}
      for (const acc of accounts) {
        try {
          const [master, assist, cultivations] = await Promise.all([
            getMasterSkills(acc.id),
            getAssistSkills(acc.id),
            getCultivations(acc.id),
          ])
          // 师门
          let mExp = 0, mMoney = 0
          master.forEach(s => {
            const c = SkillCalculator.calculateMasterCost(s.current_level, s.target_level)
            mExp += c.experience
            mMoney += c.money
          })
          // 辅助
          let aExp = 0, aMoney = 0, aGang = 0
          assist.forEach(s => {
            const c = SkillCalculator.calculateAssistCost(s.current_level, s.target_level)
            aExp += c.experience
            aMoney += c.money
            aGang += c.gang || 0
          })
          // 修炼
          let cExp = 0, cMoney = 0
          cultivations.forEach(c => {
            const r = CultivationCalculator.calculateCost(c.current_level, c.target_level, c.mode, c.current_exp)
            cExp += r.experience
            cMoney += r.money
          })
          map[acc.id] = {
            master: { exp: mExp, money: mMoney },
            assist: { exp: aExp, money: aMoney, gang: aGang },
            cultivation: { exp: cExp, money: cMoney },
            allMoney: mMoney + aMoney + cMoney,
          }
        } catch {}
      }
      setTotalsMap(map)
    }
    if (accounts.length) loadTotals()
    const handler = () => { if (accounts.length) loadTotals() }
    window.addEventListener('mhxy:dataChanged', handler)
    return () => window.removeEventListener('mhxy:dataChanged', handler)
  }, [accounts])

  const toWanInt = (v: number) => Math.floor(v / 10000)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <h4 className="text-base font-semibold mt-0 pl-3 mb-2">账号列表</h4>
        {accounts.length === 0 ? (
          <div className="bg-white rounded border p-3 text-sm text-gray-500">暂无账号，请添加账号</div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className={`group cursor-pointer transition-all ${selectedAccount === account.id ? 'border-blue-500' : ''} hover:shadow-sm hover:border-gray-300 rounded-xl`}
                onClick={() => setSelectedAccount(account.id)}
              >
                <CardHeader className="flex items-start justify-between bg-gradient-to-b from-white to-gray-50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className="text-[15px] font-semibold text-gray-900 tracking-wide">{account.name}</div>
                    <span className="text-[11px] inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-gray-700 bg-white">
                      {account.school}
                    </span>
                  </div>
                  <div className="flex gap-1.5 ml-4 shrink-0">
                    <Button size="sm" variant="ghost" className="text-gray-700" onClick={(e)=>{e.stopPropagation(); onEdit(account)}}>编辑</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={(e)=>{e.stopPropagation(); handleDelete(account.id)}}>删除</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <div className="text-[13px] text-gray-600 pl-3">等级 {account.level} · 经验 {account.experience.toLocaleString()}</div>
                  {totalsMap[account.id] && (
                    <div className="mt-3 space-y-2 pl-3">
                      <div className="text-[13px] text-gray-800 leading-5">师门：经验 {toWanInt(totalsMap[account.id].master.exp)} 万 · 金钱 {toWanInt(totalsMap[account.id].master.money)} 万</div>
                      <div className="text-[13px] text-gray-800 leading-5">辅助：经验 {toWanInt(totalsMap[account.id].assist.exp)} 万 · 金钱 {toWanInt(totalsMap[account.id].assist.money)} 万 · 帮贡 {totalsMap[account.id].assist.gang.toLocaleString()}</div>
                      <div className="text-[13px] text-gray-800 leading-5">修炼：修炼经验 {toWanInt(totalsMap[account.id].cultivation.exp)} 万 · 金钱 {toWanInt(totalsMap[account.id].cultivation.money)} 万</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[13px] font-semibold text-blue-900">
                          合计经验 <span className="text-blue-700">{toWanInt(totalsMap[account.id].master.exp + totalsMap[account.id].assist.exp + totalsMap[account.id].cultivation.exp)} 万</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[13px] font-semibold text-emerald-900">
                          合计金钱 <span className="text-emerald-700">{toWanInt(totalsMap[account.id].allMoney)} 万</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="lg:col-span-2">
        {selectedAccount ? (
          <AccountDetail accountId={selectedAccount} school={school} onRefresh={onRefresh} />
        ) : (
          <div className="bg-white rounded border p-4 text-sm text-gray-500">请选择一个账号查看详情</div>
        )}
      </div>
    </div>
  )
}

