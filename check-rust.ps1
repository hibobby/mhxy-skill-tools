Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rust 安装检查工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 rustc
Write-Host "检查 rustc..." -ForegroundColor Yellow
try {
    $rustcVersion = rustc --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ rustc 已安装: $rustcVersion" -ForegroundColor Green
    } else {
        throw "rustc 命令失败"
    }
} catch {
    Write-Host "✗ rustc 未找到或未正确安装" -ForegroundColor Red
    Write-Host "  请访问 https://rustup.rs/ 安装 Rust" -ForegroundColor Yellow
    $rustcOk = $false
}

Write-Host ""

# 检查 cargo
Write-Host "检查 cargo..." -ForegroundColor Yellow
try {
    $cargoVersion = cargo --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ cargo 已安装: $cargoVersion" -ForegroundColor Green
        $cargoOk = $true
    } else {
        throw "cargo 命令失败"
    }
} catch {
    Write-Host "✗ cargo 未找到或未正确安装" -ForegroundColor Red
    Write-Host "  cargo 是 Rust 的包管理器，必须安装" -ForegroundColor Yellow
    $cargoOk = $false
}

Write-Host ""

# 检查 rustup
Write-Host "检查 rustup..." -ForegroundColor Yellow
try {
    $rustupVersion = rustup --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ rustup 已安装: $rustupVersion" -ForegroundColor Green
    } else {
        throw "rustup 命令失败"
    }
} catch {
    Write-Host "✗ rustup 未找到" -ForegroundColor Red
}

Write-Host ""

# 检查 PATH
$cargoBinPath = "$env:USERPROFILE\.cargo\bin"
Write-Host "检查 PATH 环境变量..." -ForegroundColor Yellow
if ($env:PATH -like "*$cargoBinPath*") {
    Write-Host "✓ Cargo bin 目录已在 PATH 中" -ForegroundColor Green
    Write-Host "  路径: $cargoBinPath" -ForegroundColor Gray
} else {
    Write-Host "✗ Cargo bin 目录不在 PATH 中" -ForegroundColor Red
    Write-Host "  需要添加: $cargoBinPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  添加方法:" -ForegroundColor Cyan
    Write-Host "  1. 按 Win+R，输入 sysdm.cpl" -ForegroundColor White
    Write-Host "  2. 点击'高级' -> '环境变量'" -ForegroundColor White
    Write-Host "  3. 编辑 Path 变量，添加上面的路径" -ForegroundColor White
    Write-Host "  4. 重启所有终端窗口" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($cargoOk) {
    Write-Host "✓ Rust 工具链已正确安装！" -ForegroundColor Green
    Write-Host "  可以运行: npm run tauri dev" -ForegroundColor Cyan
} else {
    Write-Host "✗ 请先安装 Rust 工具链" -ForegroundColor Red
    Write-Host "  访问: https://rustup.rs/" -ForegroundColor Yellow
    Write-Host "  或查看: 安装Rust.md" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

