import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MatchScoreBadge({ score, size = "md", showLabel = true, className = "" }) {
  const getColors = (s) => {
    if (s >= 80) {
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        glow: 'shadow-glow-emerald',
        label: 'High Match'
      };
    } else if (s >= 65) {
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        glow: 'shadow-glow-amber',
        label: 'Good Match'
      };
    } else {
      return {
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        glow: '',
        label: 'Moderate'
      };
    }
  };

  const style = getColors(score);

  if (size === "lg") {
    return (
      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border ${style.bg} ${style.border} ${style.glow} ${className}`}>
        <Sparkles className={`w-5 h-5 ${style.text} animate-pulse-subtle`} />
        <div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${style.text}`}>{score}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Match</span>
          </div>
          {showLabel && (
            <p className="text-[10px] text-slate-400 font-medium">{style.label}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${style.bg} ${style.border} ${className}`}>
      <span className={`text-xs font-black ${style.text}`}>{score}%</span>
      {showLabel && (
        <span className="text-[10px] font-semibold text-slate-300">Match</span>
      )}
    </div>
  );
}
