import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Images, Newspaper, Settings, LogOut, ExternalLink, Users } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminLoginPath, adminPath } from '../../lib/adminGate';

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to={adminLoginPath()} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate(adminLoginPath());
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
      isActive ? 'bg-academy-green text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-academy-gold mb-1">Admin</p>
          <h1 className="text-lg font-bold text-academy-green leading-tight">GC Peshawar Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to={adminPath()} end className={linkClass}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to={adminPath('gallery')} className={linkClass}>
            <Images size={18} /> Gallery
          </NavLink>
          <NavLink to={adminPath('news')} className={linkClass}>
            <Newspaper size={18} /> News
          </NavLink>
          <NavLink to={adminPath('students')} className={linkClass}>
            <Users size={18} /> Students
          </NavLink>
          <NavLink to={adminPath('site')} className={linkClass}>
            <Settings size={18} /> Site settings
          </NavLink>
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <a
            href="#/"
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
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
