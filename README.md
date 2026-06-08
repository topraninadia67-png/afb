# AI 艺术创作 · 内部培训手册

一个**单文件 HTML** 的内部培训网页，讲解如何使用各大 AI 模型从事艺术创作，涵盖：

- 🧠 **推理 / 文本模型**（GPT-5、Claude Opus、Gemini、DeepSeek 等）—— 负责创意构思、剧本分镜、提示词工程
- 🖼️ **图像生成模型**（Midjourney、Flux、Nano Banana、Stable Diffusion、Ideogram 等）
- 🎬 **视频生成模型**（Sora、Veo、Runway、Kling、Luma 等）
- 🤖 **Agent 与自动化**（对话式 Agent、ComfyUI 工作流、任务 Agent、API 流水线）

并提供：标准五阶段创作流程、提示词工程方法、选型速查表、实战案例、版权与合规规范。

## 使用方式

直接用浏览器打开 `index.html` 即可阅读，无需任何构建或依赖。

```
双击 index.html  →  浏览器中打开
```

支持深色 / 浅色主题切换、移动端响应式、侧边栏导航高亮。

## 📲 手机 App（PWA）

本手册已封装为 **PWA（渐进式 Web 应用）**，可像原生 app 一样安装到手机主屏、全屏运行并离线使用。

**安装步骤：**

1. 把整个目录部署到任意支持 **HTTPS** 的静态托管（GitHub Pages、Netlify、Vercel、Cloudflare Pages 等）。
2. 用手机浏览器打开页面：
   - **Android / Chrome**：点击右上角「📲 安装到主屏」按钮，或浏览器菜单 →「安装应用 / 添加到主屏幕」。
   - **iOS / Safari**：点击底部「分享」→「添加到主屏幕」。
3. 之后从主屏图标启动，即为全屏 app 体验，断网也能正常查看。

> ⚠️ 注意：PWA 的安装与离线功能依赖 Service Worker，**必须通过 `http(s)://` 访问**（线上托管或 `localhost`）。直接双击 `file://` 打开仅能阅读，无法安装/离线。

**本地预览 app 效果：**

```bash
# 在项目根目录运行任意静态服务器
python3 -m http.server 8000
# 然后浏览器打开 http://localhost:8000
```

**PWA 相关文件：**

| 文件 | 作用 |
|------|------|
| `manifest.webmanifest` | App 名称、图标、主题色、启动方式 |
| `sw.js` | Service Worker，负责离线缓存 |
| `icons/` | App 图标（192 / 512 / 180） |
| `tools/gen_icons.py` | 图标生成脚本（纯 Python，无依赖）|

## 维护提示

AI 模型迭代极快，文中具体模型名称与排名以 **2026 年初**为基准。
方法论（流程、提示词工程、选型思路）长青，具体模型信息请定期更新。
