# 本地渲染

以下命令使用 PowerShell，并从仓库根目录运行。macOS 或 Linux 可将 `blender` 换成对应可执行文件路径。Windows 是本次验证使用的平台。Blender 脚本使用 Blender 自带的 Python，独立安装 Python 不是出帧的前置步骤。

## 放置字体

打开站酷素材页，点击「立即下载」。解压后将 `站酷高端黑.ttf` 原样放进 `studio/public/fonts/`，随包使用声明可与原下载包一起保存在本地。 [站酷高端黑官方下载](https://www.zcool.com.cn/assets/ZNTY0OA%3D%3D)

思源黑体 CN Bold（`SourceHanSansCN-Bold.otf`）和 Bebas Neue Regular（`BebasNeue.ttf`）已在同一目录，可直接使用。 [字体来源与许可](ASSETS.md)

放好后打开 Studio 或运行导出命令。若 Studio 已打开，请刷新页面。Remotion 直接读取字体文件，无需安装系统字体。站酷高端黑由 Git 忽略，主片会提示缺少的文件路径。

## 先跑代表帧

```powershell
blender -b --factory-startup --python-exit-code 1 --python blender/plates.py -- --sample
```

这会按正式画幅生成每个通道的代表帧。要先检查某台机位，可加 `--camera 01_B`，或重复 `--camera` 选择多台机位。代表帧可用于检查环境，预览其它帧时，相应三维层需要完整序列。若 Studio 已打开，渲染后刷新页面让它重新读取素材。

## 生成完整序列

```powershell
blender -b --factory-startup --python-exit-code 1 --python blender/plates.py
```

[通道清单](../studio/src/blender-plates.json)同时供 Blender 和 Remotion 读取，列出主片使用的 4,798 张透明 PNG。输出以机位和通道分目录，从 `0001.png` 起。片尾海报为 2880 × 1620，其余为 1920 × 1080。为渲染及中间输出预留至少 10 GiB 磁盘空间。

- **S08** 用 `BL-02_A` 生成打开右侧入口的单帧背景 `bg_s08`。
- **S12／S40** 用 `BL-04_A-production.blend` 生成沙发底层，再由 Remotion 合成扶手前沿。便于直接编辑的修正版保存在 `BL-04_A.blend`。
- **S13／S14** 用 BL-05 A、A2 生成 `wallfix`，另输出移除红楔和裂纹的 `wallonly`。
- **S24** 用已保存的正式 B4 机位生成 `production-b4`。
- **S27** 用已保存黄铜材质、灯光和末尾光学推近的 `BL-10_A-production.blend` 生成 `production-brass`。
- **S41／S42** 用 `BL-01_Poster.blend` 生成独立高分辨率海报底层。

脚本默认用 CPU 渲染 Cycles。可在具备对应设备的 Blender 上用 `--device OPTIX`、`--device CUDA` 或 `--device HIP` 试跑。不同设备可能有像素差异。可用 `--threads 4` 调整 Blender 线程数。

同一套输入中断后可重跑原命令，已写完的 PNG 会复用。更换模型、脚本、Blender 版本或渲染设备时，把旧的生成目录移开后重跑。异常终止后若提示已有渲染锁，先确认 Blender 已退出，再移除 `studio/public/blender/.render-lock`。

核对所有通道的编号、尺寸、RGBA 标记及 PNG 结尾。

```powershell
blender -b --factory-startup --python-exit-code 1 --python blender/plates.py -- --verify
```

如果要用 `BlenderReview` 单独浏览各场景，额外生成机位预览。

```powershell
blender -b --factory-startup --python-exit-code 1 --python blender/plates.py -- --previews
```

## 打开或导出主片

```powershell
cd studio
npm ci
npm run studio
```

若 Windows 上的 npm 安装脚本无法从中文路径找到 Node，可换用不含中文字符的 Node 安装目录，或在 PowerShell 7 中运行 `npm.cmd ci --script-shell "$((Get-Command pwsh).Source)"`。同样可以用 Node 直接启动 Studio。

```powershell
node ./node_modules/@remotion/cli/remotion-cli.js studio src/index.tsx
```

完整序列就绪后，在 `studio/` 目录用 Remotion CLI 导出。

```powershell
New-Item -ItemType Directory -Force ../renders | Out-Null
npx remotion render src/index.tsx LifeVictoryMV ../renders/life-victory.mp4
```

Remotion 会读取 `public/audio/人生最大的胜利.mp3`。与成片一致的节拍和歌词位置依赖这条音轨。生成的 PNG 与 MP4 均由 Git 忽略。

## 公开版验证记录

在 Windows 上从独立目录运行 `npm ci`，并打开 29 个 Blender 模型检查资源引用。模型没有未打包的外部图片、字体或链接库。36 个通道各生成代表帧，另完整重建 S05 门动画的 36 帧。合计 74 张独立 PNG 与原工程同帧的 RGBA 像素一致。

Remotion 加载了 1920 × 1080、30 fps、5,146 帧的主合成。42 镜首帧和 4 张追加样帧成功渲染。S05 的 25 帧带原曲试片通过 H.264／AAC 解码。全片 4,798 张 Blender 中间帧和完整 MP4 留给使用者按上述流程生成。
