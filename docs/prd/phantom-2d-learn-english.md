# PRD：歌剧魅影 — 2D 探索游戏 · 英语学习版

> **状态**：Draft  
> **日期**：2026-10-27  
> **基础版 PRD**：`phantom-2d-full.md`（完整游戏剧情与技术实现）  
> **本文档定义**：英语学习层——一个可完整移除的模块  
> **设计原则**：删除本文档涉及的所有代码和资源后，游戏仍是完整的五幕体验

---

## 一、设计原则

### 1.1 可拆卸架构

```
PhantomGame
├── core/          ← 游戏逻辑（不变）
├── renderer-2d/   ← 渲染（不变）
├── audio/         ← 音乐（不变）
├── ui/            ← 游戏 UI（不变）
│
└── learn/         ← 【英语学习层】整个文件夹可删除
    ├── LearnProvider.tsx    # Context，控制学习功能开关
    ├── LyricSubtitle.tsx    # 歌词字幕（英+中）
    ├── VocabPopup.tsx       # 词汇弹窗
    ├── DocumentReader.tsx   # 双语文档阅读器（替代纯中文版）
    ├── QuizOverlay.tsx      # 幕间小测验
    ├── Notebook.tsx         # 生词本
    ├── LearnStats.tsx       # 学习统计
    ├── data/
    │   ├── lyrics.ts        # 5 首歌的完整歌词 + 翻译 + 注释
    │   ├── vocab.ts         # 按幕分组的词汇表
    │   ├── documents.ts     # 收集品的英文原文 + 翻译
    │   └── quizzes.ts       # 测验题库
    └── hooks/
        └── useLearnMode.ts  # 学习模式状态 hook
```

**关键**：`learn/` 文件夹通过 `LearnProvider` 注入游戏。游戏的其他模块**永远不 import learn/ 里的任何东西**。而是：

```tsx
// PhantomGame.tsx
import { LearnProvider } from './learn/LearnProvider'; // 唯一引用点

// 删除学习功能时，只需：
// 1. 删除 learn/ 文件夹
// 2. 删除这一行 import
// 3. 删除下面的 <LearnProvider> 包裹
```

### 1.2 学习模式开关

游戏设置里有一个开关：**学习模式 ON / OFF**

| 状态 | 效果 |
|------|------|
| OFF | 纯游戏体验，所有英语学习功能隐藏 |
| ON | 歌词字幕、词汇弹窗、双语文档、幕间测验全部激活 |

默认 **ON**。玩家可以随时在暂停菜单中切换。

---

## 二、学习内容设计

### 2.1 核心理念

**沉浸式学习**——不是"做题学英语"，而是"在故事里自然接触英语"。

学习内容完全来自音乐剧本身：
- 歌词是真实的英语文学
- 收集品文档用 19 世纪英语写成
- 词汇来自歌剧、音乐、19 世纪巴黎的真实语境

**难度分级**：

| 等级 | 颜色标记 | 说明 | 示例 |
|------|---------|------|------|
| ⭐ 基础 | 绿色 | 常见词汇 | night, music, ask, think |
| ⭐⭐ 进阶 | 蓝色 | 文学/音乐词汇 | phantom, beneath, surrender, vow |
| ⭐⭐⭐ 高级 | 紫色 | 古语/专业术语 | chandelier, masquerade, proscenium, aria |

---

## 三、功能模块详细设计

### 3.1 歌词字幕系统（LyricSubtitle）

**每首核心曲目播放时，底部显示同步歌词字幕。**

```
┌──────────────────────────────────────────┐
│                                          │
│              (游戏画面)                   │
│                                          │
│                                          │
├──────────────────────────────────────────┤
│  ♪ Think of me, think of me fondly       │  ← 英文歌词（当前行高亮）
│    想想我吧，温柔地想起我                  │  ← 中文翻译（半透明）
│                                          │
│  [fondly] 温柔地，深情地 adv.      📌     │  ← 当前行的重点词（可点击收藏）
└──────────────────────────────────────────┘
```

**交互**：
- 歌词自动滚动，跟随音乐进度
- 点击英文单词 → 弹出词汇卡片（释义、音标、例句）
- 点击 📌 → 加入生词本
- 长按/右键 → 看整句的语法解析

**技术**：
- 歌词数据结构：`{ time: number, en: string, zh: string, vocab: VocabItem[] }[]`
- 同步方式：`Tone.Transport` 的当前时间与歌词时间戳匹配
- 渲染：HTML overlay（React），不在 Canvas 内

**五首歌的歌词覆盖**：

