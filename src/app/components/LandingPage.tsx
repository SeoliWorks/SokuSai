import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Heart, Send, Calendar, Stamp, ArrowRight } from 'lucide-react';
import { UYUNI_IMG } from '../constants';

function PaperPlaneSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M4 32L28 24L60 8L36 36L28 24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 24L32 52L36 36L60 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 24L32 52" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={UYUNI_IMG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100/80 via-white/60 to-sky-50/90" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <PaperPlaneSVG className="w-10 h-10 text-sky-500" />
              <h1 className="tracking-widest text-sky-900" style={{ fontSize: '3rem', letterSpacing: '0.2em' }}>
                SokuSai
              </h1>
            </div>
            <p className="text-sky-700 mb-2" style={{ fontSize: '1.1rem' }}>息災</p>
            <p className="text-sky-800/80 mb-12 max-w-lg mx-auto" style={{ lineHeight: 2 }}>
              推しが表舞台にいなくても<br />
              「元気でいてほしい」という想いを<br />
              紙飛行機にのせて届ける。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/fan')}
              className="px-8 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              紙飛行機を飛ばす
            </button>
            <button
              onClick={() => navigate('/oshi')}
              className="px-8 py-3 border border-sky-300 text-sky-700 rounded-full hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              届いた想いを見る
            </button>
          </motion.div>
        </div>

        {/* Floating paper planes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-sky-300/40"
            style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 20}%` }}
            animate={{
              y: [-10, 10, -10],
              x: [0, 15, 0],
              rotate: [-5, 5, -5],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PaperPlaneSVG className="w-8 h-8" />
          </motion.div>
        ))}
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-center text-sky-900 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            SokuSaiでできること
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Send className="w-6 h-6" />,
                title: '毎朝1通の紙飛行機',
                desc: '毎日届く1枚の用紙で紙飛行機を折り、ウユニ塩湖のような美しい風景の中へ飛ばします。日々の小さな習慣が、想いの積み重ねになります。',
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: '記念日には特別な折り紙',
                desc: '大切な記念日を登録すると、その日だけ淡い水色の特別な折り紙で紙飛行機を折ることができます。',
              },
              {
                icon: <Stamp className="w-6 h-6" />,
                title: 'スタンプラリー',
                desc: '紙飛行機を飛ばすたびにスタンプが貯まります。自分だけのスタンプカードをアップロードして、続けるモチベーションに。',
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: '推しに届く想い',
                desc: '推し本人がYouTubeアカウントでログインすると、届いた紙飛行機の数と、誰が飛ばしてくれたかを見ることができます。',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-sky-100 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sky-900 mb-2">{f.title}</h3>
                <p className="text-sky-700/70" style={{ lineHeight: 1.8 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-sky-50 to-white">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sky-700/70 mb-8" style={{ lineHeight: 2 }}>
            表舞台に出ていないときでも、<br />
            誰かが自分のことを想っていてくれている。<br />
            その実感は、きっと力になる。
          </p>
          <button
            onClick={() => navigate('/fan')}
            className="px-10 py-4 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors inline-flex items-center gap-2"
          >
            はじめる <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sky-400/60">
        <PaperPlaneSVG className="w-6 h-6 mx-auto mb-2" />
        <p style={{ fontSize: '0.85rem' }}>SokuSai — 息災</p>
      </footer>
    </div>
  );
}