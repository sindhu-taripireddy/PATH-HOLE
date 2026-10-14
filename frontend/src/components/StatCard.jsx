import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'amber', description, trend }) => {
  const colorMap = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  };

  const currentTheme = colorMap[color] || colorMap.amber;

  return (
    <div className={`p-5 rounded-2xl bg-[#131C2E] border ${currentTheme.border} shadow-lg relative overflow-hidden transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3.5 rounded-xl ${currentTheme.bg} ${currentTheme.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{description}</span>
          {trend && <span className="font-semibold text-emerald-400">{trend}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
