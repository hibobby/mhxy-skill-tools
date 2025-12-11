import { useMemo, useState } from 'react'
import type { Account } from '../services/accountService'
import { addSpendLog } from '../services/spendService'
import Button from './ui/button'
import { showToast } from './ui/toast'

interface Props { accounts: Account[]; onUpdated: () => void }

export default function UpdateTab({ accounts, onUpdated }: Props) {
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 0)
  const [amount, setAmount] = useState<string>('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [note, setNote] = useState<string>('')

  const current = useMemo(() => accounts.find(a => a.id === accountId) || null, [accounts, accountId])

  const handleSubmit = async () => {
    const amt = Math.max(0, parseInt(amount || '0'))
    if (!accountId || amt <= 0) { showToast('请选择账号并输入有效金额', 'error'); return }
    try {
      await addSpendLog(accountId, amt, date, note || undefined)
      showToast('已记录消耗并扣除余额', 'success')
      setAmount('')
      setNote('')
      onUpdated()
      window.dispatchEvent(new Event('mhxy:dataChanged'))
    } catch (e) {
      console.error(e)
      showToast('记录失败', 'error')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3">
      <h3 className="text-base font-semibold pl-3 mb-3">更新技能</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-700 mb-1">账号</label>
          <select className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm" value={accountId} onChange={(e)=>setAccountId(parseInt(e.target.value))}>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">消耗金额（梦幻币）</label>
          <input className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm" inputMode="numeric" value={amount} onChange={(e)=>{ const v=e.target.value; if(/^\d*$/.test(v)) setAmount(v) }} placeholder="例如 300000" />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">日期</label>
          <input type="date" className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">备注</label>
          <input className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="可选" />
        </div>
      </div>
      {current && (
        <div className="mt-3 text-xs text-gray-600 pl-3">当前余额：{current.gold.toLocaleString()}</div>
      )}
      <div className="flex justify-end mt-3">
        <Button size="sm" onClick={handleSubmit}>记录消耗并更新</Button>
      </div>
    </div>
  )
}


