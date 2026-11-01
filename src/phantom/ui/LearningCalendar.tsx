/**
 * LearningCalendar — heatmap showing daily learning activity.
 * Tracks challenges completed and vocab reviewed per day.
 */
import { useState, useMemo } from 'react';
import { Z_TOOL } from '../core/z-index';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CAL_KEY = 'phantom-calendar';

interface DayRecord {
  challenges: number;
  reviews: number;
}

function getCalendar(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(CAL_KEY);
    return raw ? JSON.parse(raw) as Record<string, DayRecord> : {};
  } catch { return {}; }
}

/** Call this when a learning activity happens */
export function recordActivity(type: 'challenge' | 'review') {
  const cal = getCalendar();
  const today = new Date().toISOString().slice(0, 10);
  if (!cal[today]) cal[today] = { challenges: 0, reviews: 0 };
  if (type === 'challenge') cal[today].challenges++;
  else cal[today].reviews++;
  try { localStorage.setItem(CAL_KEY, JSON.stringify(cal)); } catch { /* */ }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getIntensity(record: DayRecord | undefined): number {
  if (!record) return 0;
  const total = record.challenges * 3 + record.reviews;
  if (total >= 10) return 4;
  if (total >= 6) return 3;
  if (total >= 3) return 2;
  if (total >= 1) return 1;
  return 0;
}

const INTENSITY_COLORS = [
  'rgba(255,255,255,0.03)',  // 0: no activity
  'rgba(138,175,176,0.2)',   // 1: light
  'rgba(138,175,176,0.4)',   // 2: medium
  'rgba(138,175,176,0.6)',   // 3: active
  'rgba(197,165,90,0.8)',    // 4: very active
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function LearningCalendar({ open, onClose }: Props) {
  const calendar = useMemo(() => getCalendar(), []);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const totalDays = Object.keys(calendar).length;
  const totalChallenges = Object.values(calendar).reduce((s, d) => s + d.challenges, 0);
  const totalReviews = Object.values(calendar).reduce((s, d) => s + d.reviews, 0);

  // Current streak
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (calendar[key]) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [calendar]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        zIndex: Z_TOOL,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 420, maxHeight: '85vh',
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
          LEARNING CALENDAR
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginBottom: '0.8rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#c5a55a', fontWeight: 'bold', margin: 0 }}>{totalDays}</p>
            <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>Active Days</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#8aafb0', fontWeight: 'bold', margin: 0 }}>{streak}</p>
            <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>Current Streak</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#9a8a78', fontWeight: 'bold', margin: 0 }}>{totalChallenges + totalReviews}</p>
            <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>Activities</p>
          </div>
        </div>

        {/* Month navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <button
            onClick={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
              else setViewMonth((m) => m - 1);
            }}
            style={navBtn}
          >{'←'}</button>
          <span style={{ fontSize: '0.85rem', color: '#c5a55a' }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
              else setViewMonth((m) => m + 1);
            }}
            style={navBtn}
          >{'→'}</button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ fontSize: '0.55rem', color: '#4a3a2e', textAlign: 'center', padding: '2px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ height: 28 }} />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = calendar[dateStr];
            const intensity = getIntensity(record);
            const isToday = dateStr === now.toISOString().slice(0, 10);
            return (
              <div
                key={day}
                title={record ? `${record.challenges} challenges, ${record.reviews} reviews` : 'No activity'}
                style={{
                  height: 28,
                  background: INTENSITY_COLORS[intensity],
                  border: isToday ? '1px solid #c5a55a' : '1px solid rgba(100,80,60,0.1)',
                  borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem',
                  color: intensity > 0 ? '#e0d8cc' : '#3a3228',
                  cursor: 'default',
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.6rem' }}>
          <span style={{ fontSize: '0.55rem', color: '#4a3a2e' }}>Less</span>
          {INTENSITY_COLORS.map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, background: c, borderRadius: 2, border: '1px solid rgba(100,80,60,0.1)' }} />
          ))}
          <span style={{ fontSize: '0.55rem', color: '#4a3a2e' }}>More</span>
        </div>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  fontFamily: 'Georgia, serif', fontSize: '0.8rem',
  padding: '0.2rem 0.6rem', background: 'transparent',
  border: '1px solid #2a2420', color: '#6a5a48',
  borderRadius: 3, cursor: 'pointer',
};
