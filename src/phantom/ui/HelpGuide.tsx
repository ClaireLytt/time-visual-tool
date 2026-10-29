import { Z_TOOL } from '../core/z-index';
/**
 * HelpGuide — interactive tutorial overlay explaining game controls
 * and English learning features. Shown on first play or from pause menu.
 */
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface HelpSection {
  icon: string;
  title: string;
  titleEn: string;
  items: { key: string; desc: string; descEn: string }[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    icon: '🎮',
    title: '游戏操作',
    titleEn: 'Game Controls',
    items: [
      { key: '点击场景', desc: '移动视角，探索不同区域', descEn: 'Click the scene to move camera and explore' },
      { key: '金色发光物品', desc: '点击收集线索，解锁英语挑战', descEn: 'Click golden glowing items to collect clues' },
      { key: '青色发光物体', desc: '点击查看氛围描述和英语短语', descEn: 'Click teal glowing objects for atmosphere + English phrases' },
      { key: 'Tab', desc: '打开收集日记/词汇本', descEn: 'Open journal / vocabulary notebook' },
      { key: 'M', desc: '打开探索地图', descEn: 'Open the exploration map' },
      { key: 'ESC', desc: '暂停游戏，访问学习工具', descEn: 'Pause game, access learning tools' },
    ],
  },
  {
    icon: '🎓',
    title: '英语学习',
    titleEn: 'English Learning',
    items: [
      { key: '词汇挑战', desc: '收集物品后自动触发，填空/翻译/匹配三种题型', descEn: 'Triggered after collecting items: fill-blank, translate, match' },
      { key: '对话场景', desc: '关键剧情点触发，中英双语，含分支选择', descEn: 'Story dialogues with bilingual text and branching choices' },
      { key: '语法笔记', desc: '部分挑战附带语法说明（被动/完成时等）', descEn: 'Some challenges include grammar tips (passive voice, etc.)' },
      { key: '每日挑战', desc: '标题页每天一个新填空题，追踪连续天数', descEn: 'Daily fill-in-the-blank on the title screen with streak tracking' },
    ],
  },
  {
    icon: '📚',
    title: '学习工具（暂停菜单）',
    titleEn: 'Learning Tools (Pause Menu)',
    items: [
      { key: '🎓 复习单词', desc: '3D翻转闪卡，按间隔重复排序', descEn: 'Flip cards sorted by spaced repetition' },
      { key: '🧩 单词拼图', desc: '30秒限时拼字游戏', descEn: '30-second timed letter unscrambling' },
      { key: '📝 句子拼装', desc: '点击单词按正确顺序组成句子', descEn: 'Tap words in correct order to build sentences' },
      { key: '📚 阅读理解', desc: '5篇歌剧历史文章+关键词高亮', descEn: '5 articles about the opera with keyword highlighting' },
      { key: '💬 习语收集', desc: '8个英语习语，字面vs比喻义', descEn: '8 English idioms with literal vs figurative meanings' },
      { key: '🏆 综合测验', desc: '60秒多选测验，间隔重复排序', descEn: '60-second quiz with spaced repetition priority' },
    ],
  },
  {
    icon: '🎭',
    title: '游戏系统',
    titleEn: 'Game Systems',
    items: [
      { key: '🏆 成就', desc: '13个徽章，收集/学习/剧情三大类', descEn: '13 badges across collectibles, learning, and story' },
      { key: '📜 时间线', desc: '12个故事事件的视觉时间轴', descEn: 'Visual timeline of 12 story events' },
      { key: '🎭 人物', desc: '5个角色的双语传记', descEn: '5 character profiles with bilingual bios' },
      { key: '🗺️ 地图', desc: 'SVG动态地图，显示进度和收集品', descEn: 'Dynamic map showing progress and collectibles' },
      { key: '3种结局', desc: '基于收集品数量的不同结局', descEn: 'Different endings based on collectibles found' },
    ],
  },
];

export default function HelpGuide({ open, onClose }: Props) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const section = HELP_SECTIONS[sectionIdx];

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: Z_TOOL,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 520, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 0.8rem',
          textAlign: 'center',
        }}>
          HOW TO PLAY
        </p>

        {/* Section tabs */}
        <div style={{
          display: 'flex', gap: '0.3rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '1rem',
        }}>
          {HELP_SECTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setSectionIdx(i)}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.75rem',
                padding: '0.3rem 0.7rem',
                background: sectionIdx === i ? 'rgba(197,165,90,0.12)' : 'transparent',
                border: `1px solid ${sectionIdx === i ? '#c5a55a' : '#2a2420'}`,
                borderRadius: 4,
                color: sectionIdx === i ? '#c5a55a' : '#6a5a48',
                cursor: 'pointer',
              }}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Section content */}
        <h3 style={{
          fontSize: '1rem', color: '#c5a55a',
          margin: '0 0 0.2rem',
        }}>
          {section.icon} {section.title}
        </h3>
        <p style={{
          fontSize: '0.72rem', color: '#6a5a48',
          margin: '0 0 0.8rem',
        }}>
          {section.titleEn}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {section.items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '0.8rem',
              padding: '0.5rem 0.6rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(100,80,60,0.1)',
              borderRadius: 4,
            }}>
              <span style={{
                minWidth: 80, fontSize: '0.78rem',
                color: '#c5a55a', fontWeight: 'bold',
                flexShrink: 0,
              }}>
                {item.key}
              </span>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#d8ccb4', margin: '0 0 0.1rem' }}>
                  {item.desc}
                </p>
                <p style={{ fontSize: '0.68rem', color: '#5a5a50', fontStyle: 'italic', margin: 0 }}>
                  {item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: '0.65rem', color: '#3a3028',
          textAlign: 'center', margin: '1rem 0 0',
        }}>
          click outside to close
        </p>
      </div>
    </div>
  );
}
