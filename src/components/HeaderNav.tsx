import React from 'react';
import { Shield, FileText, Database, Lock, LogOut, Terminal, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentRoute, navigate }) => {
  const { session, logout } = useAuth();

  return (
    <header className="border-b border-neutral-800 bg-black text-white sticky top-0 z-50">
      {/* Top classification banner */}
      <div className="border-b border-neutral-900 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs tracking-wider text-neutral-400 uppercase font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-white animate-pulse" />
          <span>CAMPUS CENTRAL EVIDENCE &amp; RECOVERY SYSTEM // SYSTEM ARCHITECTURE: NOIR JUSTICE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>ZERO-TRUST SEC: STRICT</span>
          {session.isAdmin ? (
            <span className="bg-white text-black font-bold px-1.5 py-0.5 tracking-tight">
              AUTH: {session.officerBadge} [ADMIN CLEARANCE]
            </span>
          ) : (
            <span className="border border-neutral-700 px-1.5 py-0.5 text-neutral-400">
              CLEARANCE: TIER-1 PUBLIC
            </span>
          )}
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand identity */}
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer flex items-center gap-3 group"
          id="nav-brand-button"
        >
          <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center font-mono text-sm group-hover:bg-neutral-200 transition-colors">
            NJ
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white uppercase flex items-center gap-2 font-mono">
              LOST &amp; FOUND DIRECTORY
              <span className="text-[10px] text-neutral-500 font-normal">v4.0.2</span>
            </h1>
            <p className="text-[11px] text-neutral-400 font-mono tracking-wide">
              INSTITUTIONAL LEDGER &bull; BLIND ADJUDICATION PROTOCOL
            </p>
          </div>
        </div>

        {/* Route Navigation links */}
        <nav className="flex flex-wrap items-center gap-1 font-mono text-xs">
          <button
            id="nav-home"
            onClick={() => navigate('/')}
            className={`px-3 py-1.5 border transition-colors ${
              currentRoute === '/' 
                ? 'border-white bg-white text-black font-bold' 
                : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
            }`}
          >
            01. DISPATCH
          </button>

          <button
            id="nav-report"
            onClick={() => navigate('/report')}
            className={`px-3 py-1.5 border transition-colors flex items-center gap-1.5 ${
              currentRoute === '/report' 
                ? 'border-white bg-white text-black font-bold' 
                : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            02. LODGE TICKET
          </button>

          <button
            id="nav-ledger"
            onClick={() => navigate('/ledger')}
            className={`px-3 py-1.5 border transition-colors flex items-center gap-1.5 ${
              currentRoute === '/ledger' 
                ? 'border-white bg-white text-black font-bold' 
                : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            03. PUBLIC LEDGER
          </button>

          <button
            id="nav-admin"
            onClick={() => navigate(session.isAdmin ? '/admin/dashboard' : '/admin/login')}
            className={`px-3 py-1.5 border transition-colors flex items-center gap-1.5 ${
              currentRoute.startsWith('/admin')
                ? 'border-white bg-white text-black font-bold'
                : session.isAdmin
                ? 'border-neutral-600 text-white hover:border-white'
                : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            04. COMMAND CENTER
            {!session.isAdmin && <Lock className="w-3 h-3 text-neutral-500 ml-0.5" />}
          </button>

          {session.isAdmin ? (
            <button
              id="nav-logout"
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              title="Terminate Security Session"
              className="px-2.5 py-1.5 border border-neutral-800 text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="nav-login-btn"
              onClick={() => navigate('/admin/login')}
              className={`px-3 py-1.5 border transition-colors ${
                currentRoute === '/admin/login'
                  ? 'border-white bg-white text-black font-bold'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
              }`}
            >
              LOGIN
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
