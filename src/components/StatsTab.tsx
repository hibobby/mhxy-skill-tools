import { useEffect, useState } from 'react'
import { getSpendSummaryDaily, getSpendSummaryMonthly, SpendSummary } from '../services/spendService'

export default function StatsTab() {
  const [mode, setMode] = useState<'daily'|'monthly'>('daily')
  const [start, setStart] = useState<string>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10))
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [data, setData] = useState<SpendSummary[]>([])

  useEffect(() => {
    const load = async () => {
      if (mode === 'daily') {
        const res = await getSpendSummaryDaily(start, end)
        setData(res)
      } else {
        const res = await getSpendSummaryMonthly(year)
        setData(res)
      }
    }
    load()
  }, [mode, start, end, year])

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3">
      <h3 className="text-base font-semibold pl-3 mb-3">统计</h3>
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="inline-flex gap-1 rounded-md border bg-white p-1">
          <button className={`px-3 py-1.5 rounded ${mode==='daily'?'bg-blue-600 text-white':'text-gray-700 hover:bg-gray-100'}`} onClick={()=>setMode('daily')}>按日</button>
          <button className={`px-3 py-1.5 rounded ${mode==='monthly'?'bg-blue-600 text-white':'text-gray-700 hover:bg-gray-100'}`} onClick={()=>setMode('monthly')}>按月</button>
        </div>
        {mode==='daily' ? (
          <div className="flex gap-2 items-center">
            <input type="date" className="border border-gray-300 rounded px-2.5 py-1.5 text-sm" value={start} onChange={(e)=>setStart(e.target.value)} />
            <span className="text-sm text-gray-500">至</span>
            <input type="date" className="border border-gray-300 rounded px-2.5 py-1.5 text-sm" value={end} onChange={(e)=>setEnd(e.target.value)} />
          </div>
        ) : (
          <div>
            <input className="border border-gray-300 rounded px-2.5 py-1.5 text-sm" inputMode="numeric" value={year} onChange={(e)=>{ const v=e.target.value; if(/^\d*$/.test(v)) setYear(parseInt(v||'0')||new Date().getFullYear()) }} />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">日期</th>
              <th className="text-right px-3 py-2">总消耗（梦幻币）</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date} className="border-t">
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2 text-right">{row.total.toLocaleString()}</td>
              </tr>
            ))}
            {data.length===0 && (
              <tr><td className="px-3 py-4 text-center text-gray-500" colSpan={2}>暂无数据</td></tr>
            )}
            {data.length>0 && (
              <tr className="border-t bg-gray-50">
                <td className="px-3 py-2 font-medium">合计（万）</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {Math.floor(data.reduce((sum, r) => sum + r.total, 0) / 10000).toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


