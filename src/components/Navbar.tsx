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
    <header className="sticky top-0 z-50 bg-[#183b31] border-b border-[#315649] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
          <div className="w-10 h-10 rounded-lg bg-[#cbdc68] flex items-center justify-center shadow-lg shadow-black/15">
            <Dumbbell className="w-5 h-5 text-[#183b31]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight text-white">
                FitBuddy
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-[#e0eb9b] border border-white/15">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-[#c2d0c8] hidden sm:block">AI Fitness Plan & Nutrition Generator</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            aria-label="Generate Plan"
            className={`px-2 py-2 sm:px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'bg-[#cbdc68] text-[#183b31] shadow-md shadow-black/15'
                : 'text-[#d3dfd7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="sr-only sm:not-sr-only">Generate Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('result')}
            disabled={!hasActivePlan}
            aria-label="Active Plan"
            className={`px-2 py-2 sm:px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'result'
                ? 'bg-[#cbdc68] text-[#183b31] shadow-md shadow-black/15'
                : hasActivePlan
                ? 'text-[#d3dfd7] hover:text-white hover:bg-white/10'
                : 'text-slate-500 opacity-50 cursor-not-allowed'
            }`}
            title={!hasActivePlan ? 'Generate a plan first or view demo' : 'View active workout plan'}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="sr-only sm:not-sr-only">Active Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            aria-label="Admin Dashboard"
            className={`px-2 py-2 sm:px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-[#cbdc68] text-[#183b31] shadow-md shadow-black/15'
                : 'text-[#d3dfd7] hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span className="sr-only sm:not-sr-only md:hidden">Admin</span>
            <span className="hidden md:inline">Admin Dashboard</span>
            {userCount > 0 && (
              <span className="ml-1 hidden rounded bg-white/10 px-1.5 py-0.5 text-xs text-[#d3dfd7] sm:inline">
                {userCount}
              </span>
            )}
          </button>

        </nav>
      </div>
    </header>
  );
};
