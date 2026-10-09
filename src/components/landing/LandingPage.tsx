import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: '⚔️',
    title: 'Dungeon',
    subtitle: 'Time Tracking',
    desc: 'Visualize how you spend every hour. Daily breakdowns, weekly trends, proportion charts.',
    color: 'text-px-blue',
    bg: 'bg-px-blue/10',
  },
  {
    icon: '💰',
    title: 'Treasure',
    subtitle: 'Bookkeeping',
    desc: 'Track income & expenses with intuitive charts. Know where your money goes.',
    color: 'text-px-green',
    bg: 'bg-px-green/10',
  },
  {
    icon: '🍺',
    title: 'Tavern',
    subtitle: 'Eating Diary',
    desc: 'Log meals, count calories, and see nutritional patterns over time.',
    color: 'text-px-orange',
    bg: 'bg-px-orange/10',
  },
  {
    icon: '📜',
    title: 'Library',
    subtitle: 'Diary',
    desc: 'Capture thoughts and reflections. Build a habit with streak tracking.',
    color: 'text-px-purple',
    bg: 'bg-px-purple/10',
  },
  {
    icon: '🏟️',
    title: 'Arena',
    subtitle: 'Sport',
    desc: 'Record workouts, track progress, and stay motivated with visual goals.',
    color: 'text-px-teal',
    bg: 'bg-px-teal/10',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#e8e4d9] dark:bg-px-bg text-gray-900 dark:text-gray-100 overflow-x-hidden relative">
      {/* Subtle pixel sparkle layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-20 scene-stars" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#e8e4d9]/80 dark:bg-px-bg/80 border-b border-[#d5d0c5] dark:border-gray-800/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-display">TimeVisual</span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-calm-muted hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        {/* Subtle gradient orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 dark:opacity-10 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse, #0099db 0%, #8b5cf6 40%, transparent 70%)',
          }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative text-4xl sm:text-5xl md:text-6xl font-bold tracking-display leading-tight"
        >
          Your life,
          <br />
          <span className="bg-gradient-to-r from-px-blue via-px-purple to-px-teal bg-clip-text text-transparent">
            beautifully tracked
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative mt-6 text-lg sm:text-xl text-calm-muted max-w-xl mx-auto leading-relaxed"
        >
          Time, money, meals, workouts, thoughts — one calm place to see it all.
          No clutter, just clarity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative mt-10 flex items-center justify-center gap-3"
        >
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-base shadow-elevated hover:shadow-dialog transition-shadow"
          >
            Start for free
          </Link>
          <a
            href="#features"
            className="px-6 py-2.5 rounded-full border border-calm-border dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            See features ↓
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-2xl sm:text-3xl font-semibold tracking-display mb-14"
        >
          Five dimensions. One dashboard.
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              className="group p-5 rounded-2xl bg-[#f4f1ea] dark:bg-[#262b44] border border-[#d5d0c5] dark:border-[#3d4460] shadow-soft hover:shadow-card transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center text-xl mb-4`}
              >
                {f.icon}
              </div>
              <p className={`font-pixel text-[8px] ${f.color} mb-1`}>{f.title}</p>
              <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">{f.subtitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats / social proof */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '5', label: 'Life dimensions' },
            { value: '∞', label: 'Data points' },
            { value: '0', label: 'Ads, forever' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="p-6 rounded-2xl bg-[#f4f1ea] dark:bg-[#262b44] border border-[#d5d0c5] dark:border-[#3d4460]"
            >
              <div className="text-3xl sm:text-4xl font-bold tracking-display">{s.value}</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 30% 50%, #0099db, transparent 50%), radial-gradient(circle at 70% 50%, #8b5cf6, transparent 50%)',
            }}
          />
          <h2 className="relative text-2xl sm:text-3xl font-bold tracking-display mb-4">
            Ready to see your life clearly?
          </h2>
          <p className="relative text-gray-400 mb-8 max-w-md mx-auto">
            Join now. It takes 30 seconds and it's completely free.
          </p>
          <Link
            to="/register"
            className="relative inline-block px-8 py-3 rounded-full bg-white text-gray-900 font-medium hover:opacity-90 transition-opacity shadow-elevated"
          >
            Create your account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-[#d5d0c5] dark:border-gray-800/60 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} TimeVisual. Built with focus.
      </footer>
    </div>
  )
}
