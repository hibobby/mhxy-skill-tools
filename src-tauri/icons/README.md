# 图标文件说明

Tauri 应用需要以下图标文件：

- `32x32.png` - 32x32 像素 PNG 图标
- `128x128.png` - 128x128 像素 PNG 图标  
- `128x128@2x.png` - 256x256 像素 PNG 图标（高分辨率）
- `icon.icns` - macOS 图标文件
- `icon.ico` - Windows 图标文件

## 快速解决方案

### 方法一：使用 Tauri 图标生成器（推荐）

安装 Tauri 图标生成工具：

```bash
npm install -g @tauri-apps/cli
```

然后使用一个源图片生成所有图标：

```bash
cd src-tauri
tauri icon path/to/your/icon.png
```

这会将你的 PNG 图片转换为所有需要的格式和尺寸。

### 方法二：手动创建占位图标

如果只是开发测试，可以：
1. 使用在线图标生成器生成简单的图标
2. 或者暂时修改配置移除图标要求（见下方）

### 方法三：临时禁用图标（仅开发）

编辑 `tauri.conf.json`，注释掉 `bundle.icon` 部分（但打包时需要图标）

