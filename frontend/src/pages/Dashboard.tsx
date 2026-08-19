import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, fetchDataQuality } from '../services/api';
import { DashboardResponse, DataQualityResponse } from '../types';
import { RiskBadge, PriorityBadge } from '../components/RiskBadge';
import { DemoTourModal } from '../components/DemoTourModal';
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
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-slate-400">Loading Infection-Prevention Command Center...</span>
        </div>
      </div>
    );
  }

  const { kpis, risk_distribution, wards_overview, recent_escalations, scientific_disclaimer } = dashboard;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Demo Tour Modal */}
      <DemoTourModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />

      {/* Hero Headline & Hackathon Action Bar */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Omni_BioTech_9 • Hospital-Acquired Infection Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Don't wait for the infection. <span className="text-cyan-400">Detect the trajectory.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Continuously transforms multi-hourly clinical telemetry into explainable risk velocities, local TreeSHAP attributions, spatial ward cluster alerts, and prioritized infection-prevention rounding recommendations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch 90s Demo Tour</span>
            </button>

            <Link
              to="/patients/DEMO-1042"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <span>Examine DEMO-1042</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Tiles: Immediate Comprehension */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-semibold uppercase">
            <span>Monitored Beds</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{kpis.total_monitored_patients}</div>
          <span className="text-[10px] text-slate-500">4 ICU/Stepdown Units</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-semibold uppercase">
            <span>Critical Risk</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{kpis.critical_risk_count}</div>
          <span className="text-[10px] text-slate-500">&ge;80% Probability</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-semibold uppercase">
            <span>High Risk</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{kpis.high_risk_count}</div>
          <span className="text-[10px] text-slate-500">60% - 79% Probability</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-semibold uppercase">
            <span>Rapid Escalations</span>
            <Zap className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{kpis.rapidly_rising_count}</div>
          <span className="text-[10px] text-slate-500">Velocity &ge; +1.25%/h</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-semibold uppercase">
            <span>Priority 1 Reviews</span>
            <Shield className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">{kpis.priority_1_reviews}</div>
          <span className="text-[10px] text-slate-500">Immediate IPC Action</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-semibold uppercase">
            <span>Active Clusters</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">{kpis.active_clusters_count}</div>
          <span className="text-[10px] text-slate-500">Spatial Signals</span>
        </div>
      </div>

      {/* Main Command Center Grid: Left (Rapid Escalations) + Right (Risk Distribution & Clusters) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rapidly Rising Trajectories & Priority 1 Rounding List */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Rapid Risk Escalations & Prioritized IPC Reviews
                </h3>
                <p className="text-[11px] text-slate-400">Patients exhibiting acute upward velocity requiring immediate rounding</p>
              </div>
            </div>

            <Link
              to="/patients"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>View All ({kpis.total_monitored_patients})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {recent_escalations.map((p) => (
              <div
                key={p.patient_id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-lg transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <Link
                      to={`/patients/${p.patient_id}`}
                      className="font-bold text-white font-mono hover:text-cyan-400 transition"
                    >
                      {p.patient_id}
                    </Link>
                    {p.is_demo_patient && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        DEMO
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">
                      {p.ward_name} (Bed {p.bed})
                    </span>
                    <PriorityBadge priority={p.review_priority} />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Key drivers:</span>
                    {p.primary_drivers.map((d, i) => (
                      <span key={i} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-white">{p.current_risk.toFixed(1)}%</div>
                    <div className="text-[11px] font-mono text-rose-400 font-semibold">{p.risk_velocity_label}</div>
                  </div>

                  <Link
                    to={`/patients/${p.patient_id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white transition text-xs font-semibold flex items-center space-x-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Hospital Risk Distribution & Cluster Radar Summary */}
        <div className="space-y-6">
          {/* Risk Tier Distribution Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Cohort Risk Stratification</span>
              <span className="text-[11px] text-slate-400 font-mono">{kpis.total_monitored_patients} Active</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={risk_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="tier" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Cluster Radar Snapshot */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Cluster Radar Signal</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-rose-200">ICU-A (Medical Unit)</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                4 high-risk patients and 3 rapid escalations co-located. Algorithmic early-warning flagged: <em>"Potential cluster requiring IPC review."</em>
              </p>
            </div>

            <Link
              to="/clusters"
              className="block text-center py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold transition"
            >
              Open Cluster Surveillance Radar &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Hospital Wards Heatmap & Spatial Density Overview */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Hospital Units & Risk Density Matrix</h3>
            <p className="text-[11px] text-slate-400">Unit-level spatial risk concentrations and census</p>
          </div>

          <Link
            to="/wards"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>Inspect Bed Matrix</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wards_overview.map((w) => (
            <Link
              key={w.ward_id}
              to="/wards"
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700 transition space-y-2.5 block"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{w.ward_name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{w.unit_type} • {w.occupied_beds}/{w.bed_count} Beds</span>
                </div>
                <RiskBadge category={w.ward_risk_level} size="sm" />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Avg Risk:</span>
                  <strong className="text-white font-mono">{w.average_risk.toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>High-Risk Patients:</span>
                  <strong className="text-amber-400 font-mono">{w.high_risk_count}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Risk Density:</span>
                  <strong className="text-cyan-400 font-mono">{(w.risk_density * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {w.cluster_signal && (
                <div className="text-[10px] text-rose-300 font-semibold pt-1 border-t border-slate-800 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  <span>Potential cluster signal active</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Data Quality & Telemetry Freshness Panel */}
      {dataQuality && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">Clinical Telemetry & Data Completeness Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  98.4% COMPLETE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{dataQuality.disclaimer}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-slate-300 font-mono text-[11px]">
            <span>Vitals: <strong>{dataQuality.vitals_completeness_pct}%</strong></span>
            <span>Labs: <strong>{dataQuality.laboratory_completeness_pct}%</strong></span>
            <span>Devices: <strong>{dataQuality.device_tracking_completeness_pct}%</strong></span>
          </div>
        </div>
      )}

      {/* Scientific Disclaimer */}
      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-start space-x-2.5">
        <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <span>{scientific_disclaimer}</span>
      </div>
    </div>
  );
}
