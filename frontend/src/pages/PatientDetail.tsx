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
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400 font-semibold">
            Computing Longitudinal Risk Trajectory...
          </span>
        </div>
      </div>
    );
  }

  if (error || !patient || !trajectory) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Patient Record Not Found</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">{error || 'Could not load clinical trajectory.'}</p>
      </div>
    );
  }

  const vitals = patient.latest_vitals;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* 1. Patient Demographics & Context */}
      <PatientHeader patient={patient} />

      {/* 2. Core Dynamic Trajectory Engine Component */}
      <PatientTrajectoryCard trajectoryData={trajectory} />

      {/* 3. Explainable AI Local Attribution Breakdown (Tree-SHAP) */}
      <SHAPContributionsCard explanation={trajectory.top_features} />

      {/* 4. Latest Telemetry Snapshot & Actionable IPC Rounding Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Latest Clinical Telemetry Snapshot */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Bedside Telemetry &amp; Device Dwell
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current physiological parameters and indwelling catheter duration</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Core Temp</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">{vitals.temp_c.toFixed(1)} &deg;C</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Heart Rate</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">{vitals.heart_rate} bpm</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Activity className="w-4 h-4 text-cyan-500" />
                <span>MAP Blood Press.</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">{vitals.map} mmHg</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Wind className="w-4 h-4 text-blue-500" />
                <span>Resp Rate / SpO2</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">{vitals.resp_rate}/m • {vitals.spo2}%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Droplets className="w-4 h-4 text-amber-500" />
                <span>WBC / Lactate</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">{vitals.wbc.toFixed(1)}k • {vitals.lactate.toFixed(1)}mM</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>CVC Dwell Time</span>
              </div>
              <div className="text-base font-bold font-mono text-purple-600 dark:text-purple-300">{vitals.cvc_duration_hours} hrs</div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Actionable Bedside Rounding Checklist */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                IPC Rounding Action Triggers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record preventative actions taken at bedside</p>
            </div>
          </div>

          {auditSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{auditSuccess}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <button
              onClick={() => handleRecordIpcAction('CVC_LINE_HYGIENE_AUDIT_COMPLETED')}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-cyan-50 dark:hover:bg-slate-800/80 hover:border-cyan-300 dark:hover:border-cyan-500/40 transition flex items-center justify-between group"
            >
              <div>
                <strong className="text-slate-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 block">
                  Verify Central Line Dressing &amp; Bundle
                </strong>
                <span className="text-slate-500 text-[11px]">Assess dressing integrity, biopatch, and line necessity</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 flex-shrink-0" />
            </button>

            <button
              onClick={() => handleRecordIpcAction('FOLEY_CATHETER_REMOVAL_ASSESSMENT')}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-cyan-50 dark:hover:bg-slate-800/80 hover:border-cyan-300 dark:hover:border-cyan-500/40 transition flex items-center justify-between group"
            >
              <div>
                <strong className="text-slate-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 block">
                  Evaluate Catheter Discontinuation Readiness
                </strong>
                <span className="text-slate-500 text-[11px]">Prompt physician order for early catheter de-escalation</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 flex-shrink-0" />
            </button>

            <button
              onClick={() => handleRecordIpcAction('MICROBIOLOGY_BLOOD_CULTURE_EXPEDITED')}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-cyan-50 dark:hover:bg-slate-800/80 hover:border-cyan-300 dark:hover:border-cyan-500/40 transition flex items-center justify-between group"
            >
              <div>
                <strong className="text-slate-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 block">
                  Order Diagnostic Surveillance Panel
                </strong>
                <span className="text-slate-500 text-[11px]">Expedite blood cultures and repeat serum lactate</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
