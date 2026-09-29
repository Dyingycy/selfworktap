# 科技热点工作台 · TechRadar (iOS PWA)

专为 **iOS iPhone** 打造的个人科技资讯热点与 AI 晨报工作台。

---

## 🌟 核心特色

1. **iOS 原生质感 PWA 体验**：
   - 支持 iPhone Safari **「添加到主屏幕」**，获得原生独立 App 图标；
   - 沉浸式全屏、无浏览器地址栏、适配 iPhone 顶部灵动岛/刘海与底部横条；
   - 拟态毛玻璃（Glassmorphism）、微交互触感动效与 iOS 原生分段控制器。

2. **多维前沿科技热点覆盖**：
   - **国内科技**：少数派精选、科技快讯（IT之家/36氪）、V2EX 热门探讨、掘金技术榜；
   - **全球极客**：Hacker News 榜单；
   - **抖音实时热搜**：实时抓取抖音热搜 Top 50，并自动识别筛选出 **AI、数码新品、新能源、智驾** 等科技类爆款话题。

3. **Google Gemini 3.8 Flash 强力驱动**：
   - **今日科技早报**：每天自动将全网海量资讯提炼为「今日科技风向标」、「三大焦点事实与深远影响」及「趋势关键词」；
   - **卡片深度追问**：点击任意新闻或抖音热点，可随时向 Gemini 追问（大白话通俗解释、行业影响、事实拆解）；
   - **密钥免重启设置**：支持在工作台「设置」界面直接输入或修改 Gemini API Key，密钥仅保存在本地设备，安全隐私。

4. **一键格式化分享**：
   - 支持一键复制格式优雅的整篇早报或单条资讯卡片，方便随时转发至微信好友、群聊或朋友圈。

5. **离线快照秒开**：
   - 本地自动缓存当天资讯快照，即便在地铁弱网或飞行模式下也能 0ms 瞬间打开阅读。

---

## 🚀 启动与使用指南

### 1. 本地启动（同一局域网内 iPhone 访问）

在电脑终端中执行：
```bash
# 启动开发服务器（已监听 0.0.0.0）
npm run dev
```

查看电脑的局域网 IP（例如 `192.168.1.100`）：
```powershell
ipconfig
```

确保手机与电脑连入同一个 Wi-Fi，在 iPhone 的 **Safari 浏览器** 中访问：
`http://192.168.1.100:3000`

---

### 2. 📱 添加到 iPhone 桌面（PWA 独立安装）

1. 用 iPhone 自带的 **Safari 浏览器** 打开工作台网址；
2. 点击 Safari 底部正中间的 **「分享」** 图标（方框带向上箭头）；
3. 向上滑动选项，点击 **「添加到主屏幕」**；
4. 点击右上角 **「添加」** 按钮；
5. 回到 iPhone 桌面，轻点图标即可进入独立全屏 App！

---

### 3. ☁️ 免费一键部署到 Vercel（推荐，手机随时随地畅读）

如果你希望关掉电脑后，手机依然能在任何地方访问工作台：

1. 将当前项目推送到你个人的 GitHub 仓库：
   ```bash
   git init
   git add .
   git commit -m "feat: init tech workbench pwa"
   git branch -M main
   # 添加你的 GitHub remote 并 push
   ```
2. 登录 [Vercel](https://vercel.com)，点击 **Add New Project**，导入该 GitHub 仓库；
3. 在 Environment Variables 中添加：
   - `GEMINI_API_KEY`: 你的 Google Gemini API Key（选填，也可在网页设置中输入）
4. 点击 **Deploy**，大约 1 分钟后即可获得专属公网 HTTPS 域名（例如 `https://my-tech-radar.vercel.app`）；
5. 用 iPhone Safari 打开该域名，添加到主屏幕即可随时随地使用！

---

## 🛠 技术架构

- **前端框架**：Next.js 14 (App Router) + TypeScript + React 18
- **UI & 样式**：Tailwind CSS + Lucide Icons + iOS Glassmorphic Design System
- **大模型引擎**：`@google/genai` (Google Gemini 3.8 Flash / Gemini Flash Latest)
- **数据源采集**：RSS Parser + Native JSON Feeds + Douyin Web API
