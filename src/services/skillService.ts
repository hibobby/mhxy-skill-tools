import { invoke } from '@tauri-apps/api/core'

export interface Skill {
  id: number
  account_id: number
  skill_name: string
  current_level: number
  target_level: number
}

export async function addMasterSkill(
  accountId: number,
  skillName: string,
  currentLevel: number,
  targetLevel: number
): Promise<number> {
  return await invoke('add_master_skill', { accountId, skillName, currentLevel, targetLevel }) as number
}

export async function updateMasterSkill(
  id: number,
  currentLevel: number,
  targetLevel: number
): Promise<void> {
  await invoke('update_master_skill', { id, currentLevel, targetLevel })
}

export async function deleteMasterSkill(id: number): Promise<void> {
  await invoke('delete_master_skill', { id })
}

export async function getMasterSkills(accountId: number): Promise<Skill[]> {
  return await invoke('get_master_skills', { accountId }) as Skill[]
}

export async function addAssistSkill(
  accountId: number,
  skillName: string,
  currentLevel: number,
  targetLevel: number
): Promise<number> {
  return await invoke('add_assist_skill', { accountId, skillName, currentLevel, targetLevel }) as number
}

export async function updateAssistSkill(
  id: number,
  currentLevel: number,
  targetLevel: number
): Promise<void> {
  await invoke('update_assist_skill', { id, currentLevel, targetLevel })
}

export async function deleteAssistSkill(id: number): Promise<void> {
  await invoke('delete_assist_skill', { id })
}

export async function getAssistSkills(accountId: number): Promise<Skill[]> {
  return await invoke('get_assist_skills', { accountId }) as Skill[]
}

