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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/patients"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
            title="Back to Patient Monitor"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{patient_id}</h2>
              {is_demo_patient && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/30">
                  DEMO PATIENT
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">({mrn})</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {age}yo {gender === 'M' || gender === 'Male' ? 'Male' : 'Female'} • Charlson Index: {charlson_comorbidity_index} •{' '}
              {recent_surgery ? 'Recent Surgical Procedure' : 'Non-Surgical Admission'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {current_prediction && <PriorityBadge priority={current_prediction.review_priority} />}
        </div>
      </div>

      {/* Clinical Context Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <BedDouble className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
          <span>
            Ward: <strong className="text-slate-900 dark:text-slate-200">{encounter?.ward_name || 'ICU'}</strong> (Bed {encounter?.bed})
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            Admitted: <strong className="text-slate-900 dark:text-slate-200">{encounter?.admission_time ? new Date(encounter.admission_time).toLocaleString() : 'N/A'}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>
            Status: <strong className="text-slate-900 dark:text-slate-200 uppercase">{encounter?.status || 'ACTIVE'}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <User className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span>
            Primary: <strong className="text-slate-900 dark:text-slate-200">{encounter?.primary_diagnosis || 'Intensive Care'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