| 幕 | 曲目 | 歌词行数 | 重点词汇数 |
|----|------|---------|-----------|
| 一 | Think of Me | ~25 行 | 15 词 |
| 二 | The Phantom of the Opera | ~30 行 | 20 词 |
| 三 | Music of the Night | ~28 行 | 22 词 |
| 四 | All I Ask of You + Reprise | ~35 行 | 18 词 |
| 五 | The Point of No Return | ~30 行 | 20 词 |
| **合计** | | **~148 行** | **~95 词** |

### 3.2 双语文档阅读器（DocumentReader）

**收集品的阅读界面升级为双语版。**

学习模式 OFF 时：收集品只显示中文内容（基础版 PRD 的设计）。

学习模式 ON 时：

```
┌──────────────────────────────────────────┐
│  ╭──────────────────────────────────╮    │
│  │  📜 Letter from Christine        │    │
│  │                                  │    │
│  │  My dearest Raoul,               │    │
│  │  亲爱的拉乌尔，                    │    │
│  │                                  │    │
│  │  Tonight I sang as I have never  │    │
│  │  sung before. A voice guided me, │    │
│  │  a voice from within the walls   │    │
│  │  of this very theatre...         │    │
│  │                                  │    │
│  │  今夜我唱出了从未有过的声音。       │    │
│  │  一个声音在指引我，                 │    │
│  │  来自这座剧院墙壁深处的声音……      │    │
│  │                                  │    │
│  │  [guided] v. 引导  📌             │    │
│  │  [within] prep. 在……之内  📌      │    │
│  │                                  │    │
│  │         [ 点击任意处关闭 ]          │    │
│  ╰──────────────────────────────────╯    │
└──────────────────────────────────────────┘
```

**设计要点**：
- 英文在上，中文在下，逐段对照
- 英文用手写风格字体（`Caveat`），中文用正文字体
- 重点词汇下划线标注，点击弹出释义
- 文档内容用 19 世纪英语风格书写（正式、略古典）

**15 份收集品文档的英文内容**：

| 幕 | 收集品 | 英文风格 |
|----|--------|---------|
| 一 | 被砍断的绳索 | 检查报告风格："The rope was severed cleanly, not frayed..." |
| 一 | 经理的备忘录 | 商务信函风格："Box Five is to remain empty at ALL times..." |
| 一 | 魅影的纸条 | 优雅手写："She is ready. The Angel of Music has spoken." |
| 二 | 拉乌尔的贺卡 | 贵族书信："My dear Christine, you were luminous tonight..." |
| 二 | 墙上的乐谱涂鸦 | 音乐术语："Adagio, in D minor, for organ and voice..." |
| 二 | 蜡烛台刻字 | 极简：刻着 "C" 的心形，描述文本用英文 |
| 三 | 歌剧手稿 | 戏剧文本风格："Act III, Scene ii — Don Juan Triumphant" |
| 三 | 魅影的日记 | 第一人称独白："They called me a monster. But monsters do not weep..." |
| 三 | 掉落的面具 | 物品描述（玩家内心独白）："Still warm. As if a face had just left it." |
| 四 | 拉乌尔的花束 | 卡片文字："All I ask of you — R" |
| 四 | 克里斯汀的围巾 | 描述文本："Silk, faintly scented with jasmine and stage dust." |
| 四 | 天使雕像刻痕 | 雕刻："I listen here. Always." |
| 五 | 节目单 | 正式印刷风格："Tonight's performance: Don Juan Triumphant" |
| 五 | 音乐盒 | 描述："A small melody plays — three notes, then silence." |
| 五 | 面具（终章） | 最终独白："This is all that remains. A mask. A memory. A song." |

### 3.3 词汇弹窗（VocabPopup）

点击任何带下划线的英文单词，弹出卡片：

```
┌────────────────────────┐
│  phantom  /ˈfæntəm/    │
│  n. 幽灵，幻影           │
│                        │
│  "The Phantom of the   │
│   Opera is there,      │
│   inside my mind."     │
│                        │
│  同根词：phantasm       │
│  近义词：specter, ghost │
│                        │
│  [📌 加入生词本]  [✕]   │
└────────────────────────┘
```

**数据结构**：
```ts
interface VocabItem {
  word: string;
  phonetic: string;
  pos: string;       // n. / v. / adj. / adv.
  zh: string;        // 中文释义
  example: string;   // 来自歌词或文档的原文例句
  related?: string[];// 同根词/近义词
  level: 1 | 2 | 3;  // 难度等级
  act: number;       // 所属幕
}
```

### 3.4 幕间小测验（QuizOverlay）

**每幕结束后，过场画面中弹出一个简短测验（3-5 题），巩固本幕词汇。**

题型：

**1. 听歌填词**
```
♪ Think of me, think of me _______
  A) fondly   B) friendly   C) fairly   D) freely
  
  （播放对应片段的音频）
```

