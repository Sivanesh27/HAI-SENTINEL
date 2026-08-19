import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPatients } from '../services/api';
import { PatientListItem } from '../types';
import { RiskBadge, PriorityBadge } from '../components/RiskBadge';
import { Users, Filter, ArrowRight, Zap, Search } from 'lucide-react';

export function PatientList() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [rapidOnly, setRapidOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Patient Risk Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time longitudinal risk surveillance and Infection Prevention & Control (IPC) prioritization
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span>Active Cohort:</span>
          <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{total} Patients</strong>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, MRN, Bed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Ward Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Hospital Wards</option>
              <option value="ICU-A">ICU-A (Medical)</option>
              <option value="ICU-B">ICU-B (Surgical)</option>
              <option value="ICU-C">ICU-C (Cardiac)</option>
              <option value="Ward-3">Ward-3 (Stepdown)</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Risk Tiers</option>
            <option value="CRITICAL">Critical Risk (&ge;80%)</option>
            <option value="HIGH">High Risk (60-79%)</option>
            <option value="MODERATE">Moderate Risk (30-59%)</option>
            <option value="LOW">Low Risk (&lt;30%)</option>
          </select>

          {/* Rapid Escalation Toggle */}
          <button
            onClick={() => setRapidOnly(!rapidOnly)}
            className={`flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              rapidOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${rapidOnly ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Rapid Escalations Only</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Patient / MRN</th>
                <th className="py-3 px-4">Ward / Bed</th>
                <th className="py-3 px-4">ICU Stay</th>
                <th className="py-3 px-4">Current Risk</th>
                <th className="py-3 px-4">Risk Category</th>
                <th className="py-3 px-4">12h Velocity</th>
                <th className="py-3 px-4">Review Priority</th>
                <th className="py-3 px-4">Primary Risk Drivers</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                    Loading clinical cohort...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No patients match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr
                    key={p.patient_id}
                    className={`hover:bg-slate-800/40 transition ${
                      p.is_demo_patient ? 'bg-cyan-950/15' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-mono">{p.patient_id}</span>
                        {p.is_demo_patient && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.mrn} • {p.age}y {p.gender}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{p.ward_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Bed {p.bed}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.icu_los_hours} hrs
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-sm font-bold font-mono text-white">
                        {p.current_risk.toFixed(1)}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge category={p.risk_category} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        className={`font-mono font-semibold flex items-center space-x-1 ${
                          p.risk_delta_12h >= 15.0
                            ? 'text-rose-400 font-bold'
                            : p.risk_delta_12h > 0
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {p.rapid_escalation && <Zap className="w-3 h-3 text-rose-400 fill-current" />}
                        <span>{p.risk_velocity_label}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={p.review_priority} />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.primary_drivers.map((driver, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {driver}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/patients/${p.patient_id}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white transition text-[11px] font-semibold"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
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
