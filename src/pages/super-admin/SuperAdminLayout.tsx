import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, UserPlus } from 'lucide-react';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';
import { superAdminLoginPath } from '../../lib/superAdminGate';

export default function SuperAdminLayout() {
  const { isAuthenticated, logout } = useSuperAdminAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to={superAdminLoginPath()} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate(superAdminLoginPath());
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-academy-green/10 p-2 rounded-xl shrink-0">
              <UserPlus className="text-academy-green" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-academy-gold leading-none mb-0.5">
                Super Admin
              </p>
              <p className="text-sm font-bold text-academy-green truncate">Create Student Profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 shrink-0"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 sm:p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
