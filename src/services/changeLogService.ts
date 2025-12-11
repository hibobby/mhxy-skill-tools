import { invoke } from '@tauri-apps/api/core'

export interface ChangeLog {
  id: number
  account_id: number
  category: 'master' | 'assist' | 'cultivation'
  name: string
  from_level?: number
  to_level?: number
  from_exp?: number
  to_exp?: number
  consumed_exp: number
  consumed_money: number
  consumed_gang: number
  consumed_cultivation_exp: number
  date: string
  created_at: string
}

export async function addChangeLog(payload: Omit<ChangeLog, 'id' | 'created_at'>): Promise<number> {
  const {
    account_id, category, name, from_level, to_level, from_exp, to_exp,
    consumed_exp, consumed_money, consumed_gang, consumed_cultivation_exp, date,
  } = payload
  return await invoke('add_change_log', {
    // 兼容 new/old 参数命名
    account_id, accountId: account_id,
    category, name,
    from_level, fromLevel: from_level,
    to_level, toLevel: to_level,
    from_exp, fromExp: from_exp,
    to_exp, toExp: to_exp,
    consumed_exp, consumedExp: consumed_exp,
    consumed_money, consumedMoney: consumed_money,
    consumed_gang, consumedGang: consumed_gang,
    consumed_cultivation_exp, consumedCultivationExp: consumed_cultivation_exp,
    date,
  }) as number
}

export async function getChangeLogs(accountId: number): Promise<ChangeLog[]> {
  return await invoke('get_change_logs', { account_id: accountId, accountId }) as ChangeLog[]
}


