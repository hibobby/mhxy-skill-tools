import { invoke } from '@tauri-apps/api/core'

export interface SpendLog {
  id: number
  account_id: number
  amount: number
  date: string
  note?: string
  created_at: string
}

export interface SpendSummary { date: string; total: number }

export async function addSpendLog(accountId: number, amount: number, date: string, note?: string): Promise<number> {
  return await invoke('add_spend_log', { account_id: accountId, accountId, amount, date, note }) as number
}

export async function getSpendLogs(accountId: number, start?: string, end?: string): Promise<SpendLog[]> {
  return await invoke('get_spend_logs', { account_id: accountId, accountId, start, end }) as SpendLog[]
}

export async function getSpendSummaryDaily(start: string, end: string): Promise<SpendSummary[]> {
  return await invoke('get_spend_summary_daily', { start, end }) as SpendSummary[]
}

export async function getSpendSummaryMonthly(year: number): Promise<SpendSummary[]> {
  return await invoke('get_spend_summary_monthly', { year }) as SpendSummary[]
}


