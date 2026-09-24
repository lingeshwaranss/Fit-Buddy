import React, { useState } from 'react';
import {
  Dumbbell,
  Sparkles,
  Wand2,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  CalendarDays,
  Apple,
  MessageSquare,
  Users,
} from 'lucide-react';
import { GeneratePlanResponse } from '../types.ts';

interface WorkoutFormProps {
  onPlanGenerated: (data: GeneratePlanResponse) => void;
  onViewDemoClick: (userId: number) => void;
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onPlanGenerated, onViewDemoClick }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState<string>(() => String(Math.floor(10 + Math.random() * 90)));
  const [age, setAge] = useState<string>('24');
  const [weight, setWeight] = useState<string>('68.0');
  const [goal, setGoal] = useState<string>('I want to lose belly fat and gain muscles');
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('High');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalPresets = [
    'I want to lose belly fat and gain muscles',
    'Hypertrophy and lean muscle gain',
    'Weight loss and cardiovascular stamina',
    'Functional mobility and core flexibility',
    'Strength training and powerlifting basics',
  ];

  const handleFillDemo = (type: 'xyz' | 'shreya') => {
    if (type === 'xyz') {
      setName('xyz');
      setUserId('10');
      setAge('20');
      setWeight('70.0');
      setGoal('I want to lose belly fat and gain muscles');
      setIntensity('High');
    } else {
      setName('shreya');
      setUserId('1');
      setAge('22');
      setWeight('55.0');
      setGoal('muscle gain');
      setIntensity('High');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedUserId = parseInt(userId, 10);
    const parsedAge = parseInt(age, 10);
    const parsedWeight = parseFloat(weight);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      setError('Please enter a valid numeric User ID.');
      return;
    }
    if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 110) {
      setError('Please enter a valid age between 10 and 110.');
      return;
    }
    if (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 300) {
      setError('Please enter a valid weight in kilograms.');
      return;
    }
    if (!goal.trim()) {
      setError('Please enter your fitness goal.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parsedUserId,
          name: name.trim(),
          age: parsedAge,
          weight: parsedWeight,
          goal: goal.trim(),
          intensity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.detail || 'Failed to generate workout plan.');
      }

      onPlanGenerated(data);
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setError(err?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Gym background overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-screen scale-105"
        style={{
          backgroundImage: `url('/gym-bg.svg')`,
          filter: 'blur(1px)',
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-900/90 to-slate-950 z-0" />

      {/* Floating accent elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Quick demo presets bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <span>⚡ Quick Fill from Project Doc:</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('xyz')}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-blue-300 border border-slate-700 hover:border-blue-500/50 transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              <span>User 10 (xyz)</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('shreya')}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              <span>User 1 (shreya)</span>
            </button>
          </div>
        </div>

        {/* Main form card matching PDF page 18 */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/20 p-6 sm:p-8 text-slate-800">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">💪</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              FitBuddy - AI Workout Generator
            </h1>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Name:
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Alex or xyz"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 bg-slate-50/50 text-sm transition-all"
              />
            </div>

            {/* User ID & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="userId" className="block text-xs sm:text-sm font-semibold text-slate-700">
                    User ID:
                  </label>
                  <button
                    type="button"
                    onClick={() => setUserId(String(Math.floor(10 + Math.random() * 990)))}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    🎲 New ID
                  </button>
                </div>
                <input
                  id="userId"
                  type="number"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="e.g., 10"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 bg-slate-50/50 text-sm transition-all"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Age:
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="e.g., 20"
                  min="10"
                  max="100"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 bg-slate-50/50 text-sm transition-all"
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Weight (kg):
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g., 70.0"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 bg-slate-50/50 text-sm transition-all"
              />
            </div>

            {/* Fitness Goal */}
            <div>
              <label htmlFor="goal" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Fitness Goal:
              </label>
              <input
                id="goal"
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g., weight loss, flexibility, muscle gain"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 bg-slate-50/50 text-sm transition-all"
              />

              {/* Goal preset chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {goalPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoal(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Intensity */}
            <div>
              <label htmlFor="intensity" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Workout Intensity:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as const).map(level => {
                  const isSelected = intensity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIntensity(level)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                        isSelected
                          ? level === 'High'
                            ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                            : level === 'Medium'
                            ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="capitalize">{level}</div>
                      <div className="text-[10px] font-normal text-slate-500">
                        {level === 'High' ? 'Intense & Peak' : level === 'Medium' ? 'Balanced Load' : 'Gentle & Steady'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Consulting Gemini AI Coach...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Plan</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer branding */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>AI-Driven day-by-day 7-day schedule + targeted nutrition tip</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {[
            { icon: CalendarDays, label: '7-day plan', detail: 'Structured training days' },
            { icon: Apple, label: 'Nutrition tip', detail: 'Goal-aligned recovery advice' },
            { icon: MessageSquare, label: 'Refine anytime', detail: 'Update plans with feedback' },
            { icon: Users, label: 'Coach view', detail: 'Track every saved profile' },
          ].map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-slate-900/75 px-3 py-3 text-slate-100 backdrop-blur-sm"
            >
              <Icon className="mb-2 h-4 w-4 text-cyan-300" />
              <p className="text-xs font-semibold">{label}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
