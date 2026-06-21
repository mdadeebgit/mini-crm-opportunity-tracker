import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            CRM
          </span>
          <span className="text-lg font-semibold text-slate-800">Opportunity Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">
            Hi, <span className="font-medium text-slate-800">{user?.name}</span>
          </span>
          <button type="button" className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
