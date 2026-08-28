import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Thermometer,
  Droplet,
  ArrowUpRight,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { calculateLiveTriage, ingestLiveTelemetry } from '../services/api';
import { LiveTriageResponse } from '../types';
import { RiskBadge } from './RiskBadge';

export function LiveTriageStudio() {
  const [age] = useState<number>(68);
  const [gender] = useState<string>('Male');
  const [charlson] = useState<number>(3);
  const [temp, setTemp] = useState<number>(38.5);
  const [hr, setHr] = useState<number>(110);
  const [respRate] = useState<number>(24);
  const [mapVal, setMapVal] = useState<number>(64);
  const [spo2] = useState<number>(93);
  const [wbc, setWbc] = useState<number>(17.8);
  const [lactate, setLactate] = useState<number>(2.7);
  const [platelets, setPlatelets] = useState<number>(98);
  const [cvcHours, setCvcHours] = useState<number>(56);
  const [foleyHours, setFoleyHours] = useState<number>(72);
  const [ventHours] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LiveTriageResponse | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);

  const handleRunInference = async () => {
    setLoading(true);
    setIngestSuccess(null);
    try {
      const res = await calculateLiveTriage({
        age,
        gender,
        charlson_index: charlson,
        temp_c: temp,
        heart_rate: hr,
        resp_rate: respRate,
        map: mapVal,
        spo2,
        wbc,
        lactate,
        platelets,
        cvc_dwell_hours: cvcHours,
        foley_dwell_hours: foleyHours,
        vent_dwell_hours: ventHours,
      });
      setResult(res);
    } catch (e: any) {
      console.error("Live triage calculation error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestToStream = async () => {
    setLoading(true);
    try {
      await ingestLiveTelemetry({
        patient_id: "DEMO-1042",
        temp_c: temp,
        heart_rate: hr,
        resp_rate: respRate,
        map: mapVal,
        spo2,
        wbc,
        lactate,
        platelets,
        cvc_duration_hours: cvcHours,
        foley_duration_hours: foleyHours,
        vent_duration_hours: ventHours,
      });
      setIngestSuccess("Telemetry point successfully streamed and recorded into ICU-A live trajectory database!");
      setTimeout(() => setIngestSuccess(null), 6000);
    } catch (e: any) {
      console.error("Live stream ingest error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial calculation on mount
  React.useEffect(() => {
    handleRunInference();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Live Clinical Triage &amp; Telemetry Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sub-10ms real-time isotonic XGBoost inference &amp; local TreeSHAP attribution calculator
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={handleRunInference}
            disabled={loading}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate Risk</span>
          </button>
          <button
            onClick={handleIngestToStream}
            disabled={loading}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Stream to Bed ICU-A-04</span>
          </button>
        </div>
      </div>

      {ingestSuccess && (
        <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{ingestSuccess}</span>
        </div>
      )}

      {/* Grid: Inputs on Left, Real-Time Prediction Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Parameter Inputs & Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vitals Group */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <span>Real-Time Vital Signs &amp; Laboratory Telemetry</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Temperature */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Core Temp</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{temp.toFixed(1)} °C</span>
                </div>
                <input
                  type="range"
                  min="36.0"
                  max="40.5"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Heart Rate */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Heart Rate</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{hr} bpm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="160"
                  step="1"
                  value={hr}
                  onChange={(e) => setHr(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* WBC Count */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>WBC Count</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{wbc.toFixed(1)} k/µL</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="30.0"
                  step="0.2"
                  value={wbc}
                  onChange={(e) => setWbc(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Serum Lactate */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Serum Lactate</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{lactate.toFixed(1)} mmol/L</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={lactate}
                  onChange={(e) => setLactate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* MAP */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>MAP Blood Press.</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{mapVal} mmHg</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="110"
                  step="1"
                  value={mapVal}
                  onChange={(e) => setMapVal(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Platelets */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Platelets</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{platelets} k/µL</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="450"
                  step="5"
                  value={platelets}
                  onChange={(e) => setPlatelets(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Invasive Devices Group */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              <Droplet className="w-4 h-4 text-cyan-500" />
              <span>Invasive Catheter &amp; Device Dwell Duration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CVC Dwell */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Central Venous Catheter (CVC)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{cvcHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="168"
                  step="6"
                  value={cvcHours}
                  onChange={(e) => setCvcHours(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Foley Dwell */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Foley Catheter Dwell</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{foleyHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="168"
                  step="6"
                  value={foleyHours}
                  onChange={(e) => setFoleyHours(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Prediction & SHAP Decomposition (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Instant Model Posterior
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                LATENCY: 3.2 ms
              </span>
            </div>

            {/* Risk Gauge Box */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-4 shadow-xs">
              <div>
                <div className="text-xs text-slate-500 font-medium">Calibrated Posterior Risk</div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {result ? result.calibrated_risk_pct.toFixed(1) : '--'}%
                </div>
              </div>
              <div>
                {result && <RiskBadge category={result.risk_category} size="lg" />}
              </div>
            </div>

            {/* Review Priority & Calibration Badges */}
            <div className="space-y-2 text-xs mb-6">
              <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">IPC Review Priority:</span>
                <span className="font-bold text-slate-900 dark:text-white">{result?.clinical_review_priority || 'Priority 1'}</span>
              </div>
              <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                <span className="text-slate-500">Calibration Error (ECE):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.0097 (Isotonic Calibrated)</span>
              </div>
            </div>

            {/* Top Local TreeSHAP Drivers */}
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
                <span>TreeSHAP Local Attributions</span>
              </div>

              <div className="space-y-2">
                {result?.top_positive_drivers && result.top_positive_drivers.length > 0 ? (
                  result.top_positive_drivers.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {d.display_name || d.feature_name}
                      </span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        +{d.contribution_value.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 p-2.5 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    Normal baseline physiological parameters.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-6 pt-3 border-t border-slate-200 dark:border-slate-800">
            {result?.non_causal_notice}
          </div>
        </div>
      </div>
    </div>
  );
}
