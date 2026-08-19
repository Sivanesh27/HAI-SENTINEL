import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchClusters } from '../services/api';
import { ClusterAlert } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import {
  AlertCircle,
  ShieldAlert,
  Users,
  Activity,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

export function ClusterMonitor() {
  const [clusters, setClusters] = useState<ClusterAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchClusters()
      .then((data) => {
        setClusters(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Cluster Anomaly Surveillance Radar</h2>
              <p className="text-xs text-slate-400">
                Early-warning spatial-temporal clustering signals for Infection Prevention & Control (IPC)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Active Signals:</span>
          <span
            className={`px-2.5 py-1 rounded font-bold border ${
              clusters.length > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {clusters.length} UNIT{clusters.length !== 1 ? 'S' : ''} FLAGGED
          </span>
        </div>
      </div>

      {/* Prominent Scientific Guardrail Banner */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 flex items-start space-x-3">
        <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-amber-100">
            Algorithmic Cluster Detection & Non-Outbreak Surveillance Notice:
          </strong>
          <p className="text-amber-300/90 leading-relaxed">
            HAI-Sentinel monitors localized statistical risk concentrations to alert infection-prevention teams of emerging patterns. All alerts are classified strictly as <em>"Potential cluster requiring IPC review."</em> This is an algorithmic screening signal and does NOT constitute microbiological confirmation or an epidemiological outbreak declaration.
          </p>
        </div>
      </div>

      {/* Active Cluster Alerts List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 rounded-xl border border-slate-800 bg-slate-900/60 text-center text-slate-500 font-mono">
            Scanning hospital spatial units for risk clustering...
          </div>
        ) : clusters.length === 0 ? (
          <div className="p-12 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No Anomalous Clusters Detected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All hospital intensive care units currently exhibit baseline spatial risk distributions without concurrent rapid escalation spikes.
            </p>
          </div>
        ) : (
          clusters.map((cluster) => (
            <div
              key={cluster.ward_id}
              className="rounded-xl border border-rose-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-white font-mono">{cluster.ward_name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 uppercase">
                          {cluster.cluster_message}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Unit Type: {cluster.unit_type} • Signal Timestamp: {new Date(cluster.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <RiskBadge category={cluster.ward_risk_level} size="lg" />
                  <Link
                    to={`/wards`}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    View Ward Layout &rarr;
                  </Link>
                </div>
              </div>

              {/* Cluster Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">High-Risk Patients</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{cluster.high_risk_count}</div>
                  <span className="text-[10px] text-slate-500">Risk &ge; 60%</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Rapid Escalations</span>
                  <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{cluster.rapidly_rising_count}</div>
                  <span className="text-[10px] text-slate-500">12h Delta &ge; +15%</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Density</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{(cluster.risk_density * 100).toFixed(1)}%</div>
                  <span className="text-[10px] text-slate-500">Spatial Concentration</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">IPC Review Action</span>
                  <div className="text-xs font-bold text-rose-300 mt-1">Priority Rounding</div>
                  <span className="text-[10px] text-slate-500">Immediate Protocol</span>
                </div>
              </div>

              {/* Actionable Recommended IPC Interventions */}
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Targeted IPC Review Action Plan</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{cluster.review_recommendation}</p>
              </div>

              {/* Contributing Co-Located Patients List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Co-Located Contributing Patients ({cluster.contributing_patients.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cluster.contributing_patients.map((p) => (
                    <div
                      key={p.patient_id}
                      className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white font-mono text-xs">{p.patient_id}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Bed {p.bed}</div>
                        </div>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            p.current_risk >= 80
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {p.current_risk.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Velocity:</span>
                        <span className="font-mono text-rose-400 font-semibold">{p.risk_velocity_label}</span>
                      </div>

                      <Link
                        to={`/patients/${p.patient_id}`}
                        className="w-full mt-2 py-1 flex items-center justify-center space-x-1.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white transition text-[10px] font-semibold"
                      >
                        <span>Examine Trajectory</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-slate-500 flex items-start space-x-2 pt-2 border-t border-slate-800">
                <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>{cluster.scientific_disclaimer}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
