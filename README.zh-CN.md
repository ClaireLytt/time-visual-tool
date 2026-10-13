# IeltsVisual

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Demo-在线体验-blue)](https://ielts-visual.vercel.app)

一个简洁的雅思备考记录工具，内置数据分析、间隔重复复习和 AI 周报。

![screenshot](.github/screenshot.png)

## ✨ 功能

- 📝 **练习记录** — 记录听力、阅读、写作、口语练习，含分数、用时、错因标签
- 📊 **数据分析** — 错因分布柱状图、分数趋势折线图、科目雷达图、题型分布
- 🧠 **SM-2 间隔重复** — 错题和词汇按自适应日程复习（忘记→1天，困难→3天，简单→7天）
- 📖 **词汇系统** — 收集生词（含音标、例句），翻卡复习，预置 100 个雅思学术高频词
- 📅 **周报** — 自动生成学习复盘（学时环比、TOP错因、进步点），支持 AI 生成
- 📋 **JSON 导入** — 粘贴 AI 整理的学习记录 JSON，校验、去重、选择性导入
- 🔍 **知识库** — 浏览、筛选、编辑所有错题和表达，支持内联展开编辑
- ⏱ **练习计时** — 内置秒表，计时结束自动回填时长到记录表单
- 📱 **PWA** — 可安装到桌面/手机，离线可用

## 🚀 快速开始

**在线体验：** [https://ielts-visual.vercel.app](https://ielts-visual.vercel.app)

**本地开发：**

```bash
git clone https://github.com/ClaireLytt/time-visual-tool.git
cd time-visual-tool
npm install
npm run dev
```

**启用 AI 周报（可选）：**

在浏览器控制台输入：
```js
localStorage.setItem('ielts-ai-api-key', 'sk-你的OpenAI密钥')
```

## 📱 安装为 App

1. 用 Chrome / Edge / Safari 打开应用
2. 点击地址栏的"安装"（手机上点"添加到主屏幕"）
3. 首次加载后即可离线使用

## 🗺️ 计划

- [ ] 周报导出为 PDF
- [ ] 阅读练习模块（内置计时+题型）
- [ ] 多设备同步

## 🤝 参与贡献

欢迎提交 PR。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📄 许可

[MIT](LICENSE)
