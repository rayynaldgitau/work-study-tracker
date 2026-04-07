import { useState, useEffect } from 'react';
import api from '../api/client';
import { Plus, Loader2 } from 'lucide-react';

export default function ShiftForm({ onAdded }) {
  const [form, setForm] = useState({ clock_in: '', clock_out: '', task_description: '', station_id: '' });
  const [stations, setStations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/stations').then((r) => setStations(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/shifts', form);
      setForm({ clock_in: '', clock_out: '', task_description: '', station_id: '' });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-brand-blue-900">Log a New Shift</h3>
          <p className="text-sm text-slate-500">Record your hours worked today</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-yellow-100 flex items-center justify-center">
          <Plus className="w-5 h-5 text-brand-yellow-600" />
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Clock In</label>
            <input
              type="datetime-local"
              className="input"
              value={form.clock_in}
              onChange={(e) => setForm({ ...form, clock_in: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Clock Out</label>
            <input
              type="datetime-local"
              className="input"
              value={form.clock_out}
              onChange={(e) => setForm({ ...form, clock_out: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Station</label>
          <select
            className="input"
            value={form.station_id}
            onChange={(e) => setForm({ ...form, station_id: e.target.value })}
          >
            <option value="">— Use my assigned station —</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Task Description</label>
          <textarea
            placeholder="What did you work on?"
            className="input resize-none"
            rows="3"
            value={form.task_description}
            onChange={(e) => setForm({ ...form, task_description: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Add Shift'}
        </button>
      </form>
    </div>
  );
}
