import { User, Clock, BedDouble, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PatientDetailResponse } from '../types';
import { PriorityBadge } from './RiskBadge';

interface Props {
  patient: PatientDetailResponse;
}

export function PatientHeader({ patient }: Props) {
  const {
    patient_id,
    mrn,
    age,
    gender,
    charlson_comorbidity_index,
    recent_surgery,
    is_demo_patient,
    encounter,
    current_prediction,
  } = patient;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/patients"
            className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Back to Patient Monitor"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white font-mono">{patient_id}</h2>
              {is_demo_patient && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  DEMO PATIENT
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">({mrn})</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {age}yo {gender === 'M' ? 'Male' : 'Female'} • Charlson Index: {charlson_comorbidity_index} •{' '}
              {recent_surgery ? 'Recent Surgical Procedure' : 'Non-Surgical Admission'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {current_prediction && <PriorityBadge priority={current_prediction.review_priority} />}
        </div>
      </div>

      {/* Clinical Context Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <BedDouble className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            Ward: <strong className="text-slate-200">{encounter?.ward_name || 'ICU'}</strong> (Bed {encounter?.bed})
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Admitted: <strong className="text-slate-200">{encounter?.admission_time ? new Date(encounter.admission_time).toLocaleString() : 'N/A'}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Status: <strong className="text-slate-200 uppercase">{encounter?.status || 'ACTIVE'}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            Primary: <strong className="text-slate-200">{encounter?.primary_diagnosis || 'Intensive Care'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
