# 梦幻西游账号管理工具

这是一个使用 Tauri + React + SQLite 开发的梦幻西游账号管理桌面应用程序。

## 功能特性

### 核心功能
- ✅ **账号管理**：添加、编辑、删除账号，支持记录账号名称、门派、等级、经验和余额
- ✅ **门派选择**：支持18个门派的师门技能选择
- ✅ **师门技能管理**：记录当前等级和目标等级，自动计算所需经验和梦幻币
- ✅ **辅助技能管理**：支持自定义添加任意辅助技能，自动计算消耗
- ✅ **修炼管理**：
  - 人物修炼和宝宝修炼
  - 支持2万/3万模式选择
  - 支持等级和经验值两种更新方式
  - 自动计算修炼经验和金钱消耗

### 高级功能
- ✅ **批量更新技能**：在"更新技能"标签页中批量更新多个技能等级，自动计算总消耗
- ✅ **消耗记录**：记录每次技能更新的梦幻币消耗，自动扣除账号余额
- ✅ **变更日志**：详细记录所有技能和修炼的变更历史，包括：
  - 变更日期和类型
  - 等级/经验变化（从/到）
  - 消耗的经验、金钱、帮贡、修炼经验
- ✅ **统计功能**：按日期范围查看账号的消耗记录，支持自定义时间区间
- ✅ **经验计算**：自动计算所有技能和修炼的总经验/金钱/帮贡/修炼经验消耗
- ✅ **余额管理**：账号余额自动跟踪，记录消耗时自动扣除

## 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS
- **后端**: Tauri 2.0
- **数据库**: SQLite

## 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 确保已安装 Rust
# 如果未安装，请访问 https://rustup.rs/
```

## 开发运行

```bash
# 启动开发服务器（仅前端，浏览器模式）
npm run dev

