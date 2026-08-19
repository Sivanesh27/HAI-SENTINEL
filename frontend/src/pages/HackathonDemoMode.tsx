import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Thermometer,
  Droplets,
  Wind,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { RiskBadge, PriorityBadge } from '../components/RiskBadge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

// Embedded offline-ready deterministic stages
const OFFLINE_DEMO_STAGES = [
  {
    stage_id: 1,
    label: 'Stage 1: ICU Admission Baseline',
    hour_from_admission: 0,
    elapsed_time_label: 'Hour 0 (Day 1)',
    patient: {
      patient_id: 'DEMO-1042',
      ward_id: 'ICU-A',
      ward_name: 'ICU-A (Medical)',
      bed: 'ICU-A-04',
      age: 69,
      gender: 'Male',
      admission_diagnosis: 'Post-operative Respiratory Failure',
      current_risk: 17.0,
      risk_category: 'LOW' as const,
      risk_delta_12h: 0.0,
      risk_velocity_label: '0.0% / 12h',
      rapid_escalation: false,
      confidence_level: 'HIGH' as const,
      review_priority: 3 as const,
      vitals: {
        temp_c: 36.8,
        wbc: 7.4,
        heart_rate: 78,
        map: 82,
        resp_rate: 16,
        spo2: 98,
        cvc_hours: 0.0,
        foley_hours: 0.0,
        vent_hours: 0.0,
        device_burden: 0,
      },
      shap_drivers: [
        { name: 'Baseline Age (69)', value: 69, shap: 0.12, direction: 'ELEVATES_RISK', category: 'Demographics' },
        { name: 'Normal Body Temperature (36.8°C)', value: 36.8, shap: -0.35, direction: 'REDUCES_RISK', category: 'Vital Signs' },
        { name: 'Normal Leukocyte Count (7.4 k/µL)', value: 7.4, shap: -0.28, direction: 'REDUCES_RISK', category: 'Laboratory' },
        { name: 'Zero Invasive Device Exposure', value: 0, shap: -0.42, direction: 'REDUCES_RISK', category: 'Invasive Devices' },
      ],
    },
    co_patients: [
      { patient_id: 'DEMO-1043', bed: 'ICU-A-05', risk: 14.0, category: 'LOW' as const, velocity: '+0.0%/12h', rapid: false },
      { patient_id: 'DEMO-1044', bed: 'ICU-A-06', risk: 19.0, category: 'LOW' as const, velocity: '+1.0%/12h', rapid: false },
      { patient_id: 'DEMO-1045', bed: 'ICU-A-07', risk: 16.0, category: 'LOW' as const, velocity: '+0.0%/12h', rapid: false },
    ],
    ward_status: {
      ward_id: 'ICU-A',
      ward_risk_level: 'LOW' as const,
      high_risk_count: 0,
      rapidly_rising_count: 0,
      risk_density: 0.165,
      cluster_signal: false,
      cluster_message: 'Baseline surveillance state. No anomalous cluster signals.',
    },
    narrative:
      'Patient DEMO-1042 admitted to ICU-A. Physiological vitals and baseline lab values are within normal limits. Calibrated infection risk is 17.0% (LOW).',
  },
  {
    stage_id: 2,
    label: 'Stage 2: Device Placement & Early Monitoring',
    hour_from_admission: 24,
    elapsed_time_label: 'Hour 24 (Day 2)',
    patient: {
      patient_id: 'DEMO-1042',
      ward_id: 'ICU-A',
      ward_name: 'ICU-A (Medical)',
      bed: 'ICU-A-04',
      age: 69,
      gender: 'Male',
      admission_diagnosis: 'Post-operative Respiratory Failure',
      current_risk: 29.0,
      risk_category: 'LOW' as const,
      risk_delta_12h: 6.0,
      risk_velocity_label: '+6.0% / 12h',
      rapid_escalation: false,
      confidence_level: 'HIGH' as const,
      review_priority: 3 as const,
      vitals: {
        temp_c: 37.2,
        wbc: 9.1,
        heart_rate: 84,
        map: 78,
        resp_rate: 18,
        spo2: 96,
        cvc_hours: 24.0,
        foley_hours: 24.0,
        vent_hours: 12.0,
        device_burden: 3,
      },
      shap_drivers: [
        { name: 'Central Venous Catheter (24 hrs)', value: 24.0, shap: 0.31, direction: 'ELEVATES_RISK', category: 'Invasive Devices' },
        { name: 'Mechanical Ventilation (12 hrs)', value: 12.0, shap: 0.22, direction: 'ELEVATES_RISK', category: 'Invasive Devices' },
        { name: 'Mild Leukocyte Elevation (9.1 k/µL)', value: 9.1, shap: 0.14, direction: 'ELEVATES_RISK', category: 'Laboratory' },
        { name: 'Stable Core Temperature (37.2°C)', value: 37.2, shap: -0.15, direction: 'REDUCES_RISK', category: 'Vital Signs' },
      ],
    },
    co_patients: [
      { patient_id: 'DEMO-1043', bed: 'ICU-A-05', risk: 18.0, category: 'LOW' as const, velocity: '+4.0%/12h', rapid: false },
      { patient_id: 'DEMO-1044', bed: 'ICU-A-06', risk: 22.0, category: 'LOW' as const, velocity: '+3.0%/12h', rapid: false },
      { patient_id: 'DEMO-1045', bed: 'ICU-A-07', risk: 19.0, category: 'LOW' as const, velocity: '+3.0%/12h', rapid: false },
    ],
    ward_status: {
      ward_id: 'ICU-A',
      ward_risk_level: 'LOW' as const,
      high_risk_count: 0,
      rapidly_rising_count: 0,
      risk_density: 0.220,
      cluster_signal: false,
      cluster_message: 'Standard ICU unit surveillance. Devices active.',
    },
    narrative:
      'Central line and mechanical ventilation placed. Device dwell times begin accumulating. Infection probability nudges to 29.0% (LOW).',
  },
  {
    stage_id: 3,
    label: 'Stage 3: CDC Surveillance Horizon (48h)',
    hour_from_admission: 48,
    elapsed_time_label: 'Hour 48 (Day 3)',
    patient: {
      patient_id: 'DEMO-1042',
      ward_id: 'ICU-A',
      ward_name: 'ICU-A (Medical)',
      bed: 'ICU-A-04',
      age: 69,
      gender: 'Male',
      admission_diagnosis: 'Post-operative Respiratory Failure',
      current_risk: 43.0,
      risk_category: 'MODERATE' as const,
      risk_delta_12h: 14.0,
      risk_velocity_label: '+14.0% / 12h',
      rapid_escalation: false,
      confidence_level: 'HIGH' as const,
      review_priority: 2 as const,
      vitals: {
        temp_c: 37.8,
        wbc: 12.2,
        heart_rate: 96,
        map: 72,
        resp_rate: 22,
        spo2: 94,
        cvc_hours: 48.0,
        foley_hours: 48.0,
        vent_hours: 36.0,
        device_burden: 3,
      },
      shap_drivers: [
        { name: 'Central Venous Catheter (48 hrs)', value: 48.0, shap: 0.54, direction: 'ELEVATES_RISK', category: 'Invasive Devices' },
        { name: '12h Temperature Upward Slope (+0.04°C/h)', value: 0.04, shap: 0.42, direction: 'ELEVATES_RISK', category: 'Vital Signs' },
        { name: 'Emerging Leukocytosis (12.2 k/µL)', value: 12.2, shap: 0.38, direction: 'ELEVATES_RISK', category: 'Laboratory' },
        { name: 'Moderate Oxygen Saturation (94%)', value: 94.0, shap: 0.16, direction: 'ELEVATES_RISK', category: 'Vital Signs' },
      ],
    },
    co_patients: [
      { patient_id: 'DEMO-1043', bed: 'ICU-A-05', risk: 32.0, category: 'MODERATE' as const, velocity: '+14.0%/12h', rapid: false },
      { patient_id: 'DEMO-1044', bed: 'ICU-A-06', risk: 28.0, category: 'LOW' as const, velocity: '+6.0%/12h', rapid: false },
      { patient_id: 'DEMO-1045', bed: 'ICU-A-07', risk: 24.0, category: 'LOW' as const, velocity: '+5.0%/12h', rapid: false },
    ],
    ward_status: {
      ward_id: 'ICU-A',
      ward_risk_level: 'MODERATE' as const,
      high_risk_count: 0,
      rapidly_rising_count: 0,
      risk_density: 0.318,
      cluster_signal: false,
      cluster_message: 'Patient crosses CDC Day 3 HAI threshold. Elevated watch.',
    },
    narrative:
      'Patient crosses CDC Day 3 HAI surveillance window (≥48h). Temperature drifts upward (37.8°C) with leukocytosis (12.2 k/µL). Risk reaches MODERATE (43.0%).',
  },
  {
    stage_id: 4,
    label: 'Stage 4: Risk Acceleration & Velocity Spike',
    hour_from_admission: 54,
    elapsed_time_label: 'Hour 54 (Day 3 + 6h)',
    patient: {
      patient_id: 'DEMO-1042',
      ward_id: 'ICU-A',
      ward_name: 'ICU-A (Medical)',
      bed: 'ICU-A-04',
      age: 69,
      gender: 'Male',
      admission_diagnosis: 'Post-operative Respiratory Failure',
      current_risk: 61.0,
      risk_category: 'HIGH' as const,
      risk_delta_12h: 22.0,
      risk_velocity_label: '+22.0% / 12h',
      rapid_escalation: true,
      confidence_level: 'HIGH' as const,
      review_priority: 1 as const,
      vitals: {
        temp_c: 38.2,
        wbc: 15.6,
        heart_rate: 108,
        map: 66,
        resp_rate: 24,
        spo2: 92,
        cvc_hours: 54.0,
        foley_hours: 54.0,
        vent_hours: 42.0,
        device_burden: 3,
      },
      shap_drivers: [
        { name: 'Central Venous Catheter Exposure (54 hrs)', value: 54.0, shap: 0.72, direction: 'ELEVATES_RISK', category: 'Invasive Devices' },
        { name: 'Core Temperature Rise (38.2°C)', value: 38.2, shap: 0.58, direction: 'ELEVATES_RISK', category: 'Vital Signs' },
        { name: 'Rapid WBC Escalation (15.6 k/µL)', value: 15.6, shap: 0.51, direction: 'ELEVATES_RISK', category: 'Laboratory' },
        { name: 'Declining Mean Arterial Pressure (66 mmHg)', value: 66.0, shap: 0.32, direction: 'ELEVATES_RISK', category: 'Vital Signs' },
      ],
    },
    co_patients: [
      { patient_id: 'DEMO-1043', bed: 'ICU-A-05', risk: 58.0, category: 'MODERATE' as const, velocity: '+26.0%/12h', rapid: true },
      { patient_id: 'DEMO-1044', bed: 'ICU-A-06', risk: 48.0, category: 'MODERATE' as const, velocity: '+20.0%/12h', rapid: true },
      { patient_id: 'DEMO-1045', bed: 'ICU-A-07', risk: 36.0, category: 'MODERATE' as const, velocity: '+12.0%/12h', rapid: false },
    ],
    ward_status: {
      ward_id: 'ICU-A',
      ward_risk_level: 'HIGH' as const,
      high_risk_count: 1,
      rapidly_rising_count: 2,
      risk_density: 0.508,
      cluster_signal: false,
      cluster_message: 'Multiple co-located escalations forming in ICU-A.',
    },
    narrative:
      'Acute escalation: Temp rises to 38.2°C, WBC spikes to 15.6 k/µL. Velocity (+22.0%/12h) trips the Rapid Escalation flag. Risk climbs to 61.0% (HIGH).',
  },
  {
    stage_id: 5,
    label: 'Stage 5: Critical Risk & Explainability (WHY?)',
    hour_from_admission: 60,
    elapsed_time_label: 'Hour 60 (Day 3 + 12h)',
    patient: {
      patient_id: 'DEMO-1042',
      ward_id: 'ICU-A',
      ward_name: 'ICU-A (Medical)',
      bed: 'ICU-A-04',
      age: 69,
      gender: 'Male',
      admission_diagnosis: 'Post-operative Respiratory Failure',
      current_risk: 82.0,
      risk_category: 'CRITICAL' as const,
      risk_delta_12h: 39.0,
      risk_velocity_label: '+39.0% / 12h',
      rapid_escalation: true,
      confidence_level: 'HIGH' as const,
      review_priority: 1 as const,
      vitals: {
        temp_c: 38.6,
        wbc: 18.4,
        heart_rate: 114,
        map: 62,
        resp_rate: 26,
        spo2: 91,
        cvc_hours: 60.0,
        foley_hours: 60.0,
        vent_hours: 48.0,
        device_burden: 3,
      },
      shap_drivers: [
        { name: 'Central Venous Catheter Exposure (60 hrs)', value: 60.0, shap: 0.84, direction: 'ELEVATES_RISK', category: 'Invasive Devices' },
        { name: '12h Core Temp Upward Trend (38.6°C)', value: 38.6, shap: 0.62, direction: 'ELEVATES_RISK', category: 'Vital Signs' },
        { name: '24h Leukocytosis Spike (+8.2 k/µL to 18.4)', value: 18.4, shap: 0.53, direction: 'ELEVATES_RISK', category: 'Laboratory' },
        { name: 'Lactate Accumulation (2.8 mmol/L)', value: 2.8, shap: 0.39, direction: 'ELEVATES_RISK', category: 'Laboratory' },
        { name: 'Platelet Nadir & Decline (95 k/µL)', value: 95.0, shap: 0.28, direction: 'ELEVATES_RISK', category: 'Laboratory' },
      ],
    },
    co_patients: [
      { patient_id: 'DEMO-1043', bed: 'ICU-A-05', risk: 74.0, category: 'HIGH' as const, velocity: '+42.0%/12h', rapid: true },
      { patient_id: 'DEMO-1044', bed: 'ICU-A-06', risk: 68.0, category: 'HIGH' as const, velocity: '+40.0%/12h', rapid: true },
      { patient_id: 'DEMO-1045', bed: 'ICU-A-07', risk: 52.0, category: 'MODERATE' as const, velocity: '+28.0%/12h', rapid: true },
    ],
    ward_status: {
      ward_id: 'ICU-A',
      ward_risk_level: 'HIGH' as const,
      high_risk_count: 3,
      rapidly_rising_count: 4,
      risk_density: 0.690,
      cluster_signal: true,
      cluster_message: 'Potential cluster requiring IPC review.',
    },
    narrative:
      'Patient reaches CRITICAL RISK (82.0%). Trajectory velocity is +3.25%/hr. TreeSHAP attribution pinpoints CVC dwell + temperature upward velocity + leukocytosis spike.',
  },
  {
    stage_id: 6,
    label: 'Stage 6: Spatial Contagion Cluster & Priority Rounding',
    hour_from_admission: 66,
    elapsed_time_label: 'Hour 66 (Day 3 + 18h)',
    patient: {
      patient_id: 'DEMO-1042',
      ward_id: 'ICU-A',
      ward_name: 'ICU-A (Medical)',
      bed: 'ICU-A-04',
      age: 69,
      gender: 'Male',
      admission_diagnosis: 'Post-operative Respiratory Failure',
      current_risk: 84.0,
      risk_category: 'CRITICAL' as const,
      risk_delta_12h: 23.0,
      risk_velocity_label: '+23.0% / 12h',
      rapid_escalation: true,
      confidence_level: 'HIGH' as const,
      review_priority: 1 as const,
      vitals: {
        temp_c: 38.8,
        wbc: 19.8,
        heart_rate: 118,
        map: 59,
        resp_rate: 28,
        spo2: 90,
        cvc_hours: 66.0,
        foley_hours: 66.0,
        vent_hours: 54.0,
        device_burden: 3,
      },
      shap_drivers: [
        { name: 'Central Venous Catheter Exposure (66 hrs)', value: 66.0, shap: 0.88, direction: 'ELEVATES_RISK', category: 'Invasive Devices' },
        { name: 'Sustained Pyrexia (38.8°C)', value: 38.8, shap: 0.67, direction: 'ELEVATES_RISK', category: 'Vital Signs' },
        { name: 'Severe Leukocytosis (19.8 k/µL)', value: 19.8, shap: 0.58, direction: 'ELEVATES_RISK', category: 'Laboratory' },
        { name: 'Hemodynamic Instability (MAP 59 mmHg)', value: 59.0, shap: 0.44, direction: 'ELEVATES_RISK', category: 'Vital Signs' },
      ],
    },
    co_patients: [
      { patient_id: 'DEMO-1043', bed: 'ICU-A-05', risk: 86.0, category: 'CRITICAL' as const, velocity: '+28.0%/12h', rapid: true },
      { patient_id: 'DEMO-1044', bed: 'ICU-A-06', risk: 78.0, category: 'HIGH' as const, velocity: '+30.0%/12h', rapid: true },
      { patient_id: 'DEMO-1045', bed: 'ICU-A-07', risk: 64.0, category: 'HIGH' as const, velocity: '+28.0%/12h', rapid: true },
    ],
    ward_status: {
      ward_id: 'ICU-A',
      ward_risk_level: 'HIGH' as const,
      high_risk_count: 4,
      rapidly_rising_count: 4,
      risk_density: 0.780,
      cluster_signal: true,
      cluster_message: 'Potential cluster requiring IPC review.',
      recommendation:
        'Spatial contagion detected in ICU-A. Disinfection dispatched, bundle audits triggered for Beds 04-07.',
    },
    priority_rounding_roster: [
      {
        rank: 1,
        patient_id: 'DEMO-1043',
        bed: 'ICU-A-05',
        risk: 86.0,
        velocity: '+28.0%/12h',
        priority: 1,
        action: 'Immediate line bundle audit & blood culture review',
      },
      {
        rank: 2,
        patient_id: 'DEMO-1042',
        bed: 'ICU-A-04',
        risk: 84.0,
        velocity: '+23.0%/12h',
        priority: 1,
        action: 'Assess CVC line removal readiness & aseptic maintenance',
      },
      {
        rank: 3,
        patient_id: 'DEMO-1044',
        bed: 'ICU-A-06',
        risk: 78.0,
        velocity: '+30.0%/12h',
        priority: 1,
        action: 'Catheter insertion site inspection & dressing change',
      },
      {
        rank: 4,
        patient_id: 'DEMO-1045',
        bed: 'ICU-A-07',
        risk: 64.0,
        velocity: '+28.0%/12h',
        priority: 1,
        action: 'Environmental contact precaution review & hand-hygiene audit',
      },
    ],
    narrative:
      'ICU-A Cluster Anomaly Radar triggers: "Potential cluster requiring IPC review." Beds 04, 05, 06, 07 are prioritized for immediate infection-prevention rounding.',
  },
];

