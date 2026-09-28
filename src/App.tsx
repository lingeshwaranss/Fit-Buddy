import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { WorkoutForm } from './components/WorkoutForm.tsx';
import { PlanResult } from './components/PlanResult.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { GeneratePlanResponse, WorkoutPlanRecord } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'result' | 'admin'>('generator');
  const [activePlan, setActivePlan] = useState<GeneratePlanResponse | null>(null);
  const [userCount, setUserCount] = useState<number>(3);

  // Pre-load default initial plan (User 10 "xyz" from PDF documentation)
  useEffect(() => {
    fetch('/api/users/10')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user && data.plan) {
          setActivePlan({
            success: true,
            message: 'Default profile loaded',
            user: data.user,
            plan: data.plan,
            workout_plan: data.plan.updated_plan || data.plan.original_plan,
            nutrition_tip: data.plan.nutrition_tip,
            user_id: data.user.id,
            username: data.user.name,
            age: data.user.age,
            weight: data.user.weight,
            goal: data.user.goal,
            intensity: data.user.intensity,
          });
        }
      })
      .catch(err => {
        console.warn('Initial user load notice:', err);
      });

    // Refresh user count
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.users)) {
          setUserCount(data.users.length);
        }
      })
      .catch(() => {});
  }, []);

  const handlePlanGenerated = (data: GeneratePlanResponse) => {
    setActivePlan(data);
    setActiveTab('result');

    fetch('/api/users')
      .then(res => res.json())
      .then(usersData => {
        if (usersData.success && Array.isArray(usersData.users)) {
          setUserCount(usersData.users.length);
        }
      })
      .catch(() => {});
  };

  const handlePlanUpdated = (updatedData: { updated_plan: string; planRecord: WorkoutPlanRecord }) => {
    if (!activePlan) return;
    setActivePlan({
      ...activePlan,
      plan: updatedData.planRecord,
      workout_plan: updatedData.updated_plan,
    });
  };

  const handleSelectUserFromAdmin = (userData: GeneratePlanResponse) => {
    setActivePlan(userData);
    setActiveTab('result');
  };

  const handleResetToForm = () => {
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-(--paper) text-(--ink) flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userCount={userCount}
        hasActivePlan={Boolean(activePlan)}
        onNewPlanClick={handleResetToForm}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'generator' && (
          <WorkoutForm
            onPlanGenerated={handlePlanGenerated}
            onViewDemoClick={(userId) => {
              fetch(`/api/users/${userId}`)
                .then(r => r.json())
                .then(d => {
                  if (d.success) {
                    handleSelectUserFromAdmin({
                      success: true,
                      message: 'Loaded user',
                      user: d.user,
                      plan: d.plan,
                      workout_plan: d.plan.updated_plan || d.plan.original_plan,
                      nutrition_tip: d.plan.nutrition_tip,
                      user_id: d.user.id,
                      username: d.user.name,
                      age: d.user.age,
                      weight: d.user.weight,
                      goal: d.user.goal,
                      intensity: d.user.intensity,
                    });
                  }
                });
            }}
          />
        )}

        {activeTab === 'result' && activePlan && (
          <PlanResult
            planData={activePlan}
            onPlanUpdated={handlePlanUpdated}
            onReset={handleResetToForm}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onSelectUserForInspection={handleSelectUserFromAdmin}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-(--paper) border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>FitBuddy – AI Fitness Plan Generator using Gemini 2.5 Pro & Flash Models</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('generator')} className="hover:text-slate-300">
              Generator
            </button>
            <button onClick={() => setActiveTab('admin')} className="hover:text-slate-300">
              Admin View (/view-all-users)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
