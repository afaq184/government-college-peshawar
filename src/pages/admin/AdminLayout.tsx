import { useEffect, useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Images,
  Newspaper,
  Settings,
  LogOut,
  ExternalLink,
  Users,
  UserX,
  Menu,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminLoginPath, adminPath } from '../../lib/adminGate';

function AdminSidebar({
  onNavigate,
  onClose,
  showClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
  showClose?: boolean;
}) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(adminLoginPath());
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
      isActive ? 'bg-academy-green text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <>
      <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-academy-gold mb-1">Admin</p>
          <h1 className="text-lg font-bold text-academy-green leading-tight">GC Peshawar Admin</h1>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 -mt-1 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink to={adminPath()} end className={linkClass} onClick={onNavigate}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to={adminPath('gallery')} className={linkClass} onClick={onNavigate}>
          <Images size={18} /> Gallery
        </NavLink>
        <NavLink to={adminPath('news')} className={linkClass} onClick={onNavigate}>
          <Newspaper size={18} /> News
        </NavLink>
        <NavLink to={adminPath('students')} className={linkClass} onClick={onNavigate}>
          <Users size={18} /> Students
        </NavLink>
        <NavLink to={adminPath('deleted-students')} className={linkClass} onClick={onNavigate}>
          <UserX size={18} /> Deleted Students
        </NavLink>
        <NavLink to={adminPath('site')} className={linkClass} onClick={onNavigate}>
          <Settings size={18} /> Site settings
        </NavLink>
      </nav>
      <div className="p-4 border-t border-slate-100 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
        >
          <ExternalLink size={18} /> View website
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  if (!isAuthenticated) {
    return <Navigate to={adminLoginPath()} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop sidebar — same as before */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <AdminSidebar />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(18rem,85vw)] max-w-full bg-white shadow-xl flex flex-col">
            <AdminSidebar
              showClose
              onClose={() => setMenuOpen(false)}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-academy-gold leading-none mb-0.5">
              Admin
            </p>
            <p className="text-sm font-bold text-academy-green truncate">GC Peshawar Admin</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