# 启动 Tauri 开发模式（桌面应用）
npm run tauri dev
```

### 开发说明

- **前端开发**：使用 `npm run dev` 启动 Vite 开发服务器，支持热重载
- **桌面应用开发**：使用 `npm run tauri dev` 启动 Tauri 应用，会自动编译 Rust 代码
- **数据库**：首次运行时会自动创建 SQLite 数据库文件（`mhxy.db`）
- **数据迁移**：数据库结构变更时会自动执行迁移脚本

## 打包与发布

```bash
# 构建前端
npm run build
# 打包桌面应用（生成安装包）
npm run tauri build
```

- 产物位置：`src-tauri/target/release/bundle/msi/`（Windows 安装包），`src-tauri/target/release/`（可执行）
- 发布与更新细节见 `发布与更新.md`（版本号、覆盖安装、数据保留）

## 项目结构

```text
mhxy/
├── src/                          # React 前端代码
│   ├── components/               # React 组件
│   │   ├── AccountList.tsx       # 账号列表
│   │   ├── AccountForm.tsx       # 账号表单
│   │   ├── AccountDetail.tsx     # 账号详情（标签页容器）
│   │   ├── AccountStatsTab.tsx   # 统计标签页
│   │   ├── AccountLogTab.tsx     # 日志标签页
│   │   ├── SkillManager.tsx      # 技能管理
│   │   ├── SkillItem.tsx         # 技能项
│   │   ├── CultivationManager.tsx # 修炼管理
│   │   ├── UpdateAccountTab.tsx  # 更新技能标签页
│   │   ├── UpdateTab.tsx         # 全局更新标签页
│   │   └── ui/                   # UI 组件库
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       └── toast.tsx
│   ├── services/                 # 数据库服务层
│   │   ├── accountService.ts     # 账号服务
│   │   ├── skillService.ts       # 技能服务
│   │   ├── cultivationService.ts # 修炼服务
│   │   ├── spendService.ts       # 消耗记录服务
│   │   └── changeLogService.ts   # 变更日志服务
│   ├── lib/                      # 工具库
│   │   └── db.ts                 # 数据库初始化
│   ├── data/                     # 静态数据
│   │   ├── schools.ts            # 门派数据
│   │   ├── skillCosts.ts         # 技能消耗数据
│   │   ├── assistSkillCosts.ts   # 辅助技能消耗数据
│   │   └── cultivationCosts.ts   # 修炼消耗数据
│   ├── utils/                    # 工具函数
│   │   ├── skillCalculator.ts    # 技能计算器
│   │   └── cultivationCalculator.ts # 修炼计算器
│   ├── App.tsx                   # 主应用组件
│   └── main.tsx                  # 入口文件
├── src-tauri/                    # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs               # Rust 主文件（Tauri 命令定义）
│   │   └── state.rs              # 数据库状态管理
│   ├── Cargo.toml                # Rust 依赖配置
│   └── tauri.conf.json           # Tauri 配置
└── package.json                   # Node.js 依赖配置
```

## 数据库结构

### accounts 表
- `id`: 主键
- `name`: 账号名称
- `school`: 门派
- `level`: 等级
- `experience`: 经验
- `gold`: 账号余额（梦幻币）

### master_skills 表
- `id`: 主键
- `account_id`: 账号ID（外键）
- `skill_name`: 技能名称
- `current_level`: 当前等级
- `target_level`: 目标等级

### assist_skills 表
- `id`: 主键
- `account_id`: 账号ID（外键）
- `skill_name`: 技能名称
- `current_level`: 当前等级
- `target_level`: 目标等级

### cultivations 表
- `id`: 主键
- `account_id`: 账号ID（外键）
- `name`: 修炼名称（如"防御修炼"、"攻击修炼"）
- `type`: 修炼类型（person/pet）
- `mode`: 修炼模式（'2w' 或 '3w'，表示2万/3万模式）
- `current_exp`: 当前经验值
- `current_level`: 当前等级
- `target_level`: 目标等级

### spend_logs 表（消耗记录）
- `id`: 主键
- `account_id`: 账号ID（外键）
- `amount`: 消耗金额（梦幻币）
- `date`: 日期
- `note`: 备注
- `created_at`: 创建时间

### change_logs 表（变更日志）
- `id`: 主键
- `account_id`: 账号ID（外键）
- `category`: 变更类型（master/assist/cultivation）
- `name`: 技能/修炼名称
- `from_level`: 原等级
- `to_level`: 新等级
- `from_exp`: 原经验值
- `to_exp`: 新经验值
- `consumed_exp`: 消耗的经验
- `consumed_money`: 消耗的金钱
- `consumed_gang`: 消耗的帮贡
- `consumed_cultivation_exp`: 消耗的修炼经验
- `date`: 变更日期
- `created_at`: 创建时间

## 支持的门派

1. 大唐官府
2. 龙宫
3. 普陀山
4. 化生寺
5. 盘丝岭
6. 魔王寨
7. 狮驼岭
8. 女儿村
9. 方寸山
10. 阴曹地府
11. 天宫
12. 五庄观
13. 凌波城
14. 无底洞
15. 神木林
16. 天机城
17. 东海渊
18. 九黎城

每个门派都有独特的师门技能，添加账号时会自动显示对应的技能列表。师门技能数据定义在 `src/data/schools.ts` 中。

## 开发相关

### 技术栈详情

- **前端框架**：React 18.3.1 + TypeScript 5.6.2
- **构建工具**：Vite 5.4.10
- **样式框架**：TailwindCSS 3.4.15
- **路由**：React Router DOM 6.26.2
- **桌面框架**：Tauri 2.0
- **数据库**：SQLite（通过 Tauri SQL 插件）
- **后端语言**：Rust

### 核心服务

- **accountService.ts**：账号的增删改查
- **skillService.ts**：师门技能和辅助技能的管理
- **cultivationService.ts**：修炼的管理
- **spendService.ts**：消耗记录的增删改查和统计
- **changeLogService.ts**：变更日志的增删改查

### 计算器工具

- **skillCalculator.ts**：技能经验、金钱、帮贡计算
- **cultivationCalculator.ts**：修炼经验、金钱计算

### 数据文件

- **schools.ts**：18个门派及其师门技能定义
- **skillCosts.ts**：师门技能消耗数据
- **assistSkillCosts.ts**：辅助技能消耗数据
- **cultivationCosts.ts**：修炼消耗数据

### Rust 后端

- **main.rs**：定义所有 Tauri 命令（invoke 调用）
- **state.rs**：数据库连接、表结构、CRUD 操作

### 开发命令

```bash
# 安装依赖
npm install

