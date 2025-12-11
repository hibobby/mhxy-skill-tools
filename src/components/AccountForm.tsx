import { useState, useEffect } from 'react'
import { School, schools } from '../data/schools'
import { addAccount, updateAccount } from '../services/accountService'
import type { Account } from '../services/accountService'

interface Props {
  account: Account | null
  onSave: () => void
  onCancel: () => void
}

export default function AccountForm({ account, onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [level, setLevel] = useState(0)
  const [experience, setExperience] = useState(0)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)

  useEffect(() => {
    if (account) {
      setName(account.name)
      setSchool(account.school)
      setLevel(account.level)
      setExperience(account.experience)
      const s = School.getSchoolByName(account.school)
      if (s) setSelectedSchool(s)
    }
  }, [account])

  useEffect(() => {
    if (school) {
      const s = School.getSchoolByName(school)
      setSelectedSchool(s)
    }
  }, [school])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (account) {
        await updateAccount(account.id, name, school, level, experience)
      } else {
        await addAccount(name, school, level, experience)
      }
      onSave()
    } catch (error) {
      console.error('保存账号失败:', error)
      alert('保存账号失败')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          账号名称
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          门派
        </label>
        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">请选择门派</option>
          {schools.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSchool && (
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">师门技能</h3>
          <div className="grid grid-cols-2 gap-2">
            {selectedSchool.masterSkills.map((skill) => (
              <div key={skill} className="text-sm text-blue-800">
                • {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            等级
          </label>
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            经验
          </label>
          <input
            type="number"
            value={experience}
            onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </form>
  )
}

