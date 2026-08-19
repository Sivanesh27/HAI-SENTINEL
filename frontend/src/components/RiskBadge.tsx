import { RiskCategory, ConfidenceLevel, ReviewPriority } from '../types';

export function RiskBadge({ category, size = 'md' }: { category: RiskCategory; size?: 'sm' | 'md' | 'lg' }) {
  const styles = {
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10',
    HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10',
    MODERATE: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-yellow-500/10',
    LOW: 'bg-slate-500/20 text-slate-300 border-slate-500/30 shadow-slate-500/10',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  };

  return (
    <span className={`inline-flex items-center rounded border tracking-wider uppercase font-mono shadow-sm ${styles[category]} ${sizes[size]}`}>
      {category}
    </span>
  );
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const styles = {
    HIGH: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    MODERATE: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    LOW: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  };

  return (
    <span className={`inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded border font-medium ${styles[level]}`}>
      <span className="text-slate-400">Confidence:</span>
      <span className="font-semibold">{level}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ReviewPriority }) {
  const config = {
    1: { label: 'PRIORITY 1 • IMMEDIATE', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    2: { label: 'PRIORITY 2 • ELEVATED', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    3: { label: 'PRIORITY 3 • ROUTINE', style: 'bg-slate-700/40 text-slate-300 border-slate-600/40' },
  };

  return (
    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded border font-mono font-bold tracking-wider ${config[priority].style}`}>
      {config[priority].label}
    </span>
  );
}