# 前端开发（浏览器）
npm run dev

# Tauri 开发（桌面应用）
npm run tauri dev

# 构建前端
npm run build

# 打包桌面应用
npm run tauri build
```

### 发布与更新
- 发布/覆盖安装：当前未启用自动更新，分发新的 `.msi` 安装包即可覆盖安装；请在 `src-tauri/tauri.conf.json` 调整 `"version"` 后再打包
- 数据存储路径（发布模式）：
  - Windows: `%APPDATA%\mhxy\mhxy.db`
  - macOS: `~/Library/Application Support/mhxy/mhxy.db`
  - Linux: `~/.local/share/mhxy/mhxy.db`
- 覆盖安装不会删除上述数据文件，仍建议发布前提示用户备份 `mhxy.db`
- 详情见 `发布与更新.md`

### 数据库操作

所有数据库操作通过 Tauri 命令（invoke）调用 Rust 后端：
- 前端调用 `invoke('command_name', params)`
- Rust 后端在 `main.rs` 中定义命令处理函数
- 实际数据库操作在 `state.rs` 中实现

### 注意事项

1. **数据库文件位置**：`mhxy.db` 位于项目根目录（开发环境）或应用数据目录（生产环境）
2. **数据迁移**：数据库结构变更时，`state.rs` 中的迁移脚本会自动执行
3. **余额管理**：记录消耗时会自动扣除账号余额，确保数据一致性
4. **变更日志**：所有技能和修炼的更新都会自动记录到变更日志

## 功能详解

### 经验计算

应用会自动计算：
- **师门技能**：从当前等级到目标等级的经验和梦幻币消耗
- **辅助技能**：从当前等级到目标等级的经验、梦幻币和帮贡消耗
- **修炼**：
  - 支持按等级更新：从当前等级到目标等级的修炼经验和金钱消耗
  - 支持按经验更新：根据经验值增量计算金钱消耗（2万/3万模式）
  - 自动识别修炼类型（人物/宝宝）和模式（2万/3万）
- **总计统计**：每个账号的所有技能和修炼的总消耗（经验、金钱、帮贡、修炼经验）

### 更新技能功能

在账号详情的"更新技能"标签页中：
1. 批量更新多个师门技能、辅助技能和修炼的等级
2. 实时显示预计消耗的金钱总额
3. 点击"应用更新并记录"后：
   - 自动更新所有技能等级
   - 计算总消耗并记录到消耗日志
   - 自动扣除账号余额
   - 生成详细的变更日志

### 统计功能

在账号详情的"统计"标签页中：
- 按日期范围查看消耗记录
- 默认显示当月数据
- 支持自定义起始和结束日期
- 显示每次消耗的日期、备注和金额

### 日志功能

在账号详情的"日志"标签页中：
- 查看所有技能和修炼的变更历史
- 显示变更类型、名称、等级/经验变化
- 显示消耗的经验、金钱、帮贡、修炼经验
- 按时间倒序排列，方便追踪最新变更

### 消耗记录

- 每次更新技能时自动记录消耗
- 支持手动记录消耗（在"更新技能"标签页）
- 记录消耗时自动扣除账号余额
- 支持添加备注说明

## 许可证

MIT
