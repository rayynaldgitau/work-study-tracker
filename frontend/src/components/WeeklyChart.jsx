import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function WeeklyChart({ data }) {
  const formatted = data.map((d) => ({
    week: new Date(d.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    hours: Number(d.hours),
  }));

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-brand-blue-900">Weekly Hours</h3>
          <p className="text-sm text-slate-500">Last 8 weeks of activity</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-blue-50 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-brand-blue-700" />
        </div>
      </div>
      {formatted.length === 0 ? (
        <p className="text-center text-slate-400 py-12 text-sm">No data yet — log a shift to see your trend.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={formatted} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -4px rgba(30,58,138,0.15)' }}
              cursor={{ fill: '#eff6ff' }}
            />
            <Bar dataKey="hours" fill="url(#barBlue)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
