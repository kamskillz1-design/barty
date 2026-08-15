import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Compass, Package, ArrowLeftRight, User, LogOut, Sparkles, ShieldCheck } from 'lucide-react';

export default function Layout() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { setLang, lang } = useI18n();
  const location = useLocation();

  // Sync UI language to the user's saved preference
  useEffect(() => {
    if (user?.preferred_language && user.preferred_language !== lang) {
      setLang(user.preferred_language);
    }
  }, [user]);

  const links = [
    { to: '/explore', label: t.nav.explore, icon: Compass },
    { to: '/my-listings', label: t.nav.myListings, icon: Package },
    { to: '/trades', label: t.nav.trades, icon: ArrowLeftRight },
    { to: '/safe-spots', label: t.nav.hubs, icon: ShieldCheck },
    { to: '/profile', label: t.nav.profile, icon: User }
  ];

  const isActive = (path) => location.pathname === path || (path === '/explore' && location.pathname === '/');

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/explore" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{t.appName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive(l.to) ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => logout(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              title={t.profile.logout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex items-stretch justify-around px-2 py-2">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition ${isActive(l.to) ? 'text-sky-600' : 'text-slate-500'}`}
              >
                <Icon className="h-5 w-5" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}