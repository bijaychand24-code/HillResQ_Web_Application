import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ text = 'Loading data...', fullScreen = false, size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-emerald-700`} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
