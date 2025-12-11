import { invoke } from '@tauri-apps/api/core'

export interface Cultivation {
  id: number
  account_id: number
  name: string
  type: string
  mode: '2w' | '3w'
  current_exp: number
  current_level: number
  target_level: number
}

export async function addCultivation(
  accountId: number,
  name: string,
  type: string,
  mode: '2w' | '3w',
  currentExp: number,
  currentLevel: number,
  targetLevel: number
): Promise<number> {
  return await invoke('add_cultivation', {
    // 兼容参数命名
    account_id: accountId,
    accountId,
    name,
    type,
    mode,
    current_exp: currentExp,
    currentExp,
    current_level: currentLevel,
    currentLevel,
    target_level: targetLevel,
    targetLevel,
  }) as number
}

export async function updateCultivation(
  id: number,
  mode: '2w' | '3w',
  currentExp: number,
  currentLevel: number,
  targetLevel: number,
  name?: string,
): Promise<void> {
  await invoke('update_cultivation', {
    id,
    name,
    mode,
    // 兼容参数命名
    current_exp: currentExp,
    currentExp,
    current_level: currentLevel,
    currentLevel,
    target_level: targetLevel,
    targetLevel,
  })
}

export async function deleteCultivation(id: number): Promise<void> {
  await invoke('delete_cultivation', { id })
}

export async function getCultivations(accountId: number): Promise<Cultivation[]> {
  // 兼容不同参数命名：同时传入 account_id 与 accountId
  return await invoke('get_cultivations', { account_id: accountId, accountId }) as Cultivation[]
}

