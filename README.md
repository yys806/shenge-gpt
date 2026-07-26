# The Nexus Terminal

一个赛博朋克风格的纯静态前端工具面板（原生 HTML / CSS / JavaScript，无构建步骤、无框架依赖）。界面语言为简体中文，视觉风格为黑底 + 霓虹青/紫的黑客终端。

## 功能概览

### 挥发记忆池（Volatile Memory Pool）
- 输入文本后按 Enter（或点击"写入"）保存，数据持久化到 `localStorage`
- 左键点击复制到系统剪贴板，右键或 X 按钮删除并带"碎裂"动画
- 自动识别 URL / 代码片段并打上标记、区分边框色
- QR 按钮可为数据块生成二维码用于跨设备同步（见下方"隐私说明"）

### 密码信道（Cipher Channel）
- INJECT：上传图片 + 输入文本 → 通过 LSB（最低有效位）隐写写入并导出 PNG
- EXTRACT：上传已注入图片 → 自动解析隐藏文本并以打字机效果展示
- 支持容量校验，文本超出图像容量会提示错误
- 导出固定为 PNG 以避免有损压缩破坏隐藏信息

### 数据转译（Transmute）
- 输入任意文本，实时输出十六进制 / 二进制 / Base64 三种编码

### 神经上行（Neural Uplink / AI 对话）
- 面板内直接与 OpenAI 兼容接口（如 OpenAI、DeepSeek）对话
- 右上角 ? 按钮打开设置：API Endpoint、API Key、Model 均保存在本机 `localStorage`，不会上传到本项目任何服务器
- 关键词指令（status / time / clear memory / silence / red / blue / sentry on|off 等）本地直接执行，其余输入转发给所配置的 AI 接口
- 保留最近 8 条对话作为上下文

### 语音（Voice）
- 语音合成：系统事件与 AI 回复通过浏览器 SpeechSynthesis 朗读（优先英文男声）
- 语音识别：MIC 按钮启动浏览器 SpeechRecognition（英文），识别结果按上述指令/AI 流程处理
- 中央"弧反应堆"动画随聆听 / 思考 / 朗读状态变化

### HUD 面板
- SYSTEMS：电池电量与充电状态（Battery API）、CPU 核心数
- ENV SENSORS：基于浏览器地理定位调用 Open-Meteo 获取气温 / 风速，并显示坐标
- NET GHOST PROBE：通过 ipify 显示公网 IP；延迟数值为本地模拟的装饰效果

### 哨兵模式（Sentry）
- SENTRY 按钮调用摄像头，将画面作为全屏背景并叠加瞄准十字线
- 再次点击关闭并释放摄像头

### 其他
- 作战协议（Battle Protocols）：一键批量打开预设网址分组（需允许弹窗）
- 声波可视化（Sonic Visualizer）：底部频谱条，音频开启时显示真实频谱，否则显示模拟波形
- Konami 秘技（↑↑↓↓←→←→BA）：触发系统 Override 彩蛋

## 项目结构

```
.
├── index.html          页面结构与全部 DOM 容器
├── logo.jpg            站点图标
├── styles/
│   └── main.css        全部样式（含响应式与动画）
└── scripts/            按功能拆分的脚本，按依赖顺序加载
    ├── core.js         常量、DOM 引用、共享状态、工具函数（toast 等）
    ├── voice.js        语音合成 / 语音识别、弧反应堆状态
    ├── audio.js        WebAudio 环境音、音效、频谱可视化
    ├── clipboard.js    记忆池增删改查、剪贴板复制、QR 弹窗
    ├── cipher.js       LSB 隐写注入 / 提取、数据转译
    ├── hud.js          电池 / CPU / 天气 / IP / 哨兵摄像头 / 十字线
    ├── ai.js           AI 设置、对话请求、本地关键词指令、主题切换
    ├── protocols.js    作战协议批量开窗
    ├── konami.js       Konami 秘技彩蛋
    └── init.js         启动入口：初始化各模块并绑定全局事件
```

脚本之间通过全局作用域共享（均以 `defer` 按序加载），`init.js` 必须最后加载。

## 使用方式

1. 直接双击打开 `index.html`，或用任意本地静态服务器（如 `npx serve`）打开
2. 部分能力依赖浏览器权限或安全上下文：
   - 剪贴板 API、摄像头、地理定位、语音识别在 `https://` 或 `localhost` 下体验最佳
   - 作战协议需要允许本站弹窗
3. 使用 AI 对话前，点击右上角 ? 配置端点与密钥

## 隐私说明

本项目无后端，但以下功能会与第三方服务通信：

| 功能 | 第三方 | 发送内容 |
| --- | --- | --- |
| QR 同步 | api.qrserver.com | 所选数据块文本（发送前有确认弹窗） |
| 天气 HUD | api.open-meteo.com | 浏览器定位得到的经纬度 |
| IP 显示 | api.ipify.org | 常规 HTTP 请求（获取公网 IP） |
| AI 对话 | 你自行配置的端点 | 对话内容与 API Key |

API Key 仅保存在本机 `localStorage`；请勿在公用设备上保存密钥。隐写、转译、记忆池本身均为纯本地运算。
