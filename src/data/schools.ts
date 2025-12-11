export interface School {
  name: string
  masterSkills: string[]
}

export const schools: School[] = [
  {
    name: '大唐官府',
    masterSkills: [
      '为官之道',
      '嗜血',
      '横扫千军',
      '无双一击',
      '神兵鉴赏',
      '紫薇之术',
      '文韬武略'
    ]
  },
  {
    name: '龙宫',
    masterSkills: [
      '九龙诀',
      '龙附',
      '逆鳞',
      '破浪诀',
      '呼风唤雨',
      '龙腾',
      '游龙术'
    ]
  },
  {
    name: '普陀山',
    masterSkills: [
      '灵性',
      '观音咒',
      '五行扭转',
      '金刚咒',
      '佛光普照',
      '普渡众生',
      '莲花妙法'
    ]
  },
  {
    name: '化生寺',
    masterSkills: [
      '小乘佛法',
      '金刚伏魔',
      '诵经',
      '佛光普照',
      '大慈大悲',
      '歧黄之术',
      '渡世行者'
    ]
  },
  {
    name: '盘丝岭',
    masterSkills: [
      '蛛丝',
      '含情脉脉',
      '催情大法',
      '秋波暗送',
      '天外魔音',
      '盘丝大法',
      '勾魂摄魄'
    ]
  },
  {
    name: '魔王寨',
    masterSkills: [
      '火云术',
      '牛虱阵',
      '震天诀',
      '叫嚣',
      '魔王护持',
      '三昧真火',
      '牛魔王门下'
    ]
  },
  {
    name: '狮驼岭',
    masterSkills: [
      '魔兽神功',
      '生死搏',
      '训兽诀',
      '阴阳二气诀',
      '狂兽诀',
      '大鹏展翅',
      '魔神附身'
    ]
  },
  {
    name: '女儿村',
    masterSkills: [
      '毒经',
      '轻如鸿毛',
      '飘渺式',
      '情天恨海',
      '闭月羞花',
      '沉鱼落雁',
      '倾国倾城'
    ]
  },
  {
    name: '方寸山',
    masterSkills: [
      '黄庭经',
      '磬龙灭法',
      '符之术',
      '归元心法',
      '五雷咒',
      '霹雳咒',
      '神道无念'
    ]
  },
  {
    name: '阴曹地府',
    masterSkills: [
      '灵通术',
      '幽冥鬼眼',
      '冤魂不散',
      '尸气漫天',
      '拘魂诀',
      '九幽阴魂',
      '慑人鬼魅'
    ]
  },
  {
    name: '天宫',
    masterSkills: [
      '清明自在',
      '乾坤塔',
      '混天术',
      '云霄步',
      '傲世诀',
      '乾坤袖',
      '雷霆天威'
    ]
  },
  {
    name: '五庄观',
    masterSkills: [
      '周易学',
      '潇湘仙雨',
      '修仙术',
      '混元道果',
      '太乙真诀',
      '乾坤袖',
      '太极生门'
    ]
  },
  {
    name: '凌波城',
    masterSkills: [
      '天地无极',
      '聚气',
      '气吞山河',
      '战意诀',
      '势如破竹',
      '风行云阵',
      '破云诀'
    ]
  },
  {
    name: '无底洞',
    masterSkills: [
      '地冥妙法',
      '怨念诀',
      '鬼蛊灵蕴',
      '摧心术',
      '夺命咒',
      '移魂化骨',
      '暗影诀'
    ]
  },
  {
    name: '神木林',
    masterSkills: [
      '巫咒',
      '万灵诸念',
      '天人庇护',
      '驭灵咒',
      '御血术',
      '巫咒结木',
      '万物之源'
    ]
  },
  {
    name: '天机城',
    masterSkills: [
      '神工无形',
      '攻云以守',
      '匠心不移',
      '运思如泉',
      '擎天之械',
      '千机奇巧',
      '攻云以守'
    ]
  },
  {
    name: '东海渊',
    masterSkills: [
      '万物有灵',
      '逐波如意',
      '龟之象',
      '溯洄',
      '扶摇直上',
      '碧波之潮',
      '随波逐流'
    ]
  },
  {
    name: '九黎城',
    masterSkills: [
      '九黎战歌',
      '枫影二刃',
      '战魂',
      '破虚一击',
      '黎殇',
      '燃火',
      '祖巫之力'
    ]
  }
]

export namespace School {
  export function getSchoolByName(name: string): School | null {
    return schools.find(s => s.name === name) || null
  }
}

