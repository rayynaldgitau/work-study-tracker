import { Trash2, Calendar } from 'lucide-react';
import api from '../api/client';

export default function ShiftTable({ shifts, onDeleted }) {
  const handleDelete = async (id) => {
    if (!confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      onDeleted();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (!shifts.length) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue-50 flex items-center justify-center mb-3">
          <Calendar className="w-7 h-7 text-brand-blue-700" />
        </div>
        <h3 className="font-bold text-brand-blue-900">No shifts yet</h3>
        <p className="text-sm text-slate-500 mt-1">Log your first shift using the form above.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-brand-blue-900">Recent Shifts</h3>
        <span className="badge bg-brand-blue-50 text-brand-blue-700">{shifts.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Clock In</th>
              <th className="px-6 py-3 text-left font-semibold">Clock Out</th>
              <th className="px-6 py-3 text-left font-semibold">Station</th>
              <th className="px-6 py-3 text-left font-semibold">Task</th>
              <th className="px-6 py-3 text-right font-semibold">Hours</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shifts.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-slate-700">{new Date(s.clock_in).toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-700">{new Date(s.clock_out).toLocaleString()}</td>
                <td className="px-6 py-4">
                  {s.station_name ? (
                    <span className="badge bg-brand-yellow-100 text-brand-yellow-600">{s.station_name}</span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{s.task_description || '—'}</td>
                <td className="px-6 py-4 text-right font-bold text-brand-blue-900">{Number(s.total_hours).toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
