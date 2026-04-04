import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router';
import { Plus, Send } from 'lucide-react';
import { UYUNI_IMG } from '../constants';

const FLY_DURATION_MS = 3200;

// ── Phase 定義 ──
// write       : 平らな用紙
// fold-half   : 縦半分に折る
// fold-nose-L : 左上の角を中心線へ
// fold-nose-R : 右上の角を中心線へ
// fold-wing-L : 左の翼を下へ折る
// fold-wing-R : 右の翼を下へ折る
// fold-open   : 翼を広げて完成
type Phase =
  | 'pick' | 'write'
  | 'fold-half' | 'fold-nose-L' | 'fold-nose-R'
  | 'fold-wing-L' | 'fold-wing-R' | 'fold-open'
  | 'ready' | 'fly' | 'done';

const FOLD_STEPS: Phase[] = [
  'fold-half', 'fold-nose-L', 'fold-nose-R',
  'fold-wing-L', 'fold-wing-R', 'fold-open',
];

const STEP_LABELS: Record<string, string> = {
  write: '用紙を確認しましょう',
  'fold-half': '縦半分に折ります…',
  'fold-nose-L': '左上の角を中心線に合わせます…',
  'fold-nose-R': '右上の角も中心線に合わせます…',
  'fold-wing-L': '左の翼を折り下げます…',
  'fold-wing-R': '右の翼も折り下げます…',
  'fold-open': '翼をそっと広げて…完成！',
};

const ALL_FOLD_PHASES: Phase[] = ['write', ...FOLD_STEPS];

function isAnniversaryToday(anniversaries: { date: string }[]) {
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return anniversaries.some((a) => a.date === mmdd);
}

/* ================================================================
   SVG で各折り工程を描画するコンポーネント
   ================================================================ */
