import { useState } from 'react';
import { simulateScenario } from '../services/api';
import { ScenarioSimulationResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { SHAPContributionsCard } from '../components/SHAPContributionsCard';
import {
  Sliders,
  Play,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

export function ScenarioSimulator() {
  const defaultBase = {
    age: 69,
    gender_male: 1,
    charlson_comorbidity_index: 3,
    recent_surgery: 1,
    hour_from_admission: 60,
    heart_rate_last: 114.0,
    heart_rate_mean_12h: 108.0,
    heart_rate_slope_12h: 1.2,
    temp_c_last: 38.6,
    temp_c_max_12h: 38.7,
    temp_c_slope_12h: 0.08,
    resp_rate_mean_12h: 26.0,
    spo2_min_12h: 91.0,
    map_mean_12h: 68.0,
    map_min_12h: 62.0,
    wbc_last: 18.4,
    wbc_change_24h: 8.2,
    wbc_slope_24h: 0.35,
    platelets_last: 95.0,
    platelets_slope_24h: -2.1,
    creatinine_last: 2.1,
    lactate_last: 2.8,
    cvc_duration_hours: 60.0,
    foley_duration_hours: 60.0,
    vent_duration_hours: 48.0,
    total_device_burden: 3,
    broad_spec_antibiotics_72h: 1,
  };

  const [cvcHours, setCvcHours] = useState<number>(0.0);
  const [foleyHours, setFoleyHours] = useState<number>(0.0);
  const [tempC, setTempC] = useState<number>(37.0);
  const [wbc, setWbc] = useState<number>(8.5);
  const [tempSlope, setTempSlope] = useState<number>(0.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const perturbed = {
        cvc_duration_hours: cvcHours,
        foley_duration_hours: foleyHours,
        temp_c_last: tempC,
        temp_c_max_12h: Math.max(tempC, defaultBase.temp_c_max_12h),
        temp_c_slope_12h: tempSlope,
        wbc_last: wbc,
        wbc_change_24h: wbc - 8.0,
        total_device_burden: (cvcHours > 0 ? 1 : 0) + (foleyHours > 0 ? 1 : 0) + 1,
      };

      const sim = await simulateScenario({
        patient_id: 'DEMO-1042',
        base_features: defaultBase,
        perturbed_features: perturbed,
      });

      setResult(sim);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCvcHours(0.0);
    setFoleyHours(0.0);
    setTempC(37.0);
    setWbc(8.5);
    setTempSlope(0.0);
    setResult(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                What-If Counterfactual Scenario Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Explore model sensitivity under hypothetical clinical perturbations &amp; catheter bundle changes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Causal Scientific Notice Banner */}
      <div className="p-5 rounded-3xl border border-purple-200 dark:border-purple-500/30 bg-purple-50/70 dark:bg-purple-500/10 text-xs text-purple-900 dark:text-purple-200 flex items-start space-x-3 shadow-xs">
        <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-purple-950 dark:text-purple-100 text-sm">
            MODEL-BASED SIMULATION — NOT A CAUSAL CLINICAL PREDICTION
          </strong>
          <p className="text-purple-900/90 dark:text-purple-300/90 leading-relaxed text-xs">
            This module evaluates statistical tree model sensitivity by perturbing feature inputs. Results illustrate model behavior and do NOT imply that changing a single physiological parameter or device hour will deterministically alter clinical outcomes in a live patient.
          </p>
        </div>
      </div>

      {/* Simulator Inputs & Result Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Interactive Sliders */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Perturbation Parameters (Patient DEMO-1042)
            </h3>
            <span className="text-xs font-mono text-slate-500">t = 60h Snapshot</span>
          </div>

          <div className="space-y-5">
            {/* CVC Hours */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Central Line (CVC) Dwell</span>
                <span className="font-mono font-extrabold text-cyan-600 dark:text-cyan-400">{cvcHours} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="6"
                value={cvcHours}
                onChange={(e) => setCvcHours(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">Baseline was 60.0h indwelling exposure</div>
            </div>

            {/* Foley Hours */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Foley Catheter Dwell</span>
                <span className="font-mono font-extrabold text-cyan-600 dark:text-cyan-400">{foleyHours} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="6"
                value={foleyHours}
                onChange={(e) => setFoleyHours(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">Baseline was 60.0h indwelling exposure</div>
            </div>

            {/* Core Temp */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Hypothetical Core Temp</span>
                <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">{tempC.toFixed(1)} &deg;C</span>
              </div>
              <input
                type="range"
                min="36.0"
                max="40.0"
                step="0.1"
                value={tempC}
                onChange={(e) => setTempC(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">Baseline was 38.6&deg;C (Fever spike)</div>
            </div>

            {/* WBC Count */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Hypothetical WBC Count</span>
                <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">{wbc.toFixed(1)} k/µL</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="25.0"
                step="0.5"
                value={wbc}
                onChange={(e) => setWbc(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">Baseline was 18.4 k/µL (Severe leukocytosis)</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Evaluating Model...' : 'Execute Counterfactual Simulation'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition border border-slate-200 dark:border-slate-700"
              title="Reset sliders"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Simulation Results */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Simulation Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Baseline observation vs. Counterfactual hypothesis</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Baseline */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Observed Baseline</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                82.0%
              </div>
              <RiskBadge category="CRITICAL" size="sm" />
            </div>

            {/* Simulated */}
            <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-slate-950/60 border border-cyan-200 dark:border-cyan-500/40 space-y-2">
              <span className="text-[11px] text-cyan-700 dark:text-cyan-400 uppercase font-bold">Simulated Outcome</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
                {result ? `${result.simulated_risk_pct.toFixed(1)}%` : '--'}
              </div>
              {result && <RiskBadge category={result.simulated_category} size="sm" />}
            </div>
          </div>

          {result && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300">
                Estimated Risk Shift: {result.delta_risk_pct.toFixed(1)}%
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Removing central line dwell hours and normalizing temperature &amp; WBC significantly attenuates positive SHAP log-odds.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SHAP Attributions for the Simulated Scenario */}
      {result && <SHAPContributionsCard explanation={result.simulated_explanation} />}
    </div>
  );
}
