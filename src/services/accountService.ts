import { invoke } from '@tauri-apps/api/core'

export interface Account {
  id: number
  name: string
  school: string
  level: number
  experience: number
  gold: number
}

export async function initDb(): Promise<void> {
  await invoke('db_init')
}

export async function addAccount(
  name: string,
  school: string,
  level: number,
  experience: number
): Promise<number> {
  return await invoke('add_account', { name, school, level, experience }) as number
}

export async function updateAccount(
  id: number,
  name: string,
  school: string,
  level: number,
  experience: number
): Promise<void> {
  await invoke('update_account', { id, name, school, level, experience })
}

export async function deleteAccount(id: number): Promise<void> {
  await invoke('delete_account', { id })
}

export async function getAllAccounts(): Promise<Account[]> {
  return await invoke('get_all_accounts') as Account[]
}

