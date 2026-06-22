import { useAuth } from '../context/AuthContext.jsx';
import { LogoutIcon } from './icons.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
            C
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-semibold text-slate-800 sm:text-base">Opportunity Tracker</span>
            <span className="hidden text-xs text-slate-400 sm:block">Shared sales pipeline</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user?.name}</span>
          </div>
          <button type="button" className="btn-secondary !px-2.5 sm:!px-4" onClick={logout} title="Logout">
            <LogoutIcon className="sm:mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
