import { useState } from 'react'
import { School } from '../data/schools'
import SkillManager from './SkillManager'
import CultivationManager from './CultivationManager'
import UpdateAccountTab from './UpdateAccountTab'
import { AccountStatsTab } from './AccountStatsTab'
import AccountLogTab from './AccountLogTab'

interface Props {
  accountId: number
  school: School | null
  onRefresh: () => void
}

 

export default function AccountDetail({ accountId, school, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<'master' | 'assist' | 'cultivation' | 'update' | 'stats' | 'logs'>('master')

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'master'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          师门技能
        </button>
        <button
          onClick={() => setActiveTab('assist')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'assist'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          辅助技能
        </button>
        <button
          onClick={() => setActiveTab('cultivation')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'cultivation'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          修炼
        </button>
        <button
          onClick={() => setActiveTab('update')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'update'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          更新技能
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          统计
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'logs'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          日志
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'master' && (
          <SkillManager
            accountId={accountId}
            school={school}
            type="master"
            onRefresh={onRefresh}
          />
        )}
        {activeTab === 'assist' && (
          <SkillManager
            accountId={accountId}
            school={school}
            type="assist"
            onRefresh={onRefresh}
          />
        )}
        {activeTab === 'cultivation' && (
          <CultivationManager
            accountId={accountId}
            onRefresh={onRefresh}
          />
        )}
        {activeTab === 'update' && (
          <UpdateAccountTab accountId={accountId} school={school} onUpdated={onRefresh} />
        )}
        {activeTab === 'stats' && (
          <AccountStatsTab accountId={accountId} />
        )}
        {activeTab === 'logs' && (
          <AccountLogTab accountId={accountId} />
        )}
      </div>
    </div>
  )
}

