import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPatients } from '../services/api';
import { PatientListItem } from '../types';
import { RiskBadge, PriorityBadge } from '../components/RiskBadge';
import { Users, Filter, ArrowRight, Zap, Search } from 'lucide-react';
import { useUI } from '../context/UIContext';

export function PatientList() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [rapidOnly, setRapidOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isStreaming } = useUI();

  const loadData = () => {
    setLoading(true);
    fetchPatients({
      ward: selectedWard || undefined,
      risk_level: selectedRisk || undefined,
      rapid_escalation: rapidOnly ? true : undefined,
      limit: 100,
    })
      .then((data) => {
        setPatients(data.patients);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedWard, selectedRisk, rapidOnly]);

  const filteredPatients = patients.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.patient_id.toLowerCase().includes(term) ||
      p.mrn.toLowerCase().includes(term) ||
      p.ward_name.toLowerCase().includes(term) ||
      p.bed.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Patient Risk Monitor</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time longitudinal risk surveillance and Infection Prevention &amp; Control (IPC) prioritization
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isStreaming && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold border border-rose-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>LIVE TELEMETRY ACTIVE</span>
            </span>
          )}
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Active Cohort:</span>
            <strong className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {total} Patients
            </strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ID, MRN, Bed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Ward Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="">All Hospital Wards</option>
              <option value="ICU-A">ICU-A (Medical)</option>
              <option value="ICU-B">ICU-B (Surgical)</option>
              <option value="ICU-C">ICU-C (Cardiac)</option>
              <option value="Ward-3">Ward-3 (Stepdown)</option>
            </select>
          </div>

          {/* Risk Level Selector */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="">All Risk Tiers</option>
              <option value="CRITICAL">Critical (&ge;80%)</option>
              <option value="HIGH">High (60-79%)</option>
              <option value="MODERATE">Moderate (30-59%)</option>
              <option value="LOW">Low (&lt;30%)</option>
            </select>
          </div>

          {/* Rapid Escalation Toggle */}
          <button
            onClick={() => setRapidOnly(!rapidOnly)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
              rapidOnly
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${rapidOnly ? 'fill-current' : ''}`} />
            <span>Rapid Escalations Only</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Patient ID / MRN</th>
                <th className="py-3.5 px-4">Unit / Bed</th>
                <th className="py-3.5 px-4">Calibrated Risk</th>
                <th className="py-3.5 px-4">Risk Velocity (v12h)</th>
                <th className="py-3.5 px-4">Review Priority</th>
                <th className="py-3.5 px-4">Primary Risk Drivers</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating cohort risk trajectories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No patients match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/patients/${p.patient_id}`}
                          className="font-bold text-sm text-slate-900 dark:text-white font-mono hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                        >
                          {p.patient_id}
                        </Link>
                        {p.is_demo_patient && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/20">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">{p.mrn}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{p.ward_name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">Bed {p.bed}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                          {p.current_risk.toFixed(1)}%
                        </span>
                        <RiskBadge category={p.risk_category} size="sm" />
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className={`font-mono font-bold text-xs ${p.risk_velocity >= 0.0125 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {p.risk_velocity_label}
                      </div>
                      {p.rapid_escalation && (
                        <span className="inline-flex items-center text-[10px] text-rose-600 dark:text-rose-400 font-extrabold mt-0.5">
                          <Zap className="w-3 h-3 fill-current mr-1" />
                          RAPID SPIKE
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <PriorityBadge priority={p.review_priority} />
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.primary_drivers.map((d, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/patients/${p.patient_id}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-600 dark:bg-slate-800 dark:hover:bg-cyan-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white transition font-bold text-xs shadow-xs"
                      >
                        <span>Trajectory</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
