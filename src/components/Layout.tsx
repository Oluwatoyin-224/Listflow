import { useState, useEffect, type ReactNode } from 'react';
import { LayoutDashboard, CheckSquare, StickyNote, Menu, X } from 'lucide-react';

export type View = 'dashboard' | 'tasks' | 'notes';

interface NavItem {
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: StickyNote },
];

interface LayoutProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: ReactNode;
}

export function Layout({ currentView, onViewChange, children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900">Listflow</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } lg:block lg:w-64 lg:flex-shrink-0 bg-white border-r border-slate-200 lg:min-h-screen lg:sticky lg:top-0`}
      >
        <div className="hidden lg:flex items-center gap-2.5 px-6 h-16 border-b border-slate-200">
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg leading-none">Listflow</span>
            <p className="text-xs text-slate-500 mt-0.5">Productivity Hub</p>
          </div>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-6 mt-auto pb-6 hidden lg:block">
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
            <p className="text-sm font-semibold">Stay organized</p>
            <p className="text-xs text-slate-300 mt-1">Manage tasks and notes in one place.</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
