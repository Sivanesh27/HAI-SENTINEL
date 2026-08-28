import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchDataQuality } from '../services/api';
import { DashboardResponse, DataQualityResponse } from '../types';
import { RiskBadge, PriorityBadge } from '../components/RiskBadge';
import { DemoTourModal } from '../components/DemoTourModal';
import { LiveTriageStudio } from '../components/LiveTriageStudio';
import { useUI } from '../context/UIContext';
import {
  Activity,
  Users,
  AlertTriangle,
  Shield,
  Layers,
  ArrowRight,
  Zap,
  Play,
  Database,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQualityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoOpen, setDemoOpen] = useState<boolean>(false);
  const { theme, isStreaming, liveBeds, lastStreamTime } = useUI();

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchDataQuality()])
      .then(([dashData, dqData]) => {
        setDashboard(dashData);
        setDataQuality(dqData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400 font-semibold">
            Loading Infection-Prevention Command Center...
          </span>
        </div>
      </div>
    );
  }

  const { kpis, risk_distribution, wards_overview, recent_escalations, scientific_disclaimer } = dashboard;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Demo Tour Modal */}
      <DemoTourModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />

      {/* Hero Headline & Hackathon Action Bar */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-8 shadow-md dark:shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-700 dark:text-cyan-300 font-bold font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <span>Omni_BioTech_9 • Hospital-Acquired Infection Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Don't wait for infection. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">Detect the trajectory.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Transforms continuous ICU physiological telemetry into explainable risk velocities, local TreeSHAP attributions, spatial unit cluster radar, and automated bedside rounding triage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-102"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch 90s Guided Demo</span>
            </button>

            <Link
              to="/patients/DEMO-1042"
              className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 transition"
            >
              <span>Examine DEMO-1042</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Stream Telemetry Banner */}
        {isStreaming && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-mono font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>🔴 LIVE ICU STREAMING: {liveBeds.length || 16} ACTIVE BEDS MONITORED</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Last Telemetry Pulse: {lastStreamTime}
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards: High Visual Polish & Large Clear Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Monitored Beds */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5 transition-colors">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Monitored Beds</span>
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {kpis.total_monitored_patients}
          </div>
          <span className="text-xs text-slate-500 font-medium">4 Active Hospital Units</span>
        </div>

        {/* Critical Risk */}
        <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 shadow-sm space-y-1.5 transition-colors">
          <div className="flex justify-between items-center text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span>Critical Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            {kpis.critical_risk_count}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">&ge;80% Calibrated Prob</span>
        </div>

        {/* High Risk */}
        <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 shadow-sm space-y-1.5 transition-colors">
          <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>High Risk</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
            {kpis.high_risk_count}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">60% - 79% Probability</span>
        </div>

        {/* Rapid Escalations */}
        <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/5 shadow-sm space-y-1.5 transition-colors">
          <div className="flex justify-between items-center text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <span>Rapid Spikes</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tracking-tight">
            {kpis.rapidly_rising_count}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Velocity &ge; +1.25%/h</span>
        </div>

        {/* Priority 1 Reviews */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5 transition-colors">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Priority 1 Triage</span>
            <Shield className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-blue-600 dark:text-cyan-300 tracking-tight">
            {kpis.priority_1_reviews}
          </div>
          <span className="text-xs text-slate-500 font-medium">Immediate IPC Rounding</span>
        </div>

        {/* Active Clusters */}
        <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/30 dark:bg-slate-900 shadow-sm space-y-1.5 transition-colors">
          <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>Unit Clusters</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-600 dark:text-amber-300 tracking-tight">
            {kpis.active_clusters_count}
          </div>
          <span className="text-xs text-slate-500 font-medium">Spatial Risk Density</span>
        </div>
      </div>

      {/* Main Command Center Grid: Left (Rapid Escalations) + Right (Risk Distribution & Clusters) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Rapid Escalations & Priority 1 Rounding List */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Rapid Risk Escalations &amp; Prioritized IPC Reviews
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Patients exhibiting acute upward risk velocity requiring targeted bedside rounding
                </p>
              </div>
            </div>

            <Link
              to="/patients"
              className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center space-x-1"
            >
              <span>View All ({kpis.total_monitored_patients})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recent_escalations.map((p) => (
              <div
                key={p.patient_id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-xl transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <Link
                      to={`/patients/${p.patient_id}`}
                      className="font-extrabold text-base text-slate-900 dark:text-white font-mono hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                    >
                      {p.patient_id}
                    </Link>
                    {p.is_demo_patient && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/30">
                        DEMO
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
                      {p.ward_name} (Bed {p.bed})
                    </span>
                    <PriorityBadge priority={p.review_priority} />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Key Drivers:</span>
                    {p.primary_drivers.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-5 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {p.current_risk.toFixed(1)}%
                    </div>
                    <div className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold flex items-center justify-end space-x-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{p.risk_velocity_label}</span>
                    </div>
                  </div>

                  <Link
                    to={`/patients/${p.patient_id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-cyan-600 dark:bg-slate-800 dark:hover:bg-cyan-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white transition text-xs font-bold flex items-center space-x-1 shadow-xs"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Risk Distribution & Cluster Snapshot */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Tier Stratification Chart */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Cohort Stratification
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">
                {kpis.total_monitored_patients} Patients
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={risk_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="tier"
                    stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                    tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#475569' }}
                  />
                  <YAxis
                    stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                    tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Cluster Radar Snapshot */}
          <div className="rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/5 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Cluster Surveillance Signal
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-extrabold border border-rose-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-slate-900 dark:text-rose-200 text-sm">
                ICU-A (Medical Intensive Care)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                4 high-risk patients and 3 rapid escalations co-located. Algorithmic surveillance recommendation: <em>"Potential cluster requiring IPC review."</em>
              </p>
            </div>

            <Link
              to="/clusters"
              className="block text-center py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition"
            >
              Open Spatial Radar &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Real-Time Live Triage & Telemetry Studio */}
      <LiveTriageStudio />

      {/* Hospital Wards Heatmap & Spatial Density Overview */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hospital Units &amp; Spatial Risk Density Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unit-level spatial risk concentrations, census, and transmission surveillance
            </p>
          </div>

          <Link
            to="/wards"
            className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center space-x-1"
          >
            <span>Inspect Bed Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wards_overview.map((w) => (
            <Link
              key={w.ward_id}
              to="/wards"
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3 block"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{w.ward_name}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                    {w.unit_type} • {w.occupied_beds}/{w.bed_count} Beds
                  </span>
                </div>
                <RiskBadge category={w.ward_risk_level} size="sm" />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>Avg Ward Risk:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{w.average_risk.toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>High-Risk Patients:</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">{w.high_risk_count}</strong>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>Risk Density:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{(w.risk_density * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {w.cluster_signal && (
                <div className="text-xs text-rose-600 dark:text-rose-300 font-bold pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Potential cluster signal active</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Data Quality & Telemetry Freshness Engine */}
      {dataQuality && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Clinical Telemetry &amp; Data Completeness Engine
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                  98.4% COMPLETE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{dataQuality.disclaimer}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
            <span>Vitals: <strong className="text-slate-900 dark:text-white">{dataQuality.vitals_completeness_pct}%</strong></span>
            <span>Labs: <strong className="text-slate-900 dark:text-white">{dataQuality.laboratory_completeness_pct}%</strong></span>
            <span>Devices: <strong className="text-slate-900 dark:text-white">{dataQuality.device_tracking_completeness_pct}%</strong></span>
          </div>
        </div>
      )}

      {/* Scientific & Ethical Disclaimer */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/60 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-3">
        <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
        <span>{scientific_disclaimer}</span>
      </div>
    </div>
  );
}
