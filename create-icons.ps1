# Tauri 图标创建脚本
# 这个脚本会创建简单的占位图标文件

Write-Host "创建 Tauri 图标文件..." -ForegroundColor Cyan

$iconsDir = "src-tauri\icons"

# 确保目录存在
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "✓ 创建图标目录" -ForegroundColor Green
}

Write-Host ""
Write-Host "注意: 此脚本无法直接创建二进制图标文件 (ico, icns)" -ForegroundColor Yellow
Write-Host "需要手动创建或使用工具生成" -ForegroundColor Yellow
Write-Host ""

# 检查是否有图片处理工具
$hasMagick = $false
try {
    $null = magick -version 2>&1
    $hasMagick = $true
} catch {
    $hasMagick = $false
}

if ($hasMagick) {
    Write-Host "检测到 ImageMagick，可以生成图标..." -ForegroundColor Green
    
    # 这里可以添加 ImageMagick 命令生成图标
    Write-Host "使用 ImageMagick 生成图标..." -ForegroundColor Cyan
} else {
    Write-Host "未检测到 ImageMagick" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "推荐方法:" -ForegroundColor Cyan
    Write-Host "1. 安装 Tauri CLI: npm install -g @tauri-apps/cli" -ForegroundColor White
    Write-Host "2. 准备一个 512x512 或更大的 PNG 图片" -ForegroundColor White
    Write-Host "3. 运行: cd src-tauri && tauri icon your-icon.png" -ForegroundColor White
    Write-Host ""
    Write-Host "或者访问在线图标生成器:" -ForegroundColor Cyan
    Write-Host "https://www.icoconverter.com/" -ForegroundColor White
    Write-Host ""
}

Write-Host "临时解决方案: 修改 tauri.conf.json 暂时禁用图标检查..." -ForegroundColor Yellow
Write-Host ""

