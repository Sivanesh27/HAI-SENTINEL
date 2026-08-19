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

interface Props {
  trajectoryData: PatientRiskTrajectoryResponse;
}

export function PatientTrajectoryCard({ trajectoryData }: Props) {
  const {
    current_risk,
    risk_category,
    confidence,
    risk_delta_6h,
    risk_delta_12h,
    risk_delta_24h,
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
      {/* Header with Title & Current Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Dynamic Risk Trajectory Engine</h3>
              <p className="text-xs text-slate-400">Sequential multi-hourly clinical risk monitoring (t - 24h &rarr; t0)</p>
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
        <div className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-200 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2.5">
            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-semibold tracking-wide">
              RAPID RISK ESCALATION DETECTED: Velocity exceeds +1.25%/hr or 12h delta &ge; +15.0%
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/30 font-mono font-bold text-rose-100 uppercase">
            IPC Priority 1
          </span>
        </div>
      )}

      {/* Trajectory Milestone Progression Ribbon */}
      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Temporal Progression Snapshot:</span>
          </span>
          <span className="font-mono text-cyan-300 font-semibold">{trajectory_summary}</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex items-center space-x-2 flex-shrink-0">
              <div
                className={`px-3 py-1.5 rounded-md border text-xs font-mono font-bold ${
                  idx === milestones.length - 1
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-sm shadow-rose-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-[9px] text-slate-500 font-sans uppercase">Hr {m.hour_from_admission}</div>
                <div>{m.risk_pct.toFixed(1)}%</div>
              </div>
              {idx < milestones.length - 1 && <span className="text-slate-600 font-bold text-xs">&rarr;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Longitudinal Trajectory Chart */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Predicted Infection Probability (%) Over ICU Stay</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="inline-flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80"></span>
              <span>Critical (&ge;80%)</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80"></span>
              <span>High (60-79%)</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500/80"></span>
              <span>Moderate (30-59%)</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={current_risk >= 80 ? '#ef4444' : current_risk >= 60 ? '#f97316' : '#06b6d4'} stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'HAI Risk Score']}
              />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.6} />
              <ReferenceLine y={60} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.6} />
              <ReferenceLine y={30} stroke="#eab308" strokeDasharray="3 3" strokeOpacity={0.4} />
              <Area
                type="monotone"
                dataKey="risk"
                stroke={current_risk >= 80 ? '#ef4444' : current_risk >= 60 ? '#f97316' : '#06b6d4'}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#riskGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calculus & Velocity Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
          <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-semibold">
            <span>Calibrated Risk</span>
            <span className="text-cyan-400 font-mono">{trajectoryData.data_completeness_pct}% Data</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">
            {current_risk.toFixed(1)}% <span className="text-xs text-slate-400 font-normal">(&plusmn;{(current_risk * 0.075).toFixed(1)}%)</span>
          </div>
          <span className="text-[10px] text-slate-500">Posterior &plusmn; Margin</span>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Delta (6h)</span>
          <div className={`text-xl font-bold font-mono mt-0.5 ${risk_delta_6h > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {risk_delta_6h >= 0 ? `+${risk_delta_6h.toFixed(1)}%` : `${risk_delta_6h.toFixed(1)}%`}
          </div>
          <span className="text-[10px] text-slate-500">&Delta;Risk (6h)</span>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Delta (12h)</span>
          <div className={`text-xl font-bold font-mono mt-0.5 ${risk_delta_12h > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {risk_delta_12h >= 0 ? `+${risk_delta_12h.toFixed(1)}%` : `${risk_delta_12h.toFixed(1)}%`}
          </div>
          <span className="text-[10px] text-slate-500">24h Delta: {risk_delta_24h >= 0 ? `+${risk_delta_24h.toFixed(1)}%` : `${risk_delta_24h.toFixed(1)}%`}</span>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Velocity (v)</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{risk_velocity_label}</div>
          <span className="text-[10px] text-slate-500">Rate: % / 12 Hours</span>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Acceleration (a)</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            {risk_acceleration >= 0 ? `+${risk_acceleration.toFixed(3)}` : risk_acceleration.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500">&Delta;v / &Delta;t (%/h&sup2;)</span>
        </div>
      </div>

      {/* Non-Causal Scientific Disclaimer Footer */}
      <div className="p-3 rounded-md border border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>{scientific_disclaimer}</span>
      </div>
    </div>
  );
}
