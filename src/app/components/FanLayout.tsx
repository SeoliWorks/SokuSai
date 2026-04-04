import { Outlet, NavLink, useNavigate } from 'react-router';
import { Home, Stamp, Settings, LogOut } from 'lucide-react';
import { Toaster } from 'sonner';

function PaperPlaneSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M4 32L28 24L60 8L36 36L28 24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 24L32 52L36 36L60 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function FanLayout() {
  const navigate = useNavigate();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive ? 'bg-sky-100 text-sky-700' : 'text-sky-500/70 hover:text-sky-700 hover:bg-sky-50'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Toaster position="top-center" />
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sky-700">
            <PaperPlaneSVG className="w-6 h-6" />
            <span className="tracking-widest" style={{ fontSize: '0.9rem' }}>SokuSai</span>
          </button>
          <nav className="flex items-center gap-1">
            <NavLink to="/fan" end className={linkClass}>
              <Home className="w-4 h-4" /> <span className="hidden sm:inline">ホーム</span>
            </NavLink>
            <NavLink to="/fan/stamp" className={linkClass}>
              <Stamp className="w-4 h-4" /> <span className="hidden sm:inline">スタンプ</span>
            </NavLink>
            <NavLink to="/fan/settings" className={linkClass}>
              <Settings className="w-4 h-4" /> <span className="hidden sm:inline">設定</span>
            </NavLink>
            <button aria-label="ログアウト" onClick={() => navigate('/')} className="ml-2 p-2 text-sky-400 hover:text-sky-600">
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
