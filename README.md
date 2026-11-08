# 人生最大的胜利 · 构成主义 MV

[![《人生最大的胜利》构成主义 MV 封面](docs/cover.jpg)](https://www.bilibili.com/video/BV1a94s64EFz)

[在哔哩哔哩观看成片](https://www.bilibili.com/video/BV1a94s64EFz)

**42 镜 · 1920 × 1080 · 30 fps · 5,146 帧**

以构成主义海报为视觉语言的音乐动画。Blender 输出塔、布景、水花和勋章等透明通道，Remotion 把这些通道与平面人物、印刷纹理和歌词合成到同一条音乐时间线上。

| 内容 | 入口 |
| --- | --- |
| 创意、分镜和 Blender 施工方案 | [脚本分镜施工方案](docs/01_脚本分镜施工方案.md) |
| 生图和抠图 | [原始提示词](docs/02_生图与抠图提示词.md) |
| 插画、抠图、纹理、字体和原曲 | [素材目录](studio/public/) · [素材说明与署名](docs/ASSETS.md) |
| 动效代码、镜头和节拍数据 | [Remotion 源码](studio/src/) · [分镜时间线](studio/src/shots.json) |
| Blender 模型和透明通道渲染 | [模型](blender/scenes/) · [渲染脚本](blender/plates.py) · [通道清单](studio/src/blender-plates.json) |

## 本地预览

安装 Node.js 22 和 Blender 5.2 系列。本仓库验证时使用 Node.js 22.23.4 和 Blender 5.2.4 LTS Release Candidate。

预览主片或导出前，请从站酷下载标题字体并放到 `studio/public/fonts/站酷高端黑.ttf`。思源黑体 CN Bold 和 Bebas Neue Regular 随仓库提供。 [官方下载与放置说明](docs/BUILD.md#放置字体)

从仓库根目录执行以下命令。Blender 已加入 PATH 时可直接运行 `blender`。也可用 Blender 可执行文件的完整路径。

```powershell
blender -b --factory-startup --python-exit-code 1 --python blender/plates.py
cd studio
npm ci
npm run studio
```

在 Studio 中选择 **LifeVictoryMV**。Blender PNG 序列由本机写入 `studio/public/blender/`，首次全量渲染耗时取决于硬件，尤其是 S24 和 S27 的 Cycles 镜头。可先用 [抽帧命令](docs/BUILD.md#先跑代表帧) 检查环境。完整出帧、断点续跑和 MP4 导出见 [本地渲染说明](docs/BUILD.md)。

素材和第三方字体各自适用的条款见 [素材说明与署名](docs/ASSETS.md)。
