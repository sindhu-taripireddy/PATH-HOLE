import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const Toast = ({ toast }) => {
  if (!toast) return null;

  const { message, type } = toast;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200',
    error: 'border-rose-500/40 bg-rose-950/80 text-rose-200',
    warning: 'border-amber-500/40 bg-amber-950/80 text-amber-200',
    info: 'border-cyan-500/40 bg-cyan-950/80 text-cyan-200',
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all ${borders[type] || borders.info}`}>
        {icons[type] || icons.info}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
