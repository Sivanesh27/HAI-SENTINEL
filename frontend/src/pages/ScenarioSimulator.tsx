import { useState } from 'react';
import { simulateScenario } from '../services/api';
import { ScenarioSimulationResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { SHAPContributionsCard } from '../components/SHAPContributionsCard';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  TrendingUp,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                What-If Non-Causal Scenario Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Explore model sensitivity to hypothetical clinical parameter perturbations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Reference Patient:</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold text-xs">
            DEMO-1042 (82.0% Critical Baseline)
          </span>
        </div>
      </div>

      {/* Prominent Non-Causal Framing Alert */}
      <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-200 flex items-start space-x-3 shadow-lg">
        <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-100 font-bold">Scientific & Ethical Disclaimer — Non-Causal Simulator:</strong>
          <p className="text-amber-300/90 leading-relaxed">
            This module evaluates statistical tree model behavior under altered inputs. It does NOT predict clinical causal treatment effects or guarantee that removing a central line or normalizing temperature will produce the estimated risk delta. Use exclusively for model interpretability and sensitivity analysis.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Simulation Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Hypothetical Parameter Adjustments</span>
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Sliders List */}
          <div className="space-y-5">
            {/* CVC Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Central Venous Catheter Exposure:</span>
                </span>
                <strong className="font-mono text-cyan-400">{cvcHours} hrs</strong>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="6"
                value={cvcHours}
                onChange={(e) => setCvcHours(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 hrs (Removed)</span>
                <span>Baseline: 60 hrs</span>
                <span>120 hrs</span>
              </div>
            </div>

            {/* Foley Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Indwelling Urinary Catheter Exposure:</span>
                </span>
                <strong className="font-mono text-blue-400">{foleyHours} hrs</strong>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="6"
                value={foleyHours}
                onChange={(e) => setFoleyHours(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 hrs</span>
                <span>Baseline: 60 hrs</span>
                <span>120 hrs</span>
              </div>
            </div>

            {/* Body Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Core Body Temperature (°C):</span>
                </span>
                <strong className="font-mono text-amber-400">{tempC.toFixed(1)} °C</strong>
              </div>
              <input
                type="range"
                min="36.0"
                max="40.5"
                step="0.1"
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>36.0°C</span>
                <span>Baseline: 38.6°C</span>
                <span>40.5°C</span>
              </div>
            </div>

            {/* WBC Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>White Blood Cell Count (WBC):</span>
                </span>
                <strong className="font-mono text-purple-400">{wbc.toFixed(1)} k/µL</strong>
              </div>
              <input
                type="range"
                min="4.0"
                max="25.0"
                step="0.5"
                value={wbc}
                onChange={(e) => setWbc(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>4.0 k/µL</span>
                <span>Baseline: 18.4 k/µL</span>
                <span>25.0 k/µL</span>
              </div>
            </div>

            {/* Temperature Slope */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  <span>12h Temperature Trend Slope:</span>
                </span>
                <strong className="font-mono text-rose-400">{tempSlope.toFixed(2)} °C/h</strong>
              </div>
              <input
                type="range"
                min="-0.1"
                max="0.2"
                step="0.02"
                value={tempSlope}
                onChange={(e) => setTempSlope(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-0.10 °C/h</span>
                <span>Baseline: +0.08</span>
                <span>+0.20 °C/h</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? 'Executing Inference Simulation...' : 'Run What-If Simulation'}</span>
          </button>
        </div>

        {/* Right Column: Simulation Comparison & Dynamic SHAP Attributions */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Delta Comparison Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Model Response & Predicted Risk Delta
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                    SIMULATION COMPLETE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Baseline Risk</span>
                    <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                      {result.baseline_risk_pct.toFixed(1)}%
                    </div>
                    <div className="mt-1">
                      <RiskBadge category={result.baseline_category} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Simulated Risk</span>
                    <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                      {result.simulated_risk_pct.toFixed(1)}%
                    </div>
                    <div className="mt-1">
                      <RiskBadge category={result.simulated_category} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Risk Delta (&Delta;)</span>
                    <div
                      className={`text-2xl font-bold font-mono mt-1 ${
                        result.delta_risk_pct < 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.delta_risk_pct > 0 ? `+${result.delta_risk_pct.toFixed(1)}%` : `${result.delta_risk_pct.toFixed(1)}%`}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Statistical Shift</span>
                  </div>
                </div>
              </div>

              {/* Dynamic SHAP Explanations for the Simulated Point */}
              <SHAPContributionsCard explanation={result.simulated_explanation} />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sliders className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Adjust Parameters & Run Simulation</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Modify device dwell durations, temperature slope, or laboratory values on the left panel to observe how the gradient-boosted decision trees dynamically alter risk scores and feature attributions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
