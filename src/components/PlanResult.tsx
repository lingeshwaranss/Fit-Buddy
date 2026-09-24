import React, { useState } from 'react';
import {
  CheckCircle2,
  Send,
  Sparkles,
  Printer,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  Flame,
  Apple,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GeneratePlanResponse, WorkoutPlanRecord } from '../types.ts';

interface PlanResultProps {
  planData: GeneratePlanResponse;
  onPlanUpdated: (updatedData: { updated_plan: string; planRecord: WorkoutPlanRecord }) => void;
  onReset: () => void;
}

export const PlanResult: React.FC<PlanResultProps> = ({ planData, onPlanUpdated, onReset }) => {
  const [feedback, setFeedback] = useState('');
  const [feedbackUserId, setFeedbackUserId] = useState(String(planData.user_id));
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [activePlanTab, setActivePlanTab] = useState<'current' | 'original' | 'compare'>('current');
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('raw');
  const [copied, setCopied] = useState(false);

  // Quick feedback prompts matching the PDF scenarios
  const quickFeedbacks = [
    'Add yoga and mobility drills on rest days',
    'More focus on high-intensity cardio',
    'Include more rest days for recovery',
    'Adjust for home workout with dumbbells only',
    'Knee-friendly modifications: less high impact jumping',
  ];

  const currentPlanText = planData.plan?.updated_plan || planData.workout_plan;
  const originalPlanText = planData.plan?.original_plan || planData.workout_plan;
  const hasUpdatedPlan = Boolean(planData.plan?.updated_plan);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPlanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(false);

    const parsedId = parseInt(feedbackUserId, 10);
    if (isNaN(parsedId)) {
      setFeedbackError('Please enter a valid numeric User ID.');
      return;
    }
    if (!feedback.trim()) {
      setFeedbackError('Please enter your feedback suggestions.');
      return;
    }

    setSubmittingFeedback(true);

    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parsedId,
          feedback: feedback.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.detail || 'Failed to update plan.');
      }

      setFeedbackSuccess(true);
      setFeedback('');
      setActivePlanTab('current');

      onPlanUpdated({
        updated_plan: data.updated_plan,
        planRecord: data.plan,
      });

      // Scroll to confirmation alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      setFeedbackError(err?.message || 'Failed to update workout plan with feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-slate-950 -z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30 mix-blend-screen scale-105 -z-10"
        style={{
          backgroundImage: `url('/gym-bg.svg')`,
          filter: 'blur(1px)',
        }}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-white">
          <button
            onClick={onReset}
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Generate New Plan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* Feedback Success Confirmation Banner (matching PDF page 21) */}
        {feedbackSuccess && (
          <div className="bg-emerald-500/15 border-2 border-emerald-500/40 rounded-xl p-4 text-emerald-300 flex items-center gap-3 shadow-lg shadow-emerald-950/40 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-base text-white">Your plan has been updated based on your feedback!</p>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Gemini AI has adjusted your routines while preserving your core progress targets.
              </p>
            </div>
          </div>
        )}

        {/* Header Heading matching PDF page 19 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Customized Routine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2.5">
            <span>🏋️</span>
            <span>Your Personalized Workout Plan</span>
          </h1>
        </div>

        {/* 1. User Information Card matching PDF page 19 */}
        <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sm:p-7 text-slate-800">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600">👤</span>
              <span>User Information</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              User ID #{planData.user_id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</span>
              <span className="font-bold text-slate-900 text-base">{planData.username}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</span>
              <span className="font-bold text-blue-600 text-base">{planData.user_id}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</span>
              <span className="font-bold text-slate-900 text-base">{planData.age} yrs</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</span>
              <span className="font-bold text-slate-900 text-base">{planData.weight} kg</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Intensity</span>
              <span
                className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  planData.intensity === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : planData.intensity === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {planData.intensity}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-3">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Fitness Goal</span>
              <span className="font-semibold text-slate-800 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 inline-block mt-1">
                🎯 {planData.goal}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Workout Plan Section matching PDF pages 19-20 */}
        <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sm:p-7 text-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              <span>Workout Plan</span>
            </h2>

            {/* Plan tabs: Current vs Original vs Compare */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActivePlanTab('current')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activePlanTab === 'current' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hasUpdatedPlan ? 'Updated Plan' : 'Active Plan'}
              </button>

              {hasUpdatedPlan && (
                <button
                  onClick={() => setActivePlanTab('original')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activePlanTab === 'original' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Original Plan
                </button>
              )}

              {hasUpdatedPlan && (
                <button
                  onClick={() => setActivePlanTab('compare')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activePlanTab === 'compare' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Side-by-Side
                </button>
              )}
            </div>
          </div>

          {/* Side-by-side comparison view */}
          {activePlanTab === 'compare' && hasUpdatedPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 mb-1.5">
                  <span>📌 Original Generated Plan</span>
                  <span className="text-slate-500 font-normal">Version 1</span>
                </div>
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {originalPlanText}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 px-1 mb-1.5">
                  <span>✨ Updated Plan (With Feedback)</span>
                  <span className="text-emerald-600 font-normal">Active Version</span>
                </div>
                <pre className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-900 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {currentPlanText}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              {/* Note banner if viewing updated plan */}
              {activePlanTab === 'current' && hasUpdatedPlan && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
                  <span className="font-medium">
                    ⚡ Showing plan revised with your feedback: "{planData.plan.last_feedback}"
                  </span>
                  <button
                    onClick={() => setActivePlanTab('original')}
                    className="underline text-blue-600 font-semibold ml-2 hover:text-blue-800"
                  >
                    View Original
                  </button>
                </div>
              )}

              {/* Exact <pre> block rendering as specified in the PDF */}
              <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[550px] overflow-y-auto shadow-inner">
                {activePlanTab === 'original' ? originalPlanText : currentPlanText}
              </pre>
            </div>
          )}
        </div>

        {/* 3. Nutrition Tip Card matching PDF page 21 */}
        <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sm:p-7 text-slate-800">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <span className="text-amber-500 text-xl">💡</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Nutrition & Recovery Tip</h2>
          </div>

          <div className="bg-emerald-50/70 border-l-4 border-emerald-500 rounded-r-xl p-4 sm:p-5">
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
              {planData.nutrition_tip}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-2.5 italic">
            * Generated by Gemini Flash for high-speed, targeted dietary insights aligned with "{planData.goal}".
          </p>
        </div>

        {/* 4. Feedback Section matching PDF page 21 */}
        <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sm:p-7 text-slate-800">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-200">
            <span className="text-blue-600 text-xl">📣</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Share Your Feedback</h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            Suggest changes like <em>"more focus on cardio"</em>, <em>"add yoga"</em>, or <em>"include more rest days"</em>.
            Gemini AI will intelligently regenerate and preserve your updated workout plan.
          </p>

          {feedbackError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
              {feedbackError}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedbackUserId" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Your Unique User ID:
              </label>
              <input
                id="feedbackUserId"
                type="number"
                value={feedbackUserId}
                onChange={e => setFeedbackUserId(e.target.value)}
                placeholder="Enter the same User ID used to generate your plan"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 bg-slate-50 text-sm font-medium"
              />
            </div>

            <div>
              <label htmlFor="feedback" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Your Feedback:
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Let us know how we can improve your plan..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 bg-slate-50 text-sm leading-relaxed"
              />

              {/* Quick feedback suggestion chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium py-1">Quick Suggestions:</span>
                {quickFeedbacks.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFeedback(item)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all ${
                submittingFeedback
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
              }`}
            >
              {submittingFeedback ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Regenerating Updated Plan with Gemini...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
