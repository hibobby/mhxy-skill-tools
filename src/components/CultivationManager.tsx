import { useState, useEffect } from 'react'
import CultivationCalculator from '../utils/cultivationCalculator'
import {
  addCultivation as addCultivationService,
  updateCultivation as updateCultivationService,
  deleteCultivation as deleteCultivationService,
  getCultivations as getCultivationsService,
  Cultivation,
} from '../services/cultivationService'
import type { CultivationMode } from '../data/cultivationCosts'
import { Dialog } from './ui/dialog'
import { showToast } from './ui/toast'
import Button from './ui/button'

interface Props {
  accountId: number
  onRefresh: () => void
}

const TITLE = '人物修炼'

export default function CultivationManager({ accountId, onRefresh: _onRefresh }: Props) {
  const [cultivations, setCultivations] = useState<Cultivation[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCultivation, setEditingCultivation] = useState<Cultivation | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [formState, setFormState] = useState<{ name: string, mode: CultivationMode, currentExp: string, currentLevel: string, targetLevel: string }>({
    name: '防御修炼',
    mode: '2w',
    currentExp: '',
    currentLevel: '',
    targetLevel: '',
  })

  useEffect(() => {
    loadCultivations()
  }, [accountId])

  const loadCultivations = async () => {
    try {
      const result = await getCultivationsService(accountId)
      setCultivations(result as Cultivation[])
    } catch (error) {
      console.error('加载修炼失败:', error)
    }
  }

  const handleAdd = () => {
    setEditingCultivation(null)
    setFormState({ name: '防御修炼', mode: '2w', currentExp: '', currentLevel: '', targetLevel: '' })
    setShowForm(true)
  }

  const handleEdit = (cultivation: Cultivation) => {
    setEditingCultivation(cultivation)
    setFormState({
      name: cultivation.name || '防御修炼',
      mode: cultivation.mode,
      currentExp: String(cultivation.current_exp ?? ''),
      currentLevel: String(cultivation.current_level ?? ''),
      targetLevel: String(cultivation.target_level ?? ''),
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const currentExpNum = Math.max(0, parseInt(formState.currentExp || '0'))
      const currentLevelNum = Math.max(0, parseInt(formState.currentLevel || '0'))
      const targetLevelNum = Math.max(0, parseInt(formState.targetLevel || '0'))
      if (editingCultivation) {
        await updateCultivationService(editingCultivation.id, formState.mode, currentExpNum, currentLevelNum, targetLevelNum, formState.name)
      } else {
        await addCultivationService(accountId, formState.name, 'person', formState.mode, currentExpNum, currentLevelNum, targetLevelNum)
      }
      await loadCultivations()
      window.dispatchEvent(new Event('mhxy:dataChanged'))
      setShowForm(false)
      setEditingCultivation(null)
    } catch (error) {
      console.error('保存修炼失败:', error)
      showToast('保存修炼失败', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCultivationService(id)
      await loadCultivations()
      window.dispatchEvent(new Event('mhxy:dataChanged'))
      showToast('删除成功', 'success')
    } catch (error) {
      console.error('删除修炼失败:', error)
      showToast('删除修炼失败', 'error')
    }
  }

  const getTotalCost = (type: 'person' | 'pet') => {
    let totalExp = 0
    let totalMoney = 0
    cultivations
      .filter(c => c.type === type)
      .forEach(cultivation => {
        const cost = CultivationCalculator.calculateCost(cultivation.current_level, cultivation.target_level, cultivation.mode, cultivation.current_exp)
        totalExp += cost.experience
        totalMoney += cost.money
      })
    return { experience: totalExp, money: totalMoney }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold pl-3">修炼管理</h3>
        <Button size="sm" onClick={handleAdd}>+ 添加修炼</Button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-md p-3 mb-3">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">
            {editingCultivation ? '编辑修炼' : '添加修炼'}
          </h4>
          <div className="space-y-2 text-sm">
            {/* 类型选择已移除，固定为人物修炼 */}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">修炼名称</label>
                <select
                  value={formState.name}
                  onChange={(e) => {
                    const name = e.target.value
                    const mode = (name === '防御修炼' || name === '法抗修炼') ? '2w' : '3w'
                    setFormState({ ...formState, name, mode })
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="防御修炼">防御修炼</option>
                  <option value="法抗修炼">法抗修炼</option>
                  <option value="攻击修炼">攻击修炼</option>
                  <option value="法术修炼">法术修炼</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">当前经验(点)</label>
                <input
                  inputMode="numeric"
                  value={formState.currentExp}
                  onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setFormState({ ...formState, currentExp: v }) }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  当前等级
                </label>
                <input
                  inputMode="numeric"
                  value={formState.currentLevel}
                  onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setFormState({ ...formState, currentLevel: v }) }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="0-25"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  目标等级
                </label>
                <input
                  inputMode="numeric"
                  value={formState.targetLevel}
                  onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setFormState({ ...formState, targetLevel: v }) }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="0-25"
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
                  所需经验: {CultivationCalculator.calculateCost(Math.max(0, parseInt(formState.currentLevel || '0')), Math.max(0, parseInt(formState.targetLevel || '0')), formState.mode, Math.max(0, parseInt(formState.currentExp || '0'))).experience.toLocaleString()}
                </p>
                <p className="text-[13px] text-gray-800">
                  所需金钱: {CultivationCalculator.calculateCost(Math.max(0, parseInt(formState.currentLevel || '0')), Math.max(0, parseInt(formState.targetLevel || '0')), formState.mode, Math.max(0, parseInt(formState.currentExp || '0'))).money.toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditingCultivation(null) }}>取消</Button>
              <Button size="sm" onClick={handleSave}>保存</Button>
            </div>
          </div>
        </div>
      )}

      {(() => {
        const typeCultivations = cultivations.filter(c => c.type === 'person')
        const totals = getTotalCost('person')
        return (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">{TITLE}</h4>
            {typeCultivations.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">暂无{TITLE}</p>
            ) : (
              <div className="space-y-2">
                {typeCultivations.map(cultivation => {
                  const cost = CultivationCalculator.calculateCost(cultivation.current_level, cultivation.target_level, cultivation.mode, cultivation.current_exp)
                  return (
                    <div key={cultivation.id} className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">当前: </span>
                            <span className="font-medium">{cultivation.current_level}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">目标: </span>
                            <span className="font-medium text-blue-600">{cultivation.target_level}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">经验: </span>
                            <span className="font-medium text-orange-600">{cost.experience.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">金钱: </span>
                            <span className="font-medium text-green-600">{cost.money.toLocaleString()}</span>
                          </div>
                          <div className="col-span-4 text-xs text-gray-500">
                            {(() => {
                              const name = cultivation.name && cultivation.name.trim().length > 0
                                ? cultivation.name
                                : (cultivation.mode === '2w' ? '防御修炼' : '攻击修炼')
                              return `${name} · 当前经验 ${cultivation.current_exp}`
                            })()}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(cultivation)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(cultivation.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {typeCultivations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 text-sm">
                    <span className="text-yellow-900 font-medium">总计: </span>
                    <span className="text-orange-700">经验 {totals.experience.toLocaleString()} / </span>
                    <span className="text-green-700">金钱 {totals.money.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      <Dialog
        open={confirmDeleteId !== null}
        title="删除确认"
        description="确定要删除这个修炼吗？该操作不可撤销。"
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

