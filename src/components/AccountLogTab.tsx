import { useEffect, useState } from 'react'
import { getChangeLogs, ChangeLog } from '../services/changeLogService'

export default function AccountLogTab({ accountId }: { accountId: number }) {
  const [logs, setLogs] = useState<ChangeLog[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await getChangeLogs(accountId)
      setLogs(data)
    }
    load()
  }, [accountId])

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3">
      <h3 className="text-base font-semibold pl-3 mb-3">变更日志</h3>
      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">日期</th>
              <th className="text-left px-3 py-2">类型</th>
              <th className="text-left px-3 py-2">名称</th>
              <th className="text-left px-3 py-2">从</th>
              <th className="text-left px-3 py-2">到</th>
              <th className="text-right px-3 py-2">经验</th>
              <th className="text-right px-3 py-2">金钱</th>
              <th className="text-right px-3 py-2">帮贡</th>
              <th className="text-right px-3 py-2">修炼经验</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">{l.date}</td>
                <td className="px-3 py-2">{(() => {
                  const map: Record<string, string> = { master: '师门技能', assist: '辅助技能', cultivation: '修炼' }
                  return map[l.category] || l.category
                })()}</td>
                <td className="px-3 py-2">{l.name}</td>
                <td className="px-3 py-2">{l.from_level ?? l.from_exp ?? '-'}</td>
                <td className="px-3 py-2">{l.to_level ?? l.to_exp ?? '-'}</td>
                <td className="px-3 py-2 text-right">{(l.consumed_exp || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{(l.consumed_money || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{(l.consumed_gang || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{(l.consumed_cultivation_exp || 0).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length===0 && (
              <tr><td className="px-3 py-4 text-center text-gray-500" colSpan={9}>暂无日志</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


