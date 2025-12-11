@echo off
echo ====================================
echo 梦幻西游账号管理工具 - 启动脚本
echo ====================================
echo.

echo [1/3] 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js 已安装: 
node --version

echo.
echo [2/3] 检查 Rust...
where rustc >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 未找到 Rust，Tauri 功能可能无法使用
    echo 下载地址: https://rustup.rs/
    echo 按任意键继续...
    pause >nul
) else (
    echo Rust 已安装:
    rustc --version
)

echo.
echo [3/3] 检查项目依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
    echo 依赖安装完成
) else (
    echo 依赖已安装
)

echo.
echo ====================================
echo 正在启动应用...
echo ====================================
echo.

call npm run dev

pause

