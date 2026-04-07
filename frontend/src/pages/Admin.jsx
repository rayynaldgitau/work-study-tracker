import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, MapPin, Clock, AlertCircle, Plus, Trash2, Loader2 } from 'lucide-react';

const COLORS = ['#1d4ed8', '#facc15', '#3b82f6', '#eab308', '#1e3a8a', '#fde047'];

export default function Admin() {
  const [students, setStudents] = useState([]);
  const [stations, setStations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [overview, setOverview] = useState({ byStation: [], weekly: [], counts: {} });
  const [newStation, setNewStation] = useState({ name: '', description: '', department_id: '' });
  const [creating, setCreating] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [s, st, d, ov] = await Promise.all([
        api.get('/admin/students'),
        api.get('/stations'),
        api.get('/departments'),
        api.get('/admin/overview'),
      ]);
      setStudents(s.data);
      setStations(st.data);
      setDepartments(d.data);
      setOverview(ov.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const allocate = async (studentId, station_id, weekly_hour_limit) => {
    try {
      await api.put(`/admin/students/${studentId}/allocate`, { station_id, weekly_hour_limit });
      loadAll();
    } catch {
      alert('Failed to update allocation');
    }
  };

  const createStation = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/stations', newStation);
      setNewStation({ name: '', description: '', department_id: '' });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create station');
    } finally {
      setCreating(false);
    }
  };

  const deleteStation = async (id) => {
    if (!confirm('Delete this station? Students assigned here will be unallocated.')) return;
    try {
      await api.delete(`/stations/${id}`);
      loadAll();
    } catch {
      alert('Failed to delete');
    }
  };

  const weeklyFmt = overview.weekly.map((w) => ({
    week: new Date(w.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    hours: Number(w.hours),
  }));

  const pieData = overview.byStation.filter((s) => Number(s.hours) > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-blue-900">Admin Panel</h2>
          <p className="text-slate-500">Manage stations, allocate students, and monitor activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Users} label="Students" value={overview.counts.total_students || 0} accent="blue" />
          <StatCard icon={MapPin} label="Stations" value={overview.counts.total_stations || 0} accent="yellow" />
          <StatCard icon={Clock} label="Total Hours" value={Number(overview.counts.total_hours || 0).toFixed(0)} accent="white" />
          <StatCard icon={AlertCircle} label="Unallocated" value={overview.counts.unallocated || 0} accent="white" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-brand-blue-900 mb-4">Hours by Station</h3>
            {pieData.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-sm">No shift data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="hours"
                    nameKey="station"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3 className="font-bold text-brand-blue-900 mb-4">Weekly Activity (All Students)</h3>
            {weeklyFmt.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyFmt} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#facc15" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} cursor={{ fill: '#eff6ff' }} />
                  <Bar dataKey="hours" fill="url(#adminBar)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stations management */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-brand-blue-900">Work Stations</h3>
              <p className="text-sm text-slate-500">Create and manage stations</p>
            </div>
          </div>

          <form onSubmit={createStation} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <input
              placeholder="Station name"
              className="input"
              value={newStation.name}
              onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
              required
            />
            <input
              placeholder="Description"
              className="input"
              value={newStation.description}
              onChange={(e) => setNewStation({ ...newStation, description: e.target.value })}
            />
            <select
              className="input"
              value={newStation.department_id}
              onChange={(e) => setNewStation({ ...newStation, department_id: e.target.value })}
            >
              <option value="">— Department —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button type="submit" disabled={creating} className="btn-yellow disabled:opacity-50">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Station
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stations.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 hover:border-brand-blue-300 transition group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-brand-blue-900 truncate">{s.name}</h4>
                    {s.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{s.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {s.department_name && (
                        <span className="badge bg-brand-blue-50 text-brand-blue-700">{s.department_name}</span>
                      )}
                      <span className="badge bg-brand-yellow-100 text-brand-yellow-600">
                        {s.student_count} student{s.student_count != 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteStation(s.id)}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student allocation */}
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-brand-blue-900">Student Allocations</h3>
            <p className="text-sm text-slate-500">Assign students to stations and set weekly limits</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Student</th>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-6 py-3 text-left font-semibold">Station</th>
                  <th className="px-6 py-3 text-right font-semibold">This Week</th>
                  <th className="px-6 py-3 text-right font-semibold">Total</th>
                  <th className="px-6 py-3 text-right font-semibold">Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 && (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No students registered yet</td></tr>
                )}
                {students.map((s) => {
                  const cw = Number(s.current_week_hours);
                  const lim = Number(s.weekly_hour_limit);
                  const over = cw > lim;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-blue-700 text-white flex items-center justify-center font-bold text-xs">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-brand-blue-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{s.email}</td>
                      <td className="px-6 py-4">
                        <select
                          className="input py-1.5 text-sm"
                          value={s.station_id || ''}
                          onChange={(e) => allocate(s.id, e.target.value, s.weekly_hour_limit)}
                        >
                          <option value="">— None —</option>
                          {stations.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${over ? 'text-red-600' : 'text-brand-blue-900'}`}>
                          {cw.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-brand-blue-900">
                        {Number(s.total_hours).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          className="input py-1.5 text-sm w-20 text-right"
                          defaultValue={s.weekly_hour_limit}
                          onBlur={(e) => allocate(s.id, s.station_id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
