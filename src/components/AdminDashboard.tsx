import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Trash2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  FileText,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { MergedUserView, GeneratePlanResponse } from '../types.ts';

interface AdminDashboardProps {
  onSelectUserForInspection: (userData: GeneratePlanResponse) => void;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectUserForInspection }) => {
  const [users, setUsers] = useState<MergedUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [intensityFilter, setIntensityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Updated' | 'OriginalOnly'>('All');

  // Modal inspection state
  const [modalUser, setModalUser] = useState<MergedUserView | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      console.error('Error fetching users for admin:', err);
      setError(err?.message || 'Failed to connect to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setDeleteConfirmId(null);
        if (modalUser?.id === userId) setModalUser(null);
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset database to default project demo users (xyz, shreya, Marcus)?')) return;
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
      }
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(user.id).includes(searchQuery);

    const matchesIntensity = intensityFilter === 'All' || user.intensity === intensityFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Updated' && user.has_updated_plan) ||
      (statusFilter === 'OriginalOnly' && !user.has_updated_plan);

    return matchesSearch && matchesIntensity && matchesStatus;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header matching PDF page 22 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>📋</span>
                <span>FitBuddy - All Users & Workout Plans</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Admin view to track registered profiles, compare original & updated AI plans, and monitor client progress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo DB</span>
            </button>
            <button
              onClick={fetchUsers}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Total Registered Users</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">{users.length}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Updated Plans (With Feedback)</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              {users.filter(u => u.has_updated_plan).length}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">High Intensity Athletes</span>
            <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
              {users.filter(u => u.intensity === 'High').length}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Avg User Weight</span>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1">
              {users.length > 0 ? (users.reduce((acc, u) => acc + u.weight, 0) / users.length).toFixed(1) : 0} kg
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, or goal..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Intensity:</span>
            </div>
            <select
              value={intensityFilter}
              onChange={e => setIntensityFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none"
            >
              <option value="All">All Intensities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Updated">With Feedback Updates</option>
              <option value="OriginalOnly">Original Plans Only</option>
            </select>
          </div>
        </div>

        {/* Main Users Table matching PDF page 22 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading registered user database...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-300">No users match your criteria</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or reset demo records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white font-semibold border-b border-blue-700">
                    <th className="py-3.5 px-4 w-16 text-center">User ID</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-3 w-16">Age</th>
                    <th className="py-3.5 px-3 w-24">Weight</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Goal</th>
                    <th className="py-3.5 px-3 w-24">Intensity</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Original Plan</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Updated Plan</th>
                    <th className="py-3.5 px-4 w-28 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map(user => {
                    const isUpdated = user.has_updated_plan;
                    return (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* User ID */}
                        <td className="py-3 px-4 font-bold text-blue-400 text-center">{user.id}</td>

                        {/* Name */}
                        <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                          {user.name}
                        </td>

                        {/* Age */}
                        <td className="py-3 px-3 text-slate-300">{user.age}</td>

                        {/* Weight */}
                        <td className="py-3 px-3 text-slate-300 font-mono">{user.weight} kg</td>

                        {/* Goal */}
                        <td className="py-3 px-4 text-slate-300">
                          <span className="line-clamp-2" title={user.goal}>
                            {user.goal}
                          </span>
                        </td>

                        {/* Intensity */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              user.intensity === 'High'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : user.intensity === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {user.intensity}
                          </span>
                        </td>

                        {/* Original Plan matching PDF <pre> */}
                        <td className="py-3 px-4">
                          <div className="relative group">
                            <pre className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto w-72">
                              {user.original_plan}
                            </pre>
                            <button
                              onClick={() => setModalUser(user)}
                              className="absolute top-2 right-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Full Screen View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Updated Plan matching PDF <pre> */}
                        <td className="py-3 px-4">
                          <div className="relative group">
                            {isUpdated ? (
                              <>
                                <pre className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed text-emerald-200/90 whitespace-pre-wrap max-h-36 overflow-y-auto w-72">
                                  {user.updated_plan}
                                </pre>
                                <button
                                  onClick={() => setModalUser(user)}
                                  className="absolute top-2 right-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Full Screen View"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 text-slate-500 text-xs italic w-72 text-center">
                                Not updated yet
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                onSelectUserForInspection({
                                  success: true,
                                  message: 'Loaded from admin database',
                                  user: {
                                    id: user.id,
                                    name: user.name,
                                    age: user.age,
                                    weight: user.weight,
                                    goal: user.goal,
                                    intensity: user.intensity,
                                    created_at: user.created_at,
                                  },
                                  plan: {
                                    user_id: user.id,
                                    original_plan: user.original_plan,
                                    updated_plan: user.updated_plan,
                                    nutrition_tip: user.nutrition_tip,
                                    last_feedback: user.last_feedback,
                                    created_at: user.created_at,
                                  },
                                  workout_plan: user.updated_plan || user.original_plan,
                                  nutrition_tip: user.nutrition_tip,
                                  user_id: user.id,
                                  username: user.name,
                                  age: user.age,
                                  weight: user.weight,
                                  goal: user.goal,
                                  intensity: user.intensity,
                                });
                              }}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition-colors"
                              title="Open in Active Plan / Feedback"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {deleteConfirmId === user.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-[10px] px-1.5 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                                  title="Confirm delete"
                                >
                                  Del
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-[10px] px-1.5 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(user.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-colors"
                                title="Delete user record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for full inspection */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h3 className="font-bold text-lg text-white">
                  User #{modalUser.id} – {modalUser.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {modalUser.age} yrs | {modalUser.weight} kg | Goal: {modalUser.goal} | Intensity: {modalUser.intensity}
                </p>
              </div>
              <button
                onClick={() => setModalUser(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Original Plan
                  </h4>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {modalUser.original_plan}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                    Updated Plan {modalUser.has_updated_plan ? '(With Feedback)' : ''}
                  </h4>
                  {modalUser.has_updated_plan ? (
                    <pre className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 font-mono text-xs text-emerald-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {modalUser.updated_plan}
                    </pre>
                  ) : (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs italic">
                      No feedback has been submitted for this user yet.
                    </div>
                  )}
                </div>
              </div>

              {modalUser.nutrition_tip && (
                <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-4">
                  <span className="text-xs font-bold text-blue-400 block mb-1">💡 Nutrition Tip</span>
                  <p className="text-xs text-slate-300">{modalUser.nutrition_tip}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setModalUser(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