export function HackathonDemoMode() {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 2x, 0.5x

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stage = OFFLINE_DEMO_STAGES[currentStageIdx];
  const patient = stage.patient;
  const vitals = patient.vitals;

  // Trajectory historical chart points up to current stage
  const trajectoryChartData = OFFLINE_DEMO_STAGES.slice(0, currentStageIdx + 1).map((s) => ({
    hour: `Hr ${s.hour_from_admission}`,
    risk: s.patient.current_risk,
    category: s.patient.risk_category,
  }));

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (6000 / speedMultiplier); // 6s per stage at 1x -> 36s total run
      timerRef.current = setInterval(() => {
        setCurrentStageIdx((prev) => {
          if (prev < OFFLINE_DEMO_STAGES.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier]);

  const handleRunDemo = () => {
    setCurrentStageIdx(0);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStageIdx(0);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStageIdx < OFFLINE_DEMO_STAGES.length - 1) {
      setCurrentStageIdx(currentStageIdx + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStageIdx > 0) {
      setCurrentStageIdx(currentStageIdx - 1);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Demo Controller & Header */}
      <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>HAI-Sentinel Deterministic Hackathon Demo Mode</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    OFFLINE READY (&lt;60s)
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Step-by-step verifiable demonstration of temporal risk acceleration and ward cluster anomaly detection
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Playback Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunDemo}
              className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/30 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN DEMO</span>
            </button>

            <button
              onClick={handlePause}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
            </button>

            <button
              onClick={handleStepBackward}
              disabled={currentStageIdx === 0}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
              title="Step Backward"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStageIdx === OFFLINE_DEMO_STAGES.length - 1}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              <span>STEP FORWARD</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET DEMO</span>
            </button>

            {/* Speed Toggle */}
            <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden text-[11px] font-mono">
              <button
                onClick={() => setSpeedMultiplier(1)}
                className={`px-2.5 py-1.5 ${speedMultiplier === 1 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
              >
                1x
              </button>
              <button
                onClick={() => setSpeedMultiplier(2)}
                className={`px-2.5 py-1.5 ${speedMultiplier === 2 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
              >
                2x
              </button>
            </div>
          </div>
        </div>

        {/* 6-Stage Timeline Stepper Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {OFFLINE_DEMO_STAGES.map((s, idx) => {
            const isCurrent = idx === currentStageIdx;
            const isPast = idx < currentStageIdx;
            return (
              <button
                key={s.stage_id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStageIdx(idx);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-md shadow-cyan-950 ring-1 ring-cyan-500'
                    : isPast
                    ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                    : 'border-slate-800/40 bg-slate-950/40 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                  <span>{s.elapsed_time_label}</span>
                  {isPast && <span className="text-emerald-400">✓</span>}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">
                  {idx === 5 ? 'Contagion Cluster' : `${s.patient.current_risk.toFixed(0)}% Risk`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Narrative Broadcast Banner */}
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs text-cyan-200 flex items-start space-x-3 shadow-lg">
        <Activity className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-0.5">
          <strong className="font-bold text-white uppercase tracking-wider">{stage.label}:</strong>
          <p className="text-slate-300 leading-relaxed">{stage.narrative}</p>
        </div>
      </div>

      {/* Main Demo Grid: Patient Trajectory + Telemetry + SHAP + Ward Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Patient Live Risk Meter & Area Trajectory */}
        <div className="lg:col-span-7 space-y-6">
          {/* Patient Hero Badge */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white font-mono">{patient.patient_id}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 font-mono">
                    DEMO COHORT
                  </span>
                  <PriorityBadge priority={patient.review_priority} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {patient.age}y {patient.gender} • {patient.ward_name} (Bed {patient.bed}) • {patient.admission_diagnosis}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <RiskBadge category={patient.risk_category} size="lg" />
              </div>
            </div>

            {/* Live Risk Meter & Progression Velocity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Radial Risk Counter */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Calibrated Risk</span>
                <div
                  className={`text-4xl font-extrabold font-mono transition-colors duration-300 ${
                    patient.current_risk >= 80
                      ? 'text-rose-400'
                      : patient.current_risk >= 60
                      ? 'text-amber-400'
                      : patient.current_risk >= 30
                      ? 'text-yellow-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {patient.current_risk.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {patient.current_risk >= 80 ? 'HIGH RISK' : 'Surveillance Posterior'}
                </div>
              </div>

              {/* 12h Delta */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">12h Risk Delta</span>
                <div
                  className={`text-3xl font-bold font-mono mt-1 ${
                    patient.risk_delta_12h > 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {patient.risk_delta_12h >= 0 ? `+${patient.risk_delta_12h.toFixed(1)}%` : `${patient.risk_delta_12h.toFixed(1)}%`}
                </div>
                <span className="text-[10px] text-slate-500">&Delta;Risk in 12h Window</span>
              </div>

              {/* Trajectory Velocity */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Risk Velocity (v)</span>
                <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">
                  {patient.risk_velocity_label}
                </div>
                <span className="text-[10px] text-slate-500">Derivative Velocity</span>
              </div>
            </div>

            {/* Rapid Escalation Warning Callout (Stage 4, 5, 6) */}
            {patient.rapid_escalation && (
              <div className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-200 text-xs flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2.5">
                  <Zap className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="font-bold tracking-wide">
                    Risk increased rapidly: 12-hour velocity exceeds +1.25%/hr or 12h delta &ge; +15%
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/30 font-mono font-bold uppercase">
                  IPC Priority 1
                </span>
              </div>
            )}

            {/* Trajectory Recharts Visualization */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Observed Trajectory Progression ({OFFLINE_DEMO_STAGES.slice(0, currentStageIdx + 1).map(s => `${s.patient.current_risk}%`).join(' → ')})</span>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="demoRiskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={patient.current_risk >= 80 ? '#ef4444' : '#06b6d4'} stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [`${val.toFixed(1)}%`, 'HAI Risk Score']}
                    />
                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={60} stroke="#f97316" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke={patient.current_risk >= 80 ? '#ef4444' : patient.current_risk >= 60 ? '#f97316' : '#06b6d4'}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#demoRiskGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Real-time Physiological Telemetry Grid */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Current Physiological Telemetry &amp; Device Burden</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase flex items-center space-x-1">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  <span>Temp</span>
                </span>
                <div className={`text-base font-bold mt-1 ${vitals.temp_c >= 38.0 ? 'text-rose-400' : 'text-white'}`}>
                  {vitals.temp_c.toFixed(1)}°C
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase flex items-center space-x-1">
                  <Droplets className="w-3 h-3 text-purple-400" />
                  <span>WBC</span>
                </span>
                <div className={`text-base font-bold mt-1 ${vitals.wbc >= 12.0 ? 'text-amber-400' : 'text-white'}`}>
                  {vitals.wbc.toFixed(1)} k/µL
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>Heart Rate</span>
                </span>
                <div className="text-base font-bold text-white mt-1">{vitals.heart_rate} bpm</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase flex items-center space-x-1">
                  <Wind className="w-3 h-3 text-emerald-400" />
                  <span>CVC Dwell</span>
                </span>
                <div className="text-base font-bold text-cyan-400 mt-1">{vitals.cvc_hours} hrs</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase flex items-center space-x-1">
                  <Wind className="w-3 h-3 text-blue-400" />
                  <span>Ventilator</span>
                </span>
                <div className="text-base font-bold text-blue-400 mt-1">{vitals.vent_hours} hrs</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-slate-400" />
                  <span>Devices</span>
                </span>
                <div className="text-base font-bold text-white mt-1">{vitals.device_burden} active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): "WHY?" SHAP Contributors + ICU-A Spatial Contagion Cluster */}
        <div className="lg:col-span-5 space-y-6">
          {/* "WHY?" TreeSHAP Top Contributors Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  WHY? Top Model Contributors (SHAP)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Local Attribution
              </span>
            </div>

            <div className="space-y-3">
              {patient.shap_drivers.map((d, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">{d.name}</span>
                    <span
                      className={`font-mono font-bold ${
                        d.direction === 'ELEVATES_RISK' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {d.shap > 0 ? `+${d.shap.toFixed(2)}` : d.shap.toFixed(2)}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        d.direction === 'ELEVATES_RISK' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(Math.abs(d.shap) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ICU-A Spatial Ward Radar & Multi-Patient Cluster */}
          <div
            className={`rounded-xl border p-5 space-y-4 shadow-xl transition-all ${
              stage.ward_status.cluster_signal
                ? 'border-rose-500/60 bg-rose-950/20'
                : 'border-slate-800 bg-slate-900/80'
            }`}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  ICU-A Unit Spatial Contagion Radar
                </h3>
              </div>
              <RiskBadge category={stage.ward_status.ward_risk_level} size="sm" />
            </div>

            {/* Cluster Alert Status */}
            {stage.ward_status.cluster_signal ? (
              <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 font-bold flex items-center space-x-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Potential cluster requiring IPC review.</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-mono">
                Density: {(stage.ward_status.risk_density * 100).toFixed(1)}% • No anomalous clustering
              </div>
            )}

            {/* Co-located Fictional Patients in ICU-A */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Adjacent Co-Located Beds (ICU-A)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {stage.co_patients.map((co) => (
                  <div
                    key={co.patient_id}
                    className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 transition-all ${
                      co.risk >= 80
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                        : co.risk >= 60
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                        : co.risk >= 30
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>{co.patient_id}</span>
                      <span>{co.risk.toFixed(0)}%</span>
                    </div>
                    <div className="text-[10px] flex justify-between text-slate-400">
                      <span>{co.bed}</span>
                      <span className={co.rapid ? 'text-rose-400 font-bold' : ''}>{co.velocity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stage 6 Priority Review Roster */}
          {stage.priority_rounding_roster && (
            <div className="rounded-xl border border-purple-500/40 bg-slate-900/90 p-5 space-y-3 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Targeted Priority Review Rounding List
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  IPC ROUNDING
                </span>
              </div>

              <div className="space-y-2">
                {stage.priority_rounding_roster.map((item) => (
                  <div
                    key={item.patient_id}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-purple-400">#{item.rank}</span>
                      <span className="font-bold text-white">{item.patient_id}</span>
                      <span className="text-slate-400">({item.bed})</span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="text-rose-400 font-bold">{item.risk.toFixed(1)}%</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{item.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