**2. 文档还原**
```
"Box Five is to remain ______ at ALL times."
  A) closed   B) empty   C) locked   D) silent
```

**3. 选词翻译**
```
"beneath" 的意思是：
  A) 在……之上   B) 在……之内   C) 在……之下   D) 在……之间
```

**4. 情境选择**
```
魅影在信中写道 "She is ready"。
这里的 "ready" 最接近哪个意思？
  A) 准备好了   B) 已经读过   C) 愿意的   D) 容易的
```

**规则**：
- 每题 15 秒限时（可关闭限时）
- 答对：金色光效 + "Bravo!" 提示 + 该词标记为"已掌握"
- 答错：显示正确答案 + 该词自动加入生词本
- 全对：获得一个特殊收集品（如"学者徽章"）
- **可跳过**——测验不阻断游戏流程

**题量**：每幕 5 题，5 幕共 25 题。

### 3.5 生词本（Notebook）

从背包的日记本界面可以切换到"生词本"标签页。

```
┌──────────────────────────────────────────┐
│  📖 日记本         📝 生词本              │
│  ─────────────────────────────────────── │
│                                          │
│  ⭐ 基础词汇 (8/15)                       │
│  ┌──────────┬──────┬────────┐            │
│  │ fondly   │ adv. │ 深情地   │ ✓ 已掌握  │
│  │ beneath  │prep. │ 在……之下 │ 📖 复习   │
│  │ guided   │ v.   │ 引导    │ 📖 复习   │
│  └──────────┴──────┴────────┘            │
│                                          │
│  ⭐⭐ 进阶词汇 (3/20)                     │
│  ┌──────────┬──────┬────────┐            │
│  │ phantom  │ n.   │ 幽灵    │ ✓ 已掌握  │
│  │ surrender│ v.   │ 投降    │ 📖 复习   │
│  └──────────┴──────┴────────┘            │
│                                          │
│  总进度: 11/95 词  [开始复习]              │
└──────────────────────────────────────────┘
```

**"已掌握" 判定**：测验中答对 2 次 → 标记为已掌握。

**复习模式**：点击 "开始复习" → 闪卡模式（正面英文，翻转看中文+例句），可标记 "记住了" / "再看一次"。

### 3.6 学习统计（LearnStats）

主菜单或暂停菜单中可查看：

```
📊 学习统计
──────────────
本次游玩时长: 45 分钟
接触英文词汇: 67 个
已掌握词汇:   23 个
测验正确率:   78%
歌词阅读行数: 89 / 148
文档阅读数:   9 / 15
```

数据存储在 `localStorage`（与游戏存档分开的 key）。

---

## 四、每幕英语学习内容速查

### 第一幕：Think of Me

| 类型 | 内容 | 词汇量 |
|------|------|--------|
| 歌词 | Think of Me 完整歌词（25 行） | 15 词 |
| 文档 | 3 份收集品英文文本 | 8 词 |
| 测验 | 5 题（听歌填词 2 + 文档还原 1 + 选词 2） | - |
| **词汇主题** | **舞台与表演**：stage, rehearsal, understudy, debut, ovation, curtain call | - |

**例句来自游戏**：
- *"Think of me, think of me fondly, when we've said goodbye."*
- *"Box Five is to remain empty at ALL times — O.G."*
- *"She is ready. The Angel of Music has spoken."*

### 第二幕：The Phantom of the Opera

| 类型 | 内容 | 词汇量 |
|------|------|--------|
| 歌词 | The Phantom of the Opera 完整歌词（30 行） | 20 词 |
| 文档 | 3 份收集品英文文本 | 10 词 |
| 测验 | 5 题 | - |
| **词汇主题** | **神秘与地下**：phantom, labyrinth, beneath, subterranean, torch, cavern, echo | - |

### 第三幕：Music of the Night

| 类型 | 内容 | 词汇量 |
|------|------|--------|
| 歌词 | Music of the Night 完整歌词（28 行） | 22 词 |
| 文档 | 3 份收集品英文文本 | 10 词 |
| 测验 | 5 题 | - |
| **词汇主题** | **音乐与情感**：melody, harmony, compose, serenade, tender, embrace, surrender | - |

### 第四幕：All I Ask of You

| 类型 | 内容 | 词汇量 |
|------|------|--------|
| 歌词 | All I Ask of You + Reprise（35 行） | 18 词 |
| 文档 | 3 份收集品英文文本 | 8 词 |
| 测验 | 5 题 | - |
| **词汇主题** | **爱情与誓言**：shelter, promise, devotion, forsake, refuge, vow, curse | - |

### 第五幕：The Point of No Return