function OrigamiVisual({ phase, isSpecial, recipientName }: {
  phase: Phase; isSpecial: boolean; recipientName: string;
}) {
  const c1 = isSpecial ? '#dbeafe' : '#f8fafc';   // 表面色
  const c2 = isSpecial ? '#bae6fd' : '#e2e8f0';   // 折り返し面
  const c3 = isSpecial ? '#7dd3fc' : '#cbd5e1';   // 線
  const c4 = isSpecial ? '#38bdf8' : '#94a3b8';   // 折り目
  const glow = isSpecial ? '#0ea5e9' : '#64748b';

  const W = 260, H = 320;

  return (
    <div className="flex items-center justify-center" style={{ width: W, height: H }}>
      <AnimatePresence mode="wait">
        {/* ── 用紙（平ら） ── */}
        {phase === 'write' && (
          <motion.svg
            key="write" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <defs>
              <filter id="ps"><feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.07" /></filter>
            </defs>
            <rect x="20" y="10" width="220" height="296" rx="3" fill={c1} stroke={c3} strokeWidth="0.7" filter="url(#ps)" />
            {/* 罫線 */}
            {[...Array(10)].map((_, i) => (
              <motion.line
                key={i} x1="40" y1={56 + i * 24} x2="220" y2={56 + i * 24}
                stroke={c3} strokeWidth="0.3" strokeDasharray="4 3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.04 }}
              />
            ))}
            <text x="40" y="42" fill={c4} style={{ fontSize: '11px' }}>To: {recipientName}さん</text>
            <text x="170" y="296" fill={c4} style={{ fontSize: '9px' }}>{new Date().toLocaleDateString('ja-JP')}</text>
          </motion.svg>
        )}

        {/* ── 縦半分に折る ── */}
        {phase === 'fold-half' && (
          <motion.svg
            key="half" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <defs>
              <filter id="ps2"><feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.08" /></filter>
            </defs>
            {/* 下の半分（右側） */}
            <rect x="130" y="10" width="110" height="296" rx="2" fill={c1} stroke={c3} strokeWidth="0.7" filter="url(#ps2)" />
            {/* 折り返した左半分が右に重なる */}
            <motion.rect
              x="130" y="12" width="106" height="290" rx="2"
              fill={c2} stroke={c3} strokeWidth="0.5"
              initial={{ x: 20, scaleX: 1 }} animate={{ x: 130, scaleX: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: '130px 160px' }}
            />
            {/* 折り目線 */}
            <motion.line
              x1="130" y1="8" x2="130" y2="308"
              stroke={c4} strokeWidth="1.2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
          </motion.svg>
        )}

        {/* ── 左上角を中心線へ ── */}
        {phase === 'fold-nose-L' && (
          <motion.svg
            key="noseL" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <defs><filter id="ps3"><feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.08" /></filter></defs>
            {/* ベースの折り畳んだ紙 */}
            <rect x="60" y="10" width="140" height="296" rx="2" fill={c1} stroke={c3} strokeWidth="0.7" filter="url(#ps3)" />
            {/* 中心線 */}
            <line x1="130" y1="8" x2="130" y2="308" stroke={c4} strokeWidth="0.8" strokeDasharray="4 4" />
            {/* 左上三角 */}
            <motion.polygon
              points="60,10 130,10 130,150"
              fill={c2} stroke={c3} strokeWidth="0.6"
              initial={{ opacity: 0, y: -20, rotate: -15 }}
              animate={{ opacity: 0.9, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: '130px 10px' }}
            />
            {/* 折りすじ対角線 */}
            <motion.line
              x1="130" y1="10" x2="130" y2="150"
              stroke={glow} strokeWidth="0.6" strokeDasharray="3 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
          </motion.svg>
        )}

        {/* ── 右上角を中心線へ ── */}
        {phase === 'fold-nose-R' && (
          <motion.svg
            key="noseR" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <defs><filter id="ps4"><feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.08" /></filter></defs>
            <rect x="60" y="10" width="140" height="296" rx="2" fill={c1} stroke={c3} strokeWidth="0.7" filter="url(#ps4)" />
            <line x1="130" y1="8" x2="130" y2="308" stroke={c4} strokeWidth="0.8" strokeDasharray="4 4" />
            {/* 左三角（既に折り済み） */}
            <polygon points="60,10 130,10 130,150" fill={c2} stroke={c3} strokeWidth="0.5" opacity="0.85" />
            {/* 右上三角 */}
            <motion.polygon
              points="200,10 130,10 130,150"
              fill={c2} stroke={c3} strokeWidth="0.6"
              initial={{ opacity: 0, y: -20, rotate: 15 }}
              animate={{ opacity: 0.9, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: '130px 10px' }}
            />
            {/* 先端のノーズ形状 */}
            <motion.polygon
              points="130,10 60,10 130,150 200,10"
              fill="none" stroke={glow} strokeWidth="0.5"
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              transition={{ delay: 0.6 }}
            />
          </motion.svg>
        )}

        {/* ── 左翼を折り下げる ── */}
        {phase === 'fold-wing-L' && (
          <motion.svg
            key="wingL" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <defs><filter id="ps5"><feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.08" /></filter></defs>
            {/* ダイヤ形ボディ */}
            <polygon points="130,10 50,160 130,300 210,160" fill={c1} stroke={c3} strokeWidth="0.7" filter="url(#ps5)" />
            {/* 中心線 */}
            <line x1="130" y1="8" x2="130" y2="302" stroke={c4} strokeWidth="0.8" strokeDasharray="4 4" />
            {/* 左翼の折り */}
            <motion.polygon
              points="50,160 130,10 130,160"
              fill={c2} stroke={c3} strokeWidth="0.6"
              initial={{ scaleX: 1, opacity: 0.3 }}
              animate={{ scaleX: 1, opacity: 0.9 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: '130px 85px' }}
            />
            {/* 折り目ライン */}
            <motion.line
              x1="130" y1="10" x2="50" y2="160"
              stroke={glow} strokeWidth="0.8"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </motion.svg>
        )}

        {/* ── 右翼を折り下げる ── */}
        {phase === 'fold-wing-R' && (
          <motion.svg
            key="wingR" width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <defs><filter id="ps6"><feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.08" /></filter></defs>
            <polygon points="130,10 50,160 130,300 210,160" fill={c1} stroke={c3} strokeWidth="0.7" filter="url(#ps6)" />
            <line x1="130" y1="8" x2="130" y2="302" stroke={c4} strokeWidth="0.8" strokeDasharray="4 4" />
            {/* 左翼（折り済み） */}
            <polygon points="50,160 130,10 130,160" fill={c2} stroke={c3} strokeWidth="0.5" opacity="0.85" />
            {/* 右翼の折り */}
            <motion.polygon
              points="210,160 130,10 130,160"
              fill={c2} stroke={c3} strokeWidth="0.6"
              initial={{ scaleX: 1, opacity: 0.3 }}
              animate={{ scaleX: 1, opacity: 0.9 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: '130px 85px' }}
            />
            <motion.line
              x1="130" y1="10" x2="210" y2="160"
              stroke={glow} strokeWidth="0.8"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </motion.svg>
        )}

        {/* ── 翼を広げて完成 ── */}
        {phase === 'fold-open' && (
          <motion.svg
            key="open" width={W} height="240" viewBox="0 0 300 240"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <linearGradient id="wgTop" x1="0" y1="0" x2="1" y2="0.5">
                <stop offset="0%" stopColor={c2} />
                <stop offset="100%" stopColor={c1} />
              </linearGradient>
              <linearGradient id="wgBot" x1="0" y1="0" x2="1" y2="0.5">
                <stop offset="0%" stopColor={c3} stopOpacity="0.7" />
                <stop offset="100%" stopColor={c2} stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {/* 左翼（上面・手前） */}
            <motion.polygon
              points="270,70 40,100 140,140"
              fill="url(#wgTop)" stroke={c3} strokeWidth="0.8" filter="url(#glow)"
              initial={{ rotate: -6, y: -12 }} animate={{ rotate: 0, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{ transformOrigin: '150px 120px' }}
            />
            {/* 右翼（上面・奥） */}
            <motion.polygon
              points="270,70 120,50 140,140"
              fill="url(#wgTop)" stroke={c3} strokeWidth="0.8" filter="url(#glow)"
              initial={{ rotate: 6, y: -8 }} animate={{ rotate: 0, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{ transformOrigin: '150px 120px' }}
            />
            {/* 胴体の下面（影） */}
            <motion.polygon
              points="270,70 140,140 100,195"
              fill="url(#wgBot)" stroke={c3} strokeWidth="0.5"
              initial={{ opacity: 0.3 }} animate={{ opacity: 0.7 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            {/* 胴体中心の折り目ライン */}
            <motion.line
              x1="270" y1="70" x2="100" y2="195"
              stroke={c4} strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            />
            {/* 先端ハイライト */}
            <circle cx="270" cy="70" r="3.5" fill={glow} opacity="0.4" />
            {/* 翼の折り目（左翼） */}
            <line x1="270" y1="70" x2="40" y2="100" stroke={c4} strokeWidth="0.4" strokeDasharray="5 4" opacity="0.4" />
            {/* 翼の折り目（右翼） */}
            <line x1="270" y1="70" x2="120" y2="50" stroke={c4} strokeWidth="0.4" strokeDasharray="5 4" opacity="0.4" />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── プログレスドット ── */
function ProgressDots({ phase }: { phase: Phase }) {
  const idx = ALL_FOLD_PHASES.indexOf(phase);
  return (
    <div className="flex items-center justify-center gap-1.5 mb-1">
      {ALL_FOLD_PHASES.map((_, i) => (
        <motion.div
          key={i}
          className={`rounded-full ${i < idx ? 'bg-sky-400' : i === idx ? 'bg-sky-500' : 'bg-sky-200/50'}`}
          animate={{ width: i === idx ? 22 : 7, height: 7 }}
          transition={{ duration: 0.35 }}
        />
      ))}
    </div>
  );
}

/* ── 完成した紙飛行機 (ホバリング) ── */
function CompletedPlane({ isSpecial }: { isSpecial: boolean }) {
  const c1 = isSpecial ? '#dbeafe' : '#f0f9ff';
  const c2 = isSpecial ? '#bae6fd' : '#e0f2fe';
  const c3 = isSpecial ? '#93c5fd' : '#cbd5e1';
  const s = isSpecial ? '#7dd3fc' : '#94a3b8';
  const glow = isSpecial ? '#0ea5e9' : '#64748b';
  return (
    <motion.svg
      width="280" height="180" viewBox="0 0 300 240"
      animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <filter id="gl2"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="wg2top" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0%" stopColor={c2} /><stop offset="100%" stopColor={c1} /></linearGradient>
        <linearGradient id="wg2bot" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0%" stopColor={c3} stopOpacity="0.7" /><stop offset="100%" stopColor={c2} stopOpacity="0.5" /></linearGradient>
      </defs>
      {/* 左翼（手前・上面） */}
      <polygon points="270,70 40,100 140,140" fill="url(#wg2top)" stroke={s} strokeWidth="0.8" filter="url(#gl2)" />
      {/* 右翼（奥・上面） */}
      <polygon points="270,70 120,50 140,140" fill="url(#wg2top)" stroke={s} strokeWidth="0.8" filter="url(#gl2)" />
      {/* 胴体の下面（影） */}
      <polygon points="270,70 140,140 100,195" fill="url(#wg2bot)" stroke={s} strokeWidth="0.5" />
      {/* 胴体中心の折り目ライン */}
      <line x1="270" y1="70" x2="100" y2="195" stroke={s} strokeWidth="1" />
      {/* 先端ハイライト */}
      <circle cx="270" cy="70" r="3.5" fill={glow} opacity="0.4" />
      {/* 翼の折り目 */}
      <line x1="270" y1="70" x2="40" y2="100" stroke={s} strokeWidth="0.35" strokeDasharray="5 4" opacity="0.4" />
      <line x1="270" y1="70" x2="120" y2="50" stroke={s} strokeWidth="0.35" strokeDasharray="5 4" opacity="0.4" />
    </motion.svg>
  );
}

/* ================================================================
   メインコンポーネント
   ================================================================ */
export function FanHome() {
  const oshiList = useAppStore((s) => s.oshiList);
  const selectedOshiId = useAppStore((s) => s.selectedOshiId);
  const selectOshi = useAppStore((s) => s.selectOshi);
  const todaySent = useAppStore((s) => s.todaySent);
  const sendPaper = useAppStore((s) => s.sendPaper);
  const hasTodayPaper = useAppStore((s) => s.hasTodayPaper);
  const anniversaries = useAppStore((s) => s.anniversaries);
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('pick');
  const [autoMode, setAutoMode] = useState(false);

  const selectedOshi = oshiList.find((o) => o.id === selectedOshiId);
  const isSpecial = useMemo(() => isAnniversaryToday(anniversaries), [anniversaries]);

  // 次のフェーズを返す
  const advance = useCallback(() => {
    const idx = ALL_FOLD_PHASES.indexOf(phase);
    if (idx < ALL_FOLD_PHASES.length - 1) {
      setPhase(ALL_FOLD_PHASES[idx + 1]);
    } else {
      setPhase('ready');
    }
  }, [phase]);

  // おまかせモード：自動で折りを進行
  useEffect(() => {
    if (!autoMode) return;
    const seq = [...FOLD_STEPS, 'ready' as Phase];
    let i = 0;
    const timer = setInterval(() => {
      if (i < seq.length) { setPhase(seq[i]); i++; }
      else { clearInterval(timer); setAutoMode(false); }
    }, 1300);
    return () => clearInterval(timer);
  }, [autoMode]);

  const handleFly = useCallback(() => {
    setPhase('fly');
    setTimeout(() => { sendPaper(); setPhase('done'); }, FLY_DURATION_MS);
  }, [sendPaper]);

  // 飛行中のパーティクル
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  useEffect(() => {
    if (phase !== 'fly') { setParticles([]); return; }
    let n = 0;
    const t = setInterval(() => {
      setParticles((p) => [...p.slice(-15), { id: n++, x: 18 + Math.random() * 50, y: 25 + Math.random() * 45 }]);
    }, 180);
    return () => clearInterval(t);
  }, [phase]);

  const isFolding = ALL_FOLD_PHASES.includes(phase);

  /* ── 送信済み ── */
  if (todaySent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-cyan-50 flex items-center justify-center mb-6 shadow-lg shadow-sky-200/40"
        >
          <Send className="w-10 h-10 text-sky-500" />
        </motion.div>
        <motion.h2 className="text-sky-900 mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          今日の紙飛行機を飛ばしました
        </motion.h2>
        <motion.p className="text-sky-600/70 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {selectedOshi?.nickname || '推し'}さんに想いが届きますように。
        </motion.p>
        <motion.p className="text-sky-400/60" style={{ fontSize: '0.85rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          明日もまた、新しい用紙が届きます。
        </motion.p>
      </div>
    );
  }

  if (!hasTodayPaper) {
    return (
      <div className="text-center py-20">
        <p className="text-sky-600/70">今日の用紙はまだ届いていません。</p>
        <p className="text-sky-400/60" style={{ fontSize: '0.85rem' }}>毎朝3時に届きます。</p>
      </div>
    );
  }

  if (oshiList.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sky-700 mb-4">まず、推しを登録しましょう。</p>
        <button onClick={() => navigate('/fan/settings')} className="px-6 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> 推しを登録する
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {/* ── 宛先選択 ── */}
        {phase === 'pick' && (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <h2 className="text-sky-900 text-center">今日の紙飛行機</h2>
            {isSpecial && (
              <motion.div className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl p-4 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-sky-600">✨ 今日は記念日です。特別な折り紙を使えます。</p>
              </motion.div>
            )}
            <div className="space-y-2">
              <label className="text-sky-700" style={{ fontSize: '0.9rem' }}>宛先を選ぶ</label>
              <div className="grid gap-2">
                {oshiList.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { selectOshi(o.id); }}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedOshiId === o.id ? 'border-sky-400 bg-sky-50 shadow-sm shadow-sky-100' : 'border-gray-200 hover:border-sky-200'}`}
                  >
                    <span className="text-sky-800">{o.nickname}</span>
                    <span className="text-sky-400/60 ml-2" style={{ fontSize: '0.8rem' }}>{o.youtubeChannel}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setPhase('write')} disabled={!selectedOshiId} className="w-full py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors disabled:opacity-40">
              用紙を受け取る
            </button>
          </motion.div>
        )}

        {/* ── 折り工程 ── */}
        {isFolding && (
          <motion.div key="folding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <ProgressDots phase={phase} />

            {/* ステップラベル */}
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                className="text-center text-sky-600/80"
                style={{ fontSize: '0.9rem', minHeight: 28 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {STEP_LABELS[phase] ?? `${selectedOshi?.nickname ?? ''}さんへの用紙`}
              </motion.p>
            </AnimatePresence>

            {/* 折り紙ビジュアル */}
            <div className="flex justify-center py-2">
              <OrigamiVisual phase={phase} isSpecial={isSpecial} recipientName={selectedOshi?.nickname ?? ''} />
            </div>

            {/* 操作ボタン */}
            {phase === 'write' && !autoMode ? (
              <div className="flex gap-3">
                <button onClick={() => setAutoMode(true)} className="flex-1 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors">
                  おまかせで折る
                </button>
                <button onClick={advance} className="flex-1 py-3 border border-sky-300 text-sky-600 rounded-full hover:bg-sky-50 transition-colors">
                  一つずつ折る
                </button>
              </div>
            ) : autoMode ? (
              <p className="text-center text-sky-400/70 py-3" style={{ fontSize: '0.85rem' }}>丁寧に折っています…</p>
            ) : (
              <button onClick={advance} className="w-full py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors">
                {phase === 'fold-open' ? '完成！' : '次の折り'}
              </button>
            )}
          </motion.div>
        )}

        {/* ── 完成・飛ばす前 ── */}
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <h2 className="text-center text-sky-900">紙飛行機が完成しました</h2>
            <div className="flex justify-center py-4">
              <CompletedPlane isSpecial={isSpecial} />
            </div>
            <p className="text-center text-sky-600/70" style={{ fontSize: '0.9rem' }}>
              {selectedOshi?.nickname ?? ''}さんへ、想いを込めて飛ばしましょう。
            </p>
            <button onClick={handleFly} className="w-full py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> 飛ばす
            </button>
          </motion.div>
        )}

        {/* ── 飛行アニメーション ── */}
        {phase === 'fly' && (
          <motion.div
            key="fly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden rounded-2xl shadow-xl"
            style={{ height: 420 }}
          >
            <img src={UYUNI_IMG} alt="ウユニ塩湖" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-200/20 via-transparent to-sky-100/10" />

            {/* パーティクル */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-1 h-1 rounded-full bg-white/50"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ opacity: 0, scale: 0, y: 15 }}
                transition={{ duration: 1.2 }}
              />
            ))}

            {/* 紙飛行機 */}
            <motion.div
              className="absolute"
              initial={{ left: '12%', top: '68%', scale: 1, opacity: 1, rotate: -12 }}
              animate={{
                left: ['12%', '35%', '65%', '112%'],
                top: ['68%', '42%', '22%', '8%'],
                scale: [1, 0.85, 0.55, 0.15],
                opacity: [1, 1, 0.85, 0],
                rotate: [-12, -6, 0, 6],
              }}
              transition={{ duration: 3.2, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.3, 0.65, 1] }}
            >
              <svg width="80" height="44" viewBox="0 0 280 140">
                <polygon points="5,70 140,12 140,78" fill={isSpecial ? '#bae6fd' : '#e0f2fe'} stroke="#7dd3fc" strokeWidth="1" />
                <polygon points="275,70 140,12 140,78" fill={isSpecial ? '#bae6fd' : '#e0f2fe'} stroke="#7dd3fc" strokeWidth="1" />
                <polygon points="140,12 132,135 140,78 148,135" fill={isSpecial ? '#dbeafe' : '#f0f9ff'} stroke="#7dd3fc" strokeWidth="0.8" />
              </svg>
            </motion.div>

            {/* 水面のきらめき */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-white/15 to-transparent"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}