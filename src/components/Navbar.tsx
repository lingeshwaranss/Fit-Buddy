import React from 'react';
import { Dumbbell, LayoutDashboard, Sparkles, Flame } from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'result' | 'admin';
  setActiveTab: (tab: 'generator' | 'result' | 'admin') => void;
  userCount: number;
  hasActivePlan: boolean;
  onNewPlanClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userCount,
  hasActivePlan,
  onNewPlanClick,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight bg-linear-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                FitBuddy
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI Fitness Plan & Nutrition Generator</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('result')}
            disabled={!hasActivePlan}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'result'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : hasActivePlan
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-500 opacity-50 cursor-not-allowed'
            }`}
            title={!hasActivePlan ? 'Generate a plan first or view demo' : 'View active workout plan'}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Active Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Admin Dashboard</span>
            <span className="md:hidden">Admin</span>
            {userCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {userCount}
              </span>
            )}
          </button>

        </nav>
      </div>
    </header>
  );
};
