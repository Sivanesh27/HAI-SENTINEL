import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  X,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';
import { createAuditLog } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoTourModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Step 1: Baseline ICU Admission (t = 0h)',
      patientId: 'DEMO-1042',
      riskScore: '17.0%',
      riskCategory: 'LOW',
      velocity: '0.0% / 12h',
      headline: 'Normal Post-Surgical ICU Monitoring',
      description:
        'Patient DEMO-1042 admitted to ICU-A (Medical/Surgical). Baseline vitals and laboratory indices are within acceptable physiological limits. Standard routine surveillance assigned (Priority 3).',
      vitals: { temp: '36.8°C', wbc: '7.4 k/µL', hr: '78 bpm', cvc: '0 hrs' },
      ipcAction: 'Routine standard clinical rounding.',
    },
    {
      title: 'Step 2: Invasive Device Exposure & Early Trend (t = 36h)',
      patientId: 'DEMO-1042',
      riskScore: '43.0%',
      riskCategory: 'MODERATE',
      velocity: '+14.0% / 12h',
      headline: 'Early Upward Velocity & Catheter Dwell',
      description:
        'Central venous catheter and indwelling urinary catheter dwell times accumulate. Mild upward slope in core body temperature (37.8°C) and initial leukocytosis (WBC 11.2). System flags accelerating risk velocity.',
      vitals: { temp: '37.8°C', wbc: '11.2 k/µL', hr: '92 bpm', cvc: '36 hrs' },
      ipcAction: 'Elevated watch status (Priority 2). Verify central line insertion site hygiene.',
    },
    {
      title: 'Step 3: Rapid Escalation & Local Explainability (t = 60h)',
      patientId: 'DEMO-1042',
      riskScore: '82.0%',
      riskCategory: 'CRITICAL',
      velocity: '+39.0% / 12h',
      headline: 'Critical HAI Decision Support Trigger',
      description:
        'Sharp risk acceleration to 82.0% with velocity exceeding +3.25%/hr. TreeSHAP local attribution immediately isolates primary drivers: +CVC Dwell Time, +Temperature Velocity, +24h WBC Delta.',
      vitals: { temp: '38.6°C', wbc: '18.4 k/µL', hr: '114 bpm', cvc: '60 hrs' },
      ipcAction: 'Immediate Priority 1 Review. Audit line maintenance bundle & assess line removal readiness.',
    },
    {
      title: 'Step 4: Spatial Ward Contagion & Cluster Radar (ICU-A)',
      patientId: 'ICU-A Unit',
      riskScore: 'HIGH (41.2% Density)',
      riskCategory: 'CLUSTER SIGNAL',
      velocity: 'Multiple Rising',
      headline: 'Potential Emerging Risk Cluster Signal',
      description:
        'Across ICU-A, 4 adjacent beds (DEMO-1042, DEMO-1108, DEMO-1115, DEMO-1122) exhibit concurrent rapid escalations within the same 24-hour window. Algorithmic radar triggers: "Potential cluster requiring IPC review."',
      vitals: { highRiskBeds: '4 beds', rapidBeds: '3 beds', density: '41.2%' },
      ipcAction: 'Initiate unit environmental screening, audit nurse-to-patient staffing ratios, and review common line trays.',
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Record in audit log and navigate to patient detail
      createAuditLog({
        user_id: 'HACKATHON_JUDGE_EVALUATOR',
        user_role: 'IPC_ADMIN',
        action: 'COMPLETED_90S_SCENARIO_DEMO',
        patient_id: 'DEMO-1042',
        details: { steps_completed: 4, scenario: 'DEMO-1042 Trajectory & ICU-A Cluster' },
      }).catch(console.error);

      onClose();
      navigate('/patients/DEMO-1042');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl shadow-cyan-950/60 relative animate-in fade-in zoom-in duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">90-Second Hackathon Demonstration Tour</h3>
              <p className="text-[11px] text-slate-400">Sequential early-warning to spatial cluster signal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Pills */}
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`p-2 rounded-lg border text-left text-xs transition-all ${
                idx === currentStep
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold'
                  : idx < currentStep
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                  : 'border-slate-800 bg-slate-950 text-slate-500'
              }`}
            >
              <div className="text-[9px] uppercase tracking-wider font-mono">
                {idx < currentStep ? '✓ Done' : `Stage ${idx + 1}`}
              </div>
              <div className="text-[11px] truncate">{idx === 3 ? 'Cluster Signal' : `Risk: ${s.riskScore}`}</div>
            </button>
          ))}
        </div>

        {/* Step Visual Card */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold tracking-wider">
                {step.title}
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">{step.headline}</h4>
            </div>

            <div className="text-right">
              <div
                className={`text-xl font-bold font-mono ${
                  currentStep >= 2 ? 'text-rose-400' : currentStep === 1 ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {step.riskScore}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{step.velocity}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

          {/* Vitals Telemetry Badge Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
            {Object.entries(step.vitals).map(([k, v]) => (
              <div key={k} className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block">{k}</span>
                <strong className="text-slate-200">{v}</strong>
              </div>
            ))}
          </div>

          {/* Action Callout */}
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 flex items-start space-x-2">
            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-100">IPC Decision Support Recommendation: </strong>
              <span>{step.ipcAction}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Deterministic Scenario • Research Prototype</span>
          </div>

          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white transition"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-600/30 transition"
            >
              <span>{currentStep === steps.length - 1 ? 'Inspect Live DEMO-1042 Trajectory' : 'Next Stage'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
