import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

const SeverityBadge = ({ severity, showIcon = true }) => {
  if (severity === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        {showIcon && <AlertOctagon className="w-3.5 h-3.5" />}
        High Severity
      </span>
    );
  }
  if (severity === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
        Medium Severity
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
      Low Severity
    </span>
  );
};

export default SeverityBadge;
