export default function StatCard({ icon: Icon, label, value, accent = 'blue', subtitle }) {
  const accents = {
    blue: 'from-brand-blue-700 to-brand-blue-900 text-white',
    yellow: 'from-brand-yellow-300 to-brand-yellow-500 text-brand-blue-900',
    white: 'bg-white text-brand-blue-900 border border-slate-100',
  };
  const isWhite = accent === 'white';
  return (
    <div className={`rounded-2xl shadow-soft p-6 ${isWhite ? accents.white : `bg-gradient-to-br ${accents[accent]}`} animate-fade-in`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className={`text-xs uppercase font-semibold tracking-wider ${isWhite ? 'text-slate-500' : 'opacity-80'}`}>{label}</p>
          <p className="text-3xl font-extrabold mt-2">{value}</p>
          {subtitle && <p className={`text-xs mt-1 ${isWhite ? 'text-slate-500' : 'opacity-80'}`}>{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isWhite ? 'bg-brand-blue-50 text-brand-blue-700' : 'bg-white/20'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
