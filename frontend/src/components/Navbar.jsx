import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, LogOut, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue-700 to-brand-blue-900 flex items-center justify-center shadow-soft">
            <Clock className="w-5 h-5 text-brand-yellow-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-brand-blue-900 leading-tight">WorkStudy</h1>
            <p className="text-xs text-slate-500 leading-tight">Timesheet Tracker</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/dashboard" className="btn-ghost hidden sm:inline-flex">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          {isAdmin && (
            <Link to="/admin" className="btn-yellow">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-blue-50">
            <div className="w-8 h-8 rounded-full bg-brand-blue-700 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-brand-blue-900">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
