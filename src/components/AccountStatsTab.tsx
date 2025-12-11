import { useEffect, useState } from 'react'
import { getSpendLogs, SpendLog } from '../services/spendService'

export function AccountStatsTab({ accountId }: { accountId: number }) {
  const [logs, setLogs] = useState<SpendLog[]>([])
  const [range, setRange] = useState<{start:string,end:string}>(()=>({start:new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10), end:new Date().toISOString().slice(0,10)}))

  useEffect(() => {
    const load = async () => {
      const data = await getSpendLogs(accountId, range.start, range.end)
      setLogs(data)
    }
    load()
  }, [accountId, range])

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3">
      <h3 className="text-base font-semibold pl-3 mb-3">统计</h3>
      <div className="flex gap-2 mb-3">
        <input type="date" className="border border-gray-300 rounded px-2.5 py-1.5 text-sm" value={range.start} onChange={(e)=>setRange(r=>({...r,start:e.target.value}))} />
        <span className="text-sm text-gray-500">至</span>
        <input type="date" className="border border-gray-300 rounded px-2.5 py-1.5 text-sm" value={range.end} onChange={(e)=>setRange(r=>({...r,end:e.target.value}))} />
      </div>
      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">日期</th>
              <th className="text-left px-3 py-2">备注</th>
              <th className="text-right px-3 py-2">金额</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">{l.date}</td>
                <td className="px-3 py-2">{l.note || '-'}</td>
                <td className="px-3 py-2 text-right">{l.amount.toLocaleString()}</td>
              </tr>
            ))}
            {logs.length===0 && <tr><td className="px-3 py-4 text-center text-gray-500" colSpan={3}>暂无记录</td></tr>}
            {logs.length>0 && (
              <tr className="border-t bg-gray-50">
                <td className="px-3 py-2 font-medium">合计（万）</td>
                <td className="px-3 py-2 text-gray-500">—</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {Math.floor(logs.reduce((sum, l) => sum + l.amount, 0) / 10000).toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


