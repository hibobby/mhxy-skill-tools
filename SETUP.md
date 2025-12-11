# 快速开始指南

## 前置要求

1. **安装 Node.js** (v16+ 推荐)
   - 下载地址: https://nodejs.org/
   - 安装后验证: `node --version`

2. **安装 Rust** (需要用于 Tauri)
   - 下载地址: https://rustup.rs/
   - 安装命令: 
     ```bash
     # Windows (PowerShell)
     Invoke-WebRequest https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
     .\rustup-init.exe
     
     # 或访问上面的网址下载安装程序
     ```
   - 安装后验证: `rustc --version`

3. **安装 Git** (可选，用于版本控制)

## 安装步骤

### 1. 安装项目依赖

```bash
# 在项目根目录执行
npm install
```

这将会安装所有 Node.js 依赖包。

### 2. 创建图标目录

Tauri 需要图标文件才能正常打包。如果遇到图标缺失错误，请创建目录：

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Path "src-tauri\icons" -Force
```

**Linux/Mac:**
```bash
mkdir -p src-tauri/icons
```

## 运行应用

### 开发模式

```bash
npm run dev
```

这会启动开发服务器，在浏览器中可以看到前端界面。如果需要桌面窗口，使用：

```bash
npm run tauri dev
```

### 打包应用

```bash
npm run tauri build
```

打包后的应用会在 `src-tauri/target/release/` 目录下。

## 常见问题

### 1. Rust 安装失败
确保已正确安装 Rust 和 Cargo。可以尝试：
```bash
rustup update
```

### 2. npm install 失败
清除缓存后重试：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 3. Tauri 插件错误
确保使用的是 Tauri 2.0 版本：
```bash
npm install @tauri-apps/api@^2.0.0 @tauri-apps/plugin-sql@^2.0.0
```

### 4. 数据库连接失败
首次运行会自动创建数据库文件。如果遇到问题，检查：
- SQLite 插件是否已正确安装
- `src-tauri/tauri.conf.json` 中的配置是否正确

## 项目结构

```
mhxy/
├── src/                    # React 前端代码
│   ├── components/         # UI 组件
│   │   ├── AccountList.tsx
│   │   ├── AccountForm.tsx
│   │   ├── AccountDetail.tsx
│   │   ├── SkillManager.tsx
│   │   ├── SkillItem.tsx
│   │   └── CultivationManager.tsx
│   ├── services/           # 数据库服务
│   │   ├── accountService.ts
│   │   ├── skillService.ts
│   │   └── cultivationService.ts
│   ├── lib/                # 工具库
│   │   └── db.ts           # 数据库初始化
│   ├── data/               # 静态数据
│   │   └── schools.ts      # 门派数据
│   ├── utils/              # 工具函数
│   │   ├── skillCalculator.ts
│   │   └── cultivationCalculator.ts
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/              # Tauri 后端
│   ├── src/
│   │   └── main.rs         # Rust 主文件
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── README.md
└── SETUP.md                # 本文件
```

## 下一步

项目已经完成了所有核心功能，你可以：

1. **运行应用**: `npm run dev` 或 `npm run tauri dev`
2. **添加账号**: 点击"添加账号"按钮
3. **选择门派**: 从下拉菜单选择门派
4. **添加技能**: 在账号详情中添加师门技能、辅助技能和修炼
5. **查看统计**: 自动计算总经验和梦幻币消耗

祝使用愉快！

