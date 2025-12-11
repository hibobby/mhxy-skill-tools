# Rust 安装指南

## 问题说明
错误信息：`failed to run command cargo metadata` 表示 Rust 工具链未正确安装或未添加到系统 PATH。

## Windows 安装步骤

### 方法一：使用安装程序（推荐）

1. **下载 Rust 安装程序**
   - 访问：https://rustup.rs/
   - 点击 "RUSTUP-INIT.EXE" 下载安装程序

2. **运行安装程序**
   ```powershell
   # 下载后双击运行，或在 PowerShell 中执行：
   Invoke-WebRequest https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
   .\rustup-init.exe
   ```

3. **安装过程**
   - 按提示按 `1` 选择默认安装（推荐）
   - 安装程序会自动配置 PATH 环境变量
   - 完成后重启终端或 PowerShell

4. **验证安装**
   ```powershell
   rustc --version
   cargo --version
   ```
   
   如果显示版本号，说明安装成功！

### 方法二：使用命令行（高级用户）

```powershell
# 在 PowerShell 中执行（需要管理员权限）
Invoke-WebRequest https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
.\rustup-init.exe -y
```

### 如果 PATH 未自动配置

有时需要手动添加到 PATH：

1. **查找 Rust 安装路径**
   ```powershell
   $env:USERPROFILE\.cargo\bin
   ```
   通常是：`C:\Users\你的用户名\.cargo\bin`

2. **添加到 PATH**
   - 按 `Win + R`，输入 `sysdm.cpl`，回车
   - 点击"高级"标签 -> "环境变量"
   - 在"用户变量"或"系统变量"中找到 `Path`
   - 点击"编辑" -> "新建" -> 添加 `C:\Users\你的用户名\.cargo\bin`
   - 确定保存
   - **重启所有终端窗口**

## 验证安装

重新打开 PowerShell 后执行：

```powershell
# 检查 Rust 编译器
rustc --version
# 应该显示类似：rustc 1.xx.x (xxxxx xxxx-xx-xx)

# 检查 Cargo 包管理器
cargo --version
# 应该显示类似：cargo 1.xx.x (xxxxx xxxx-xx-xx)

# 检查工具链
rustup show
```

## 安装完成后的步骤

1. **重启终端/IDE**
   - 关闭所有 PowerShell/CMD 窗口
   - 如果使用 VS Code 或其他 IDE，也需要重启

2. **验证项目配置**
   ```powershell
   cd D:\Lvnuo\2025\mhxy
   cargo --version
   ```

3. **运行项目**
   ```powershell
   npm run tauri dev
   ```

## 常见问题

### Q: 安装后还是找不到 cargo？
A: 
1. 检查 PATH 是否正确添加
2. 完全关闭并重新打开所有终端窗口
3. 重启计算机（最后手段）

### Q: 安装速度很慢？
A: 
- Rust 安装包较大，首次安装需要下载工具链，可能需要几分钟到十几分钟
- 建议使用稳定的网络连接

### Q: 需要安装特定版本吗？
A: 
- 不需要，使用最新稳定版即可
- Tauri 2.0 兼容 Rust 1.70+ 版本

### Q: 安装在哪里？
A: 
- Rust 安装在：`%USERPROFILE%\.cargo`
- 二进制文件在：`%USERPROFILE%\.cargo\bin`

## 快速验证脚本

创建 `check-rust.ps1` 并运行：

```powershell
Write-Host "检查 Rust 安装..." -ForegroundColor Green

# 检查 rustc
try {
    $rustcVersion = rustc --version
    Write-Host "✓ rustc: $rustcVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ rustc 未找到" -ForegroundColor Red
}

# 检查 cargo
try {
    $cargoVersion = cargo --version
    Write-Host "✓ cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ cargo 未找到" -ForegroundColor Red
}

# 检查 rustup
try {
    rustup show | Select-Object -First 1
    Write-Host "✓ rustup 正常" -ForegroundColor Green
} catch {
    Write-Host "✗ rustup 未找到" -ForegroundColor Red
}

# 检查 PATH
$cargoPath = "$env:USERPROFILE\.cargo\bin"
if ($env:PATH -like "*$cargoPath*") {
    Write-Host "✓ Cargo bin 已在 PATH 中" -ForegroundColor Green
} else {
    Write-Host "✗ Cargo bin 不在 PATH 中" -ForegroundColor Yellow
    Write-Host "  需要添加: $cargoPath" -ForegroundColor Yellow
}
```

## 安装后继续

安装完成并验证后，回到项目目录运行：

```powershell
cd D:\Lvnuo\2025\mhxy
npm run tauri dev
```

