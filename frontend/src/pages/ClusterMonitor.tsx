import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchClusters } from '../services/api';
import { ClusterAlert } from '../types';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Cluster Anomaly Surveillance Radar</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Early-warning spatial-temporal clustering signals for Infection Prevention &amp; Control (IPC)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Active Signals:</span>
          <span
            className={`px-3 py-1 rounded-full font-extrabold border ${
              clusters.length > 0
                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 animate-pulse'
                : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
            }`}
          >
            {clusters.length} UNIT{clusters.length !== 1 ? 'S' : ''} FLAGGED
          </span>
        </div>
      </div>

      {/* Prominent Scientific Guardrail Banner */}
      <div className="p-5 rounded-3xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3 shadow-xs">
        <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-amber-950 dark:text-amber-100 text-sm">
            Algorithmic Cluster Detection &amp; Non-Outbreak Surveillance Notice:
          </strong>
          <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed text-xs">
            HAI-Sentinel monitors localized statistical risk concentrations to alert infection-prevention teams of emerging patterns. All alerts are classified strictly as <em>"Potential cluster requiring IPC review."</em> This is an algorithmic screening signal and does NOT constitute microbiological confirmation or an epidemiological outbreak declaration.
          </p>
        </div>
      </div>

      {/* Active Cluster Alerts List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-slate-400 font-mono">
            Scanning hospital spatial units for risk clustering...
          </div>
        ) : clusters.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Anomalous Clusters Detected</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              All hospital intensive care units currently exhibit baseline spatial risk distributions without concurrent rapid escalation spikes.
            </p>
          </div>
        ) : (
          clusters.map((cluster) => (
            <div
              key={cluster.ward_id}
              className="rounded-3xl border border-rose-200 dark:border-rose-500/40 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{cluster.ward_name} ({cluster.ward_id})</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-500/30">
                      SPATIAL CLUSTER DETECTED
                    </span>
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-mono font-semibold">{cluster.cluster_message}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    to="/wards"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
                  >
                    <span>View Ward Layout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Cluster Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unit Risk Level</span>
                  <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {cluster.ward_risk_level}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Spatial Risk Density</span>
                  <div className="text-2xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">
                    {(cluster.risk_density * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">High-Risk Patients</span>
                  <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                    {cluster.high_risk_count}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rapidly Rising</span>
                  <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                    {cluster.rapidly_rising_count}
                  </div>
                </div>
              </div>

              {/* Recommended Action Checklist */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Recommended IPC Rounding Directives for {cluster.ward_name}:
                </div>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    <span>1. {cluster.review_recommendation || 'Complete 100% Central Line Dressing & Chlorhexidine Bath Audits in unit beds.'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    <span>2. Review nursing staff ratio and hand-hygiene compliance dispenser telemetry.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    <span>3. Coordinate environmental terminal disinfection for adjacent high-velocity beds.</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
