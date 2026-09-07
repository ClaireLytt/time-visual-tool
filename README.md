# TimeVisual

可视化你的每一天 — 一个开源的个人生活记录与可视化工具。

[English](./README_EN.md)

**在线体验：** <https://clairelytt.github.io/time-visual-tool/>

---

## 功能概览

### 时间管理 (TimeVisual)
- 添加时间记录（活动名称、时长、权重、分类）
- 每日/周/月/年时间占比环形图可视化
- 自动计算时间总和与加权时长
- 自定义分类管理（颜色、名称）
- 数据导入/导出（JSON）

### 记账管理 (MoneyVisual)
- 收入/支出记录，支持表达式输入（如 `12+8-3`）
- 每日/每月收支趋势图
- 收支分类占比分析
- 自定义收支分类

### 饮食记录 (EatingVisual)
- 记录每日饮食与热量摄入
- 常见食物快速搜索与自动填入
- 每日/每月热量趋势图
- 热量分布分析

### 日记 (DiaryVisual)
- 日/周/月/年多维度日记
- 感恩记录 & 心情感受
- 目标设定与追踪
- 激励语录

### 运动记录 (SportVisual)
- 记录训练内容、时长、消耗热量
- 多种运动类型分类
- 每日/每月运动趋势图
- 周/月/年运动感想
- 年度运动回顾

### 用户系统
- 邮箱注册/登录（Firebase Auth）
- 多账号支持，每个用户只能看到自己的数据
- 记住密码功能
- 切换账号/退出登录
- 旧数据一键迁移（localStorage → 云端）

### 通用功能
- 深色模式 / 浅色模式 / 跟随系统
- 中英文双语切换（i18next）
- 响应式布局，支持移动端
- 删除确认弹窗，防止误操作
- 错误边界，防止白屏崩溃

---

## 技术栈

- **前端框架：** React 18 + TypeScript
- **构建工具：** Vite
- **样式：** Tailwind CSS
- **图表：** Recharts
- **日期处理：** date-fns
- **路由：** React Router（HashRouter）
- **国际化：** i18next + react-i18next
- **认证：** Firebase Auth
- **数据库：** Cloud Firestore（按用户隔离）
- **测试：** Vitest + Testing Library
- **代码规范：** ESLint + Prettier

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装与开发

```bash
git clone https://github.com/ClaireLytt/time-visual-tool.git
cd time-visual-tool
npm install
```

创建 `.env` 文件并填入你的 Firebase 配置：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

启动开发服务器：

```bash
npm run dev
```

### 构建

```bash
npm run build
npm run preview
```

### 测试与代码检查

```bash
npm run test
npm run lint
npm run format
```

---

## 项目结构

```
src/
├── components/
│   ├── auth/           # 登录、注册、数据迁移
│   ├── dashboard/      # 时间管理面板
│   ├── finance/        # 记账面板
│   ├── eating/         # 饮食记录面板
│   ├── diary/          # 日记面板
│   ├── sport/          # 运动记录面板
│   ├── layout/         # Header、AppShell、BottomTabBar
│   └── icons/          # SVG 图标组件
├── contexts/           # AuthContext
├── hooks/              # useFirestore、useTimeEntries 等自定义 Hook
├── i18n/               # 国际化配置与语言文件
├── utils/              # 工具函数
├── firebase.ts         # Firebase 初始化
├── App.tsx             # 路由配置
└── main.tsx            # 应用入口
```

---

## 已完成的 Issues

| Issue | 描述 |
|-------|------|
| [#1](https://github.com/ClaireLytt/time-visual-tool/issues/1) | 实现时间记录表单 |
| [#3](https://github.com/ClaireLytt/time-visual-tool/issues/3) | 更新网站链接 |
| [#5](https://github.com/ClaireLytt/time-visual-tool/issues/5) | 项目整体改进（深色模式、国际化、删除确认、错误边界等） |
| [#13](https://github.com/ClaireLytt/time-visual-tool/issues/13) | 增强记账功能 |
| [#15](https://github.com/ClaireLytt/time-visual-tool/issues/15) | 饮食记录功能 |
| [#17](https://github.com/ClaireLytt/time-visual-tool/issues/17) | 日记功能（感恩、感受、目标、激励） |
| [#19](https://github.com/ClaireLytt/time-visual-tool/issues/19) | 运动记录功能 |
| [#21](https://github.com/ClaireLytt/time-visual-tool/issues/21) | 用户账号与登录系统（进行中） |

## License

MIT
