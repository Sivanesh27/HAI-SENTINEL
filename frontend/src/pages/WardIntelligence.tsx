import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWards, fetchWardDetail } from '../services/api';
import { WardSummary, WardDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import {
  Layers,
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  ShieldAlert,
  Info,
} from 'lucide-react';

export function WardIntelligence() {
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('ICU-A');
  const [wardDetail, setWardDetail] = useState<WardDetail | null>(null);
  const [loadingWards, setLoadingWards] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    fetchWards()
      .then((data) => {
        setWards(data);
        setLoadingWards(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingWards(false);
      });
  }, []);

  useEffect(() => {
    if (selectedWardId) {
      setLoadingDetail(true);
      fetchWardDetail(selectedWardId)
        .then((data) => {
          setWardDetail(data);
          setLoadingDetail(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingDetail(false);
        });
    }
  }, [selectedWardId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Ward Intelligence & Risk Density</h2>
              <p className="text-xs text-slate-400">
                Spatial-temporal risk aggregation across hospital intensive care units
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/clusters"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition text-xs font-semibold"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>View Active Cluster Signals</span>
          </Link>
        </div>
      </div>

      {/* Ward Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingWards ? (
          <div className="col-span-4 py-8 text-center text-slate-500 font-mono">
            Loading hospital units...
          </div>
        ) : (
          wards.map((w) => {
            const isSelected = w.ward_id === selectedWardId;
            return (
              <div
                key={w.ward_id}
                onClick={() => setSelectedWardId(w.ward_id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-500/60 bg-slate-900 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-950/40'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                {w.cluster_signal && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl tracking-wider animate-pulse">
                    POTENTIAL CLUSTER
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{w.ward_name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {w.unit_type} • {w.occupied_beds}/{w.bed_count} Beds ({w.occupancy_rate_pct}%)
                    </p>
                  </div>
                  <RiskBadge category={w.ward_risk_level} size="sm" />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Average Risk:</span>
                    <strong className="font-mono text-white">{w.average_risk.toFixed(1)}%</strong>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">High-Risk Patients:</span>
                    <strong className="font-mono text-amber-400">{w.high_risk_count} patients</strong>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rapidly Escalating:</span>
                    <strong className="font-mono text-rose-400">{w.rapidly_rising_count} patients</strong>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Spatial Risk Density:</span>
                    <strong className="font-mono text-cyan-400">{(w.risk_density * 100).toFixed(1)}%</strong>
                  </div>
                </div>

                {w.cluster_signal && (
                  <div className="mt-3 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-300 font-semibold flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>Potential cluster requiring IPC review.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Ward Deep-Dive & Spatial Bed Layout */}
      {wardDetail && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {wardDetail.ward_name} — Spatial Bed Radar
                </h3>
                <RiskBadge category={wardDetail.ward_risk_level} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time bed-by-bed risk intensity and transmission density map
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1 text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Census: {wardDetail.occupied_beds}/{wardDetail.bed_count}</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400">
                <Activity className="w-3.5 h-3.5" />
                <span>High-Risk: {wardDetail.high_risk_count}</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Escalating: {wardDetail.rapidly_rising_count}</span>
              </span>
            </div>
          </div>

          {/* Cluster Status Callout */}
          {wardDetail.cluster_signal ? (
            <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-500/10 text-xs text-rose-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>ALGORITHMIC SIGNAL: Potential cluster requiring IPC review.</span>
              </div>
              <p className="text-slate-300">{wardDetail.review_recommendation}</p>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-center space-x-2">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{wardDetail.cluster_message} — {wardDetail.review_recommendation}</span>
            </div>
          )}

          {/* Spatial Bed Matrix Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Unit Spatial Bed Layout</span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                  <span>Critical</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                  <span>High</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500"></span>
                  <span>Moderate</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-700"></span>
                  <span>Low / Empty</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 pt-1">
              {loadingDetail ? (
                <div className="col-span-8 py-8 text-center text-slate-500 font-mono">
                  Loading spatial layout...
                </div>
              ) : (
                wardDetail.bed_layout.map((bed) => {
                  const getBedBg = () => {
                    if (!bed.occupied) return 'bg-slate-950/40 border-slate-800 text-slate-600';
                    if (bed.risk_category === 'CRITICAL') return 'bg-rose-500/20 border-rose-500/60 text-rose-200 shadow-sm shadow-rose-500/20';
                    if (bed.risk_category === 'HIGH') return 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm shadow-amber-500/20';
                    if (bed.risk_category === 'MODERATE') return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
                    return 'bg-slate-900 border-slate-800 text-slate-300';
                  };

                  return (
                    <div
                      key={bed.bed}
                      className={`p-3 rounded-lg border flex flex-col justify-between min-h-[95px] transition-all hover:scale-[1.02] ${getBedBg()}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold">{bed.bed}</span>
                        {bed.rapid_escalation && (
                          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                        )}
                      </div>

                      {bed.occupied && bed.patient_id ? (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-bold font-mono truncate">{bed.patient_id}</div>
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span>{bed.current_risk.toFixed(0)}%</span>
                            <span className={bed.rapid_escalation ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {bed.risk_velocity_label}
                            </span>
                          </div>
                          <Link
                            to={`/patients/${bed.patient_id}`}
                            className="block text-center text-[9px] py-0.5 rounded bg-slate-800/80 hover:bg-cyan-600 text-slate-200 hover:text-white transition font-semibold"
                          >
                            Inspect &rarr;
                          </Link>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-[10px] text-slate-600 font-mono">EMPTY</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Unit Patient Roster Table */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {wardDetail.ward_name} Active Patient Surveillance Roster
            </h4>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Patient / MRN</th>
                    <th className="py-2.5 px-3">Bed</th>
                    <th className="py-2.5 px-3">Risk %</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">12h Velocity</th>
                    <th className="py-2.5 px-3">Primary Risk Drivers</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {wardDetail.patient_roster.map((p) => (
                    <tr key={p.patient_id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{p.patient_id}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{p.bed}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{p.current_risk.toFixed(1)}%</td>
                      <td className="py-2.5 px-3"><RiskBadge category={p.risk_category} size="sm" /></td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{p.risk_velocity_label}</td>
                      <td className="py-2.5 px-3 text-slate-400">{p.primary_drivers.join(', ')}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/patients/${p.patient_id}`}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          View Trajectory &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-md border border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>{wardDetail.scientific_disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
