import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPatientDetail, fetchPatientRiskTrajectory, createAuditLog } from '../services/api';
import { PatientDetailResponse, PatientRiskTrajectoryResponse } from '../types';
import { PatientHeader } from '../components/PatientHeader';
import { PatientTrajectoryCard } from '../components/PatientTrajectoryCard';
import { SHAPContributionsCard } from '../components/SHAPContributionsCard';
import {
  Thermometer,
  Heart,
  Activity,
  Droplets,
  Wind,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  ClipboardCheck,
  Shield,
} from 'lucide-react';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patientId = id || 'DEMO-1042';

  const [patient, setPatient] = useState<PatientDetailResponse | null>(null);
  const [trajectory, setTrajectory] = useState<PatientRiskTrajectoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [auditSuccess, setAuditSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchPatientDetail(patientId),
      fetchPatientRiskTrajectory(patientId)
    ])
      .then(([patientData, trajectoryData]) => {
        setPatient(patientData);
        setTrajectory(trajectoryData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [patientId]);

  const handleRecordIpcAction = async (actionName: string) => {
    try {
      await createAuditLog({
        user_id: 'CLINICAL_IPC_ROUTING_TEAM',
        user_role: 'IPC_ADMIN',
        action: actionName,
        patient_id: patientId,
        details: {
          current_risk: trajectory?.current_risk,
          risk_velocity: trajectory?.risk_velocity_label,
          status: 'COMPLETED_AT_BEDSIDE',
        },
      });
      setAuditSuccess(`Successfully logged: ${actionName}`);
      setTimeout(() => setAuditSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-slate-400">Computing Longitudinal Risk Trajectory...</span>
        </div>
      </div>
    );
  }

  if (error || !patient || !trajectory) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Patient Record Not Found</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error || 'Could not load clinical trajectory.'}</p>
      </div>
    );
  }

  const vitals = patient.latest_vitals;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Patient Demographics & Context */}
      <PatientHeader patient={patient} />

      {/* 2. Core Dynamic Trajectory Engine Component */}
      <PatientTrajectoryCard trajectoryData={trajectory} />

      {/* 3. Local Explainability (Tree-SHAP) */}
      <SHAPContributionsCard explanation={trajectory.top_features} />

      {/* 4. Latest Clinical Telemetry & Invasive Device Burden */}
      {vitals && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Current Physiological Telemetry &amp; Device Exposures
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">Timestamp: {patient.current_prediction?.last_update}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                <span>Heart Rate</span>
                <Heart className="w-3 h-3 text-rose-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">{vitals.heart_rate} <span className="text-xs font-normal text-slate-500">bpm</span></div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                <span>Temperature</span>
                <Thermometer className="w-3 h-3 text-amber-400" />
              </div>
              <div className={`text-lg font-bold font-mono ${vitals.temp_c >= 38.0 ? 'text-rose-400' : 'text-white'}`}>
                {vitals.temp_c.toFixed(1)} <span className="text-xs font-normal text-slate-500">°C</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                <span>MAP / BP</span>
                <Activity className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">{vitals.map} <span className="text-xs font-normal text-slate-500">mmHg</span></div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                <span>WBC Count</span>
                <Droplets className="w-3 h-3 text-purple-400" />
              </div>
              <div className={`text-lg font-bold font-mono ${vitals.wbc >= 12.0 ? 'text-amber-400' : 'text-white'}`}>
                {vitals.wbc.toFixed(1)} <span className="text-xs font-normal text-slate-500">k/µL</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                <span>CVC Dwell Time</span>
                <Wind className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">{vitals.cvc_duration_hours} <span className="text-xs font-normal text-slate-500">hrs</span></div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                <span>Device Burden</span>
                <Activity className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">{vitals.total_device_burden} <span className="text-xs font-normal text-slate-500">active</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 5. IPC Clinical Rounding Action Panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <ClipboardCheck className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              IPC Rounding Protocol &amp; Clinical Decision Support
            </h4>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            Direct Governance Ledger
          </span>
        </div>

        {auditSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{auditSuccess}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleRecordIpcAction('CVC_BUNDLE_HYGIENE_VERIFIED')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verify CVC Bundle Compliance</span>
          </button>

          <button
            onClick={() => handleRecordIpcAction('CATHETER_REMOVAL_ASSESSED')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Wind className="w-3.5 h-3.5 text-blue-400" />
            <span>Assess Device Removal Readiness</span>
          </button>

          <button
            onClick={() => handleRecordIpcAction('PRIORITY_1_ROUNDING_COMPLETED')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acknowledge Trajectory &amp; Commit IPC Rounding</span>
          </button>
        </div>
      </div>
    </div>
  );
}
