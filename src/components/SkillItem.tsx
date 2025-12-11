import SkillCalculator from '../utils/skillCalculator'

interface Skill {
  id: number
  account_id: number
  skill_name: string
  current_level: number
  target_level: number
}

interface Props {
  skill: Skill
  onEdit: () => void
  onDelete: () => void
  isMaster?: boolean
}

export default function SkillItem({ skill, onEdit, onDelete, isMaster }: Props) {
  const cost = isMaster
    ? SkillCalculator.calculateMasterCost(skill.current_level, skill.target_level)
    : SkillCalculator.calculateAssistCost(skill.current_level, skill.target_level)

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-2">{skill.skill_name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">当前等级: </span>
              <span className="font-medium">{skill.current_level}</span>
            </div>
            <div>
              <span className="text-gray-600">目标等级: </span>
              <span className="font-medium text-blue-600">{skill.target_level}</span>
            </div>
            <div>
              <span className="text-gray-600">所需经验: </span>
              <span className="font-medium text-orange-600">{cost.experience.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">所需金钱: </span>
              <span className="font-medium text-green-600">{cost.money.toLocaleString()}</span>
            </div>
            {!isMaster && (
              <div className="col-span-2">
                <span className="text-gray-600">所需帮贡: </span>
                <span className="font-medium">{(cost as any).gang?.toLocaleString?.() ?? (cost as any).gang}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            编辑
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