| 类型 | 内容 | 词汇量 |
|------|------|--------|
| 歌词 | The Point of No Return（30 行） | 20 词 |
| 文档 | 3 份收集品英文文本 | 10 词 |
| 测验 | 5 题 | - |
| **词汇主题** | **命运与抉择**：destiny, threshold, betrayal, redemption, farewell, mask, remain | - |

---

## 五、技术实现

### 5.1 学习层注入方式

```tsx
// PhantomGame.tsx — 学习模式的唯一接入点

import { LearnProvider, useLearnMode } from './learn/LearnProvider';

function PhantomGame() {
  return (
    // 删除 LearnProvider 包裹 = 移除全部学习功能
    <LearnProvider>
      <GameCanvas />
      <GameUI />
      <LearnOverlays />  {/* 歌词字幕、词汇弹窗、测验 */}
    </LearnProvider>
  );
}

// LearnOverlays 只在学习模式 ON 时渲染内容
function LearnOverlays() {
  const { enabled } = useLearnMode();
  if (!enabled) return null;
  
  return (
    <>
      <LyricSubtitle />
      <VocabPopup />
      <QuizOverlay />
    </>
  );
}
```

### 5.2 歌词同步

```ts
// learn/data/lyrics.ts

export const THINK_OF_ME_LYRICS: LyricLine[] = [
  {
    time: 0,      // 秒
    en: "Think of me, think of me fondly,",
    zh: "想想我吧，温柔地想起我，",
    vocab: [
      { word: "fondly", phonetic: "/ˈfɒndli/", pos: "adv.", zh: "深情地", level: 1 }
    ]
  },
  {
    time: 4.2,
    en: "when we've said goodbye.",
    zh: "在我们说过再见之后。",
    vocab: []
  },
  {
    time: 7.8,
    en: "Remember me once in a while,",
    zh: "偶尔想起我吧，",
    vocab: [
      { word: "once in a while", phonetic: "", pos: "phrase", zh: "偶尔", level: 1 }
    ]
  },
  // ... 剩余歌词
];
```

### 5.3 数据存储

```ts
// 学习数据与游戏存档完全分开
const LEARN_STORAGE_KEY = 'phantom-learn-data';

interface LearnData {
  enabled: boolean;                    // 学习模式开关
  notebook: Record<string, {          // 生词本
    word: string;
    masteredCount: number;             // 答对次数，>=2 为已掌握
    addedAt: number;                   // 时间戳
  }>;
  quizResults: Record<number, {       // 每幕测验结果
    score: number;
    total: number;
    completedAt: number;
  }>;
  lyricsRead: number;                 // 已阅读歌词行数
  docsRead: string[];                 // 已阅读文档 ID
}
```

### 5.4 移除学习功能的步骤

```bash
# 完全移除英语学习功能，游戏不受影响：
rm -rf src/phantom/learn/

# 然后在 PhantomGame.tsx 中：
# 1. 删除 import { LearnProvider } from './learn/LearnProvider'
# 2. 删除 <LearnProvider> 和 </LearnProvider> 包裹
# 3. 删除 <LearnOverlays />

# 完成。游戏正常运行，所有剧情、收集品、音乐不受影响。
```

---

## 六、额外工作量

在基础版 PRD 的开发计划（27-33 天）基础上，英语学习层额外需要：

| 内容 | 工作日 |
|------|--------|
| LearnProvider + 开关系统 | 0.5 天 |
| LyricSubtitle 歌词字幕组件 + 同步逻辑 | 2 天 |
| DocumentReader 双语阅读器 | 1 天 |
| VocabPopup 词汇弹窗 | 1 天 |
| Notebook 生词本 | 1 天 |
| QuizOverlay 测验系统 | 1.5 天 |
| LearnStats 统计页 | 0.5 天 |
| 5 首歌词数据录入 + 翻译 + 词汇标注 | 2 天 |
| 15 份文档英文撰写 + 翻译 | 2 天 |
| 25 道测验题编写 | 0.5 天 |
| **合计** | **12 天** |

**总计**：基础游戏 27-33 天 + 英语学习层 12 天 = **39-45 天**

---

## 七、验收标准（英语学习部分）

| ID | 标准 |
|----|------|
| L1 | 学习模式开关可在暂停菜单中随时切换 |
| L2 | 5 首歌曲播放时底部显示同步歌词字幕 |
| L3 | 点击歌词中的单词弹出词汇卡片 |
| L4 | 15 份收集品在学习模式下显示英中双语 |
| L5 | 每幕结束后弹出 5 题测验（可跳过） |
| L6 | 生词本正确记录收藏的词汇和掌握状态 |
| L7 | 删除 `learn/` 文件夹后游戏正常运行 |
