import { Target, AlertTriangle } from 'lucide-react';

export default function WeeklyProgress({ current, limit }) {
  const pct = Math.min((current / limit) * 100, 100);
  const over = current > limit;
  const color = over ? 'bg-red-500' : pct > 80 ? 'bg-brand-yellow-400' : 'bg-brand-blue-700';

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-yellow-100 flex items-center justify-center">
            <Target className="w-5 h-5 text-brand-yellow-600" />
          </div>
          <div>
            <h3 className="font-bold text-brand-blue-900">This Week's Progress</h3>
            <p className="text-xs text-slate-500">Toward your weekly goal</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-extrabold ${over ? 'text-red-600' : 'text-brand-blue-900'}`}>
            {Number(current).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">of {limit} hrs</p>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {over && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" />
          You've exceeded your weekly limit.
        </div>
      )}
    </div>
  );
}
