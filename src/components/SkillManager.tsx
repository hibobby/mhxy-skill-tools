import { useState, useEffect } from 'react'
import { Dialog } from './ui/dialog'
import { showToast } from './ui/toast'
import Button from './ui/button'
import { School } from '../data/schools'
import SkillItem from './SkillItem'
import SkillCalculator from '../utils/skillCalculator'
import {
  addMasterSkill,
  updateMasterSkill,
  deleteMasterSkill,
  getMasterSkills,
  addAssistSkill,
  updateAssistSkill,
  deleteAssistSkill,
  getAssistSkills,
  Skill,
} from '../services/skillService'

interface Props {
  accountId: number
  school: School | null
  type: 'master' | 'assist'
  onRefresh: () => void
}

interface FormState {
  skillName: string
  currentLevel: string // raw input to避免0删不掉
  targetLevel: string
}

export default function SkillManager({ accountId, school, type, onRefresh: _onRefresh }: Props) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [formState, setFormState] = useState<FormState>({
    skillName: '',
    currentLevel: '',
    targetLevel: '',
  })

  const isMaster = type === 'master'
  const assistSkillOptions = [
    '强身术','冥想','暗器技巧','打造技巧','裁缝技巧','中药医理','炼金术','烹饪技巧','追捕技巧','逃离技巧','养生之道','健身术','巧匠之术','熔炼技巧','灵石技巧','强壮','淬灵之术','神速','风之感应','雨之感应','雪之感应'
  ]

  useEffect(() => {
    loadSkills()
  }, [accountId, type])

  const loadSkills = async () => {
    try {
      const result = isMaster ? await getMasterSkills(accountId) : await getAssistSkills(accountId)
      setSkills(result)
    } catch (error) {
      console.error('加载技能失败:', error)
    }
  }

  const handleAdd = () => {
    if (isMaster && school) {
      const notAddedSkills = school.masterSkills.filter(
        skillName => !skills.some(s => s.skill_name === skillName)
      )
      if (notAddedSkills.length === 0) {
        alert('该门派的所有师门技能已添加完毕')
        return
      }
      setFormState({
        skillName: notAddedSkills[0],
        currentLevel: '',
        targetLevel: '',
      })
    } else {
      setFormState({
        skillName: '',
        currentLevel: '',
        targetLevel: '',
      })
    }
    setEditingSkill(null)
    setShowForm(true)
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setFormState({
      skillName: skill.skill_name,
      currentLevel: String(skill.current_level ?? ''),
      targetLevel: String(skill.target_level ?? ''),
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const currentLevelNum = Math.max(0, parseInt(formState.currentLevel || '0'))
      const targetLevelNum = Math.max(0, parseInt(formState.targetLevel || '0'))
      if (editingSkill) {
        if (isMaster) {
          await updateMasterSkill(editingSkill.id, currentLevelNum, targetLevelNum)
        } else {
          await updateAssistSkill(editingSkill.id, currentLevelNum, targetLevelNum)
        }
      } else {
        if (isMaster) {
          await addMasterSkill(accountId, formState.skillName, currentLevelNum, targetLevelNum)
        } else {
          await addAssistSkill(accountId, formState.skillName, currentLevelNum, targetLevelNum)
        }
      }
      await loadSkills()
      window.dispatchEvent(new Event('mhxy:dataChanged'))
      setShowForm(false)
      setEditingSkill(null)
    } catch (error) {
      console.error('保存技能失败:', error)
      showToast('保存技能失败', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (isMaster) {
        await deleteMasterSkill(id)
      } else {
        await deleteAssistSkill(id)
      }
      await loadSkills()
      window.dispatchEvent(new Event('mhxy:dataChanged'))
      showToast('删除成功', 'success')
    } catch (error) {
      console.error('删除技能失败:', error)
      showToast('删除技能失败', 'error')
    }
  }

  const getTotalCost = () => {
    let totalExp = 0
    let totalMoney = 0
    let totalGang = 0
    skills.forEach(skill => {
      const cost = isMaster
        ? SkillCalculator.calculateMasterCost(skill.current_level, skill.target_level)
        : SkillCalculator.calculateAssistCost(skill.current_level, skill.target_level)
      totalExp += cost.experience
      totalMoney += cost.money
      if (!isMaster) totalGang += cost.gang || 0
    })
    return { experience: totalExp, money: totalMoney, gang: totalGang }
  }

  const totals = getTotalCost()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold pl-3">
          {isMaster ? '师门技能' : '辅助技能'}
        </h3>
        <Button size="sm" onClick={handleAdd}>+ 添加{isMaster ? '师门技能' : '辅助技能'}</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-md p-3 mb-3">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">
            {editingSkill ? '编辑技能' : '添加技能'}
          </h4>
          <div className="space-y-2 text-sm">
            {isMaster ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  技能名称
                </label>
                <select
                  value={formState.skillName}
                  onChange={(e) => setFormState({ ...formState, skillName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
                  disabled={!!editingSkill}
                  required
                >
                  <option value="">请选择技能</option>
                  {(school?.masterSkills || []).map(skillName => (
                    <option key={skillName} value={skillName}>
                      {skillName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  技能名称
                </label>
                <select
                  value={formState.skillName}
                  onChange={(e) => setFormState({ ...formState, skillName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
                  disabled={!!editingSkill}
                  required
                >
                  <option value="">请选择辅助技能</option>
                  {assistSkillOptions.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  当前等级
                </label>
                <input
                  inputMode="numeric"
                  value={formState.currentLevel}
                  onChange={(e) => {
                    const v = e.target.value
                    if (/^\d*$/.test(v)) setFormState({ ...formState, currentLevel: v })
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  目标等级
                </label>
                <input
                  inputMode="numeric"
                  value={formState.targetLevel}
                  onChange={(e) => {
                    const v = e.target.value
                    if (/^\d*$/.test(v)) setFormState({ ...formState, targetLevel: v })
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="180"
                />
              </div>
            </div>

            {(() => {
              const cl = Math.max(0, parseInt(formState.currentLevel || '0'))
              const tl = Math.max(0, parseInt(formState.targetLevel || '0'))
              return tl > cl
            })() && (
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <p className="text-[13px] text-gray-800">
                  所需经验: {(isMaster ? SkillCalculator.calculateMasterCost(Math.max(0, parseInt(formState.currentLevel || '0')), Math.max(0, parseInt(formState.targetLevel || '0'))).experience : SkillCalculator.calculateAssistCost(Math.max(0, parseInt(formState.currentLevel || '0')), Math.max(0, parseInt(formState.targetLevel || '0'))).experience).toLocaleString()}
                </p>
                <p className="text-[13px] text-gray-800">
                  所需金钱: {(isMaster ? SkillCalculator.calculateMasterCost(Math.max(0, parseInt(formState.currentLevel || '0')), Math.max(0, parseInt(formState.targetLevel || '0'))).money : SkillCalculator.calculateAssistCost(Math.max(0, parseInt(formState.currentLevel || '0')), Math.max(0, parseInt(formState.targetLevel || '0'))).money).toLocaleString()}
                </p>
                {!isMaster && (
                  <p className="text-[13px] text-gray-800">
                    所需帮贡: {SkillCalculator.calculateAssistCost(Math.max(0, parseInt(formState.currentLevel || '0')), Math.max(0, parseInt(formState.targetLevel || '0'))).gang?.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditingSkill(null) }}>取消</Button>
              <Button size="sm" onClick={handleSave}>保存</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {skills.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无{isMaster ? '师门技能' : '辅助技能'}</p>
        ) : (
          skills.map(skill => (
            <SkillItem
              key={skill.id}
              skill={skill}
              onEdit={() => handleEdit(skill)}
              onDelete={() => setConfirmDeleteId(skill.id)}
              isMaster={isMaster}
            />
          ))
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-900">
            总计所需经验: <span className="font-bold">{totals.experience.toLocaleString()}</span>
          </p>
          <p className="text-sm text-yellow-900">
            总计所需金钱: <span className="font-bold">{totals.money.toLocaleString()}</span>
          </p>
          {!isMaster && (
            <p className="text-sm text-yellow-900">
              总计所需帮贡: <span className="font-bold">{(totals as any).gang.toLocaleString()}</span>
            </p>
          )}
        </div>
      )}

      <Dialog
        open={confirmDeleteId !== null}
        title="删除确认"
        description="确定要删除这个技能吗？该操作不可撤销。"
        onClose={() => setConfirmDeleteId(null)}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>取消</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => { if (confirmDeleteId!==null) handleDelete(confirmDeleteId); setConfirmDeleteId(null) }}>删除</Button>
          </>
        }
      />
    </div>
  )
}


