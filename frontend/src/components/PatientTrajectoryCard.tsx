import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Activity, TrendingUp, AlertOctagon, Info } from 'lucide-react';
import { PatientRiskTrajectoryResponse } from '../types';
import { RiskBadge, ConfidenceBadge } from './RiskBadge';
import { useUI } from '../context/UIContext';

interface Props {
  trajectoryData: PatientRiskTrajectoryResponse;
}

export function PatientTrajectoryCard({ trajectoryData }: Props) {
  const { theme } = useUI();
  const {
    risk_category,
    confidence,
    risk_delta_6h,
    risk_delta_12h,
    risk_velocity_label,
    risk_acceleration,
    rapid_escalation,
    trajectory_summary,
    trajectory,
    scientific_disclaimer,
  } = trajectoryData;

  // Format data for Recharts
  const chartData = trajectory.map((point) => ({
    hour: `Hour ${point.hour_from_admission}`,
    risk: point.risk_pct,
    category: point.risk_category,
    rawHour: point.hour_from_admission,
  }));

  // Create key milestone chips along the trajectory
  const milestoneIndices = [
    0,
    Math.floor(trajectory.length * 0.25),
    Math.floor(trajectory.length * 0.5),
    Math.floor(trajectory.length * 0.75),
    trajectory.length - 1,
  ].filter((idx, pos, self) => self.indexOf(idx) === pos && idx < trajectory.length);

  const milestones = milestoneIndices.map((i) => trajectory[i]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm transition-colors duration-200">
      {/* Header with Title & Current Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Dynamic Risk Trajectory Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sequential multi-hourly clinical risk monitoring (t - 24h &rarr; t0)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ConfidenceBadge level={confidence} />
          <RiskBadge category={risk_category} size="lg" />
        </div>
      </div>

      {/* Rapid Escalation Warning (if applicable) */}
      {rapid_escalation && (
        <div className="p-4 rounded-2xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span className="font-bold tracking-wide">
              RAPID RISK ESCALATION DETECTED: Velocity exceeds +1.25%/hr or 12h delta &ge; +15.0%
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-500/30 font-mono font-extrabold text-rose-900 dark:text-rose-100 uppercase">
            IPC Priority 1
          </span>
        </div>
      )}

      {/* Trajectory Milestone Progression Ribbon */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-300">
            <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Temporal Progression Snapshot:</span>
          </span>
          <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{trajectory_summary}</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex items-center space-x-2 flex-shrink-0">
              <div className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
                <span className="text-slate-500 mr-1.5">Hr {m.hour_from_admission}:</span>
                <strong className="text-slate-900 dark:text-white font-extrabold">{m.risk_pct.toFixed(1)}%</strong>
              </div>
              {idx < milestones.length - 1 && <span className="text-slate-400 font-bold">&rarr;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Core Longitudinal Area Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
            <XAxis
              dataKey="hour"
              stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
              tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#475569' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
              tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#475569' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
              }}
              formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Calibrated Risk']}
            />
            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical (80%)', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={60} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'High (60%)', fill: '#f97316', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#riskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Calculus Derivatives & Risk Delta Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">6h Risk Delta</div>
          <div className={`text-lg font-bold font-mono ${risk_delta_6h >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {risk_delta_6h >= 0 ? `+${risk_delta_6h.toFixed(1)}%` : `${risk_delta_6h.toFixed(1)}%`}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">12h Risk Delta</div>
          <div className={`text-lg font-bold font-mono ${risk_delta_12h >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {risk_delta_12h >= 0 ? `+${risk_delta_12h.toFixed(1)}%` : `${risk_delta_12h.toFixed(1)}%`}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">Risk Velocity (v12h)</div>
          <div className="text-sm font-bold font-mono text-cyan-700 dark:text-cyan-400 mt-0.5">
            {risk_velocity_label}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">Acceleration (a12h)</div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-200 mt-0.5">
            {risk_acceleration.toFixed(3)} %/h²
          </div>
        </div>
      </div>

      {/* Scientific Guidance Footnote */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
        <span>{scientific_disclaimer}</span>
      </div>
    </div>
  );
}
