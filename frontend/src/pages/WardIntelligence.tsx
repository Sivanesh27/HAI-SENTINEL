import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWards, fetchWardDetail } from '../services/api';
import { WardSummary, WardDetail, BedSlot } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import {
  Layers,
  AlertTriangle,
} from 'lucide-react';

export function WardIntelligence() {
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('ICU-A');
  const [wardDetail, setWardDetail] = useState<WardDetail | null>(null);
  const [loadingWards, setLoadingWards] = useState<boolean>(true);

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
      fetchWardDetail(selectedWardId)
        .then((data) => {
          setWardDetail(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [selectedWardId]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ward Intelligence &amp; Risk Density</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Spatial-temporal risk aggregation across hospital intensive care units
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/clusters"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition text-xs font-bold shadow-xs"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>View Active Cluster Signals</span>
          </Link>
        </div>
      </div>

      {/* Ward Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loadingWards ? (
          <div className="col-span-4 py-8 text-center text-slate-400 font-mono">
            Loading hospital units...
          </div>
        ) : (
          wards.map((w) => {
            const isSelected = w.ward_id === selectedWardId;
            return (
              <div
                key={w.ward_id}
                onClick={() => setSelectedWardId(w.ward_id)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all duration-200 relative overflow-hidden shadow-sm ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-slate-900 ring-2 ring-cyan-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300'
                }`}
              >
                {w.cluster_signal && (
                  <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-bl-lg tracking-wider animate-pulse">
                    POTENTIAL CLUSTER
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{w.ward_name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{w.unit_type}</span>
                  </div>
                  <RiskBadge category={w.ward_risk_level} size="sm" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Census:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{w.occupied_beds} / {w.bed_count} Beds</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Average Risk:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{w.average_risk.toFixed(1)}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Rapidly Rising:</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-mono">{w.rapidly_rising_count} Beds</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Ward Deep-Dive & Bed Layout */}
      {wardDetail && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {wardDetail.ward_name} Spatial Bed Layout Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live patient risk intensity across physical beds (Burgundy: Critical, Amber: High, Green: Safe)
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-slate-500">Spatial Risk Density:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">
                {(wardDetail.risk_density * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Physical Bed Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {wardDetail.bed_layout.map((slot: BedSlot) => {
              const riskCategory = slot.risk_category || 'LOW';
              const riskColor =
                riskCategory === 'CRITICAL'
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200'
                  : riskCategory === 'HIGH'
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200'
                  : riskCategory === 'MODERATE'
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-200'
                  : slot.occupied
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                  : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 opacity-60';

              if (!slot.occupied || !slot.patient_id) {
                return (
                  <div
                    key={slot.bed}
                    className={`p-3.5 rounded-2xl border ${riskColor} text-center space-y-1`}
                  >
                    <div className="text-[11px] font-bold font-mono uppercase text-slate-400">
                      Bed {slot.bed.replace(/^[^-]+-/, '')}
                    </div>
                    <div className="text-xs font-mono text-slate-400">EMPTY</div>
                    <div className="text-[10px] text-slate-400">Available</div>
                  </div>
                );
              }

              return (
                <Link
                  key={slot.bed}
                  to={`/patients/${slot.patient_id}`}
                  className={`p-3.5 rounded-2xl border ${riskColor} hover:scale-105 transition-all block text-center space-y-1`}
                >
                  <div className="text-[11px] font-bold font-mono uppercase text-slate-500 dark:text-slate-400">
                    Bed {slot.bed.replace(/^[^-]+-/, '')}
                  </div>
                  <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {slot.current_risk.toFixed(0)}%
                  </div>
                  <div className="text-[10px] truncate font-medium">{slot.patient_id}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
