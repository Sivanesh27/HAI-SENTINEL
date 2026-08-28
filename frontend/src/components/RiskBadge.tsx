import { RiskCategory, ConfidenceLevel, ReviewPriority } from '../types';

export function RiskBadge({ category, size = 'md' }: { category: RiskCategory; size?: 'sm' | 'md' | 'lg' }) {
  const styles = {
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40',
    HIGH: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
    MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40',
    LOW: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600/40',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-extrabold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  };

  return (
    <span className={`inline-flex items-center rounded-lg border tracking-wider uppercase font-mono shadow-xs ${styles[category]} ${sizes[size]}`}>
      {category}
    </span>
  );
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const styles = {
    HIGH: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    MODERATE: 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/30',
    LOW: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  };

  return (
    <span className={`inline-flex items-center space-x-1.5 text-xs px-2.5 py-0.5 rounded-md border font-medium ${styles[level]}`}>
      <span className="opacity-75">Confidence:</span>
      <span className="font-bold">{level}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ReviewPriority }) {
  const config = {
    1: { label: 'PRIORITY 1 • IMMEDIATE', style: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40' },
    2: { label: 'PRIORITY 2 • ELEVATED', style: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40' },
    3: { label: 'PRIORITY 3 • ROUTINE', style: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  };

  return (
    <span className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-md border font-mono font-bold tracking-wider ${config[priority].style}`}>
      {config[priority].label}
    </span>
  );
}
