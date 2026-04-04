import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

// Mock data for oshi dashboard
const MOCK_FANS = [
  { id: '1', name: 'さくら', date: '2026-03-26' },
  { id: '2', name: 'ひなた', date: '2026-03-26' },
  { id: '3', name: 'あおい', date: '2026-03-26' },
  { id: '4', name: 'みずき', date: '2026-03-25' },
  { id: '5', name: 'ゆうな', date: '2026-03-25' },
  { id: '6', name: 'りこ', date: '2026-03-24' },
  { id: '7', name: 'はるか', date: '2026-03-24' },
  { id: '8', name: 'かえで', date: '2026-03-24' },
  { id: '9', name: 'すずね', date: '2026-03-23' },
  { id: '10', name: 'ことは', date: '2026-03-23' },
  { id: '11', name: 'まひろ', date: '2026-03-22' },
  { id: '12', name: 'つむぎ', date: '2026-03-22' },
];

const today = '2026-03-26';
const todayFans = MOCK_FANS.filter((f) => f.date === today);
const totalAll = MOCK_FANS.length;

function PaperPlaneIcon({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      initial={{ opacity: 0, x: -20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <path d="M4 32L28 24L60 8L36 36L28 24" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 24L32 52L36 36L60 8" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round" />
    </motion.svg>
  );
}

export function OshiDashboard() {
  const navigate = useNavigate();
  const [openedId, setOpenedId] = useState<string | null>(null);
  const openedFan = MOCK_FANS.find((f) => f.id === openedId);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 text-sky-500 hover:text-sky-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sky-700 tracking-widest" style={{ fontSize: '0.9rem' }}>SokuSai — ダッシュボード</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Counter */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sky-600/70" style={{ fontSize: '0.9rem' }}>今日届いた紙飛行機</p>
          <div className="flex items-baseline justify-center gap-2">
            <motion.span
              className="text-sky-700"
              style={{ fontSize: '4rem' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {todayFans.length}
            </motion.span>
            <span className="text-sky-500/70">機</span>
          </div>
          <p className="text-sky-400/60" style={{ fontSize: '0.8rem' }}>
            累計: {totalAll}機の紙飛行機が届いています
          </p>
        </motion.div>

        {/* Today's paper planes */}
        <section className="space-y-4">
          <h2 className="text-sky-900">今日の紙飛行機</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {todayFans.map((fan, i) => (
              <motion.button
                key={fan.id}
                onClick={() => setOpenedId(fan.id)}
                className="group relative bg-white rounded-2xl border border-sky-100 p-6 hover:border-sky-300 hover:shadow-md transition-all flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PaperPlaneIcon className="w-12 h-12" delay={i * 0.1} />
                <span className="text-sky-400/60" style={{ fontSize: '0.75rem' }}>タップして開く</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Past days */}
        <section className="space-y-4">
          <h2 className="text-sky-900">これまでの紙飛行機</h2>
          {['2026-03-25', '2026-03-24', '2026-03-23', '2026-03-22'].map((date) => {
            const fans = MOCK_FANS.filter((f) => f.date === date);
            if (fans.length === 0) return null;
            return (
              <div key={date} className="bg-white rounded-xl border border-sky-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sky-700" style={{ fontSize: '0.9rem' }}>{date.replace(/-/g, '/')}</span>
                  <span className="text-sky-400/60" style={{ fontSize: '0.8rem' }}>{fans.length}機</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {fans.map((fan) => (
                    <button
                      key={fan.id}
                      onClick={() => setOpenedId(fan.id)}
                      className="p-2 rounded-lg hover:bg-sky-50 transition-colors"
                    >
                      <PaperPlaneIcon className="w-8 h-8" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Opened plane modal */}
      <AnimatePresence>
        {openedFan && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenedId(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center space-y-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PaperPlaneIcon className="w-16 h-16 mx-auto" />
              {/* Unfolding animation */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-br from-sky-50 to-white rounded-xl p-6 border border-sky-100">
                  <p className="text-sky-800" style={{ lineHeight: 1.8 }}>
                    今日も<span className="text-sky-600 mx-1">{openedFan.name}</span>さんが<br />
                    紙飛行機を飛ばしてくれました
                  </p>
                  <p className="text-sky-400/50 mt-3" style={{ fontSize: '0.75rem' }}>
                    {openedFan.date.replace(/-/g, '/')}
                  </p>
                </div>
              </motion.div>
              <button
                onClick={() => setOpenedId(null)}
                className="text-sky-500 hover:text-sky-700 transition-colors"
                style={{ fontSize: '0.85rem' }}
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
