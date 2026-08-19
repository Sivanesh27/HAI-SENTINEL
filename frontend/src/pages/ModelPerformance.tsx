import { useEffect, useState } from 'react';
import { fetchModelPerformance, fetchModelComparison } from '../services/api';
import { ModelPerformanceResponse, ModelComparisonItem } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  BrainCircuit,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

export function ModelPerformance() {
  const [performance, setPerformance] = useState<ModelPerformanceResponse | null>(null);
  const [comparison, setComparison] = useState<ModelComparisonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([fetchModelPerformance(), fetchModelComparison()])
      .then(([perfData, compData]) => {
        setPerformance(perfData);
        setComparison(compData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !performance) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-slate-400">Loading ML Evaluation Curves & Calibration Diagnostics...</span>
        </div>
      </div>
    );
  }

  const { metrics, calibration, roc_curve, pr_curve, confusion_matrix, metadata } = performance;

  // Format calibration curve points
  const calCurveData = calibration.bins.map((b) => ({
    confidence: b.confidence_mean * 100,
    empiricalAccuracy: b.accuracy_empirical * 100,
    perfect: b.confidence_mean * 100,
    count: b.count,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Model Performance, Calibration & Scientific Governance
              </h2>
              <p className="text-xs text-slate-400">
                Rigorous empirical validation on held-out patient cohorts with zero temporal/patient leakage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Primary Engine:</span>
          <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
            XGBoost (Calibrated Isotonic)
          </span>
        </div>
      </div>

      {/* Top Validation Metrics Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">AUROC</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">{metrics.auroc.toFixed(4)}</div>
          <span className="text-[10px] text-slate-500">Discrimination Power</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">AUPRC (Primary)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.auprc.toFixed(4)}</div>
          <span className="text-[10px] text-slate-500">Precision-Recall Curve</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Sens @ 85% Spec</span>
          <div className="text-2xl font-bold font-mono text-purple-400">{metrics.sens_at_85_spec.toFixed(4)}</div>
          <span className="text-[10px] text-slate-500">Clinical Operating Point</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">F1-Score</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{metrics.f1.toFixed(4)}</div>
          <span className="text-[10px] text-slate-500">Harmonic Mean</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Brier Score</span>
          <div className="text-2xl font-bold font-mono text-emerald-300">{metrics.brier_score.toFixed(4)}</div>
          <span className="text-[10px] text-slate-500">Probability Error (Lower is better)</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">ECE Calibration</span>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {calibration.expected_calibration_error.toFixed(4)}
          </div>
          <span className="text-[10px] text-slate-500">Expected Calibration Error</span>
        </div>
      </div>

      {/* Main Validation Curves Grid: ROC Curve, PR Curve, Calibration Reliability Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. ROC Curve */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Receiver Operating Characteristic</h3>
              <span className="text-[10px] text-slate-400">AUROC = {metrics.auroc.toFixed(4)}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              ROC Curve
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roc_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="fpr" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'FPR (1 - Spec)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis dataKey="tpr" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'TPR (Sens)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: number) => [val.toFixed(3)]}
                />
                <ReferenceLine x={0.15} stroke="#a855f7" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="tpr" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Precision-Recall Curve */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Precision-Recall Curve</h3>
              <span className="text-[10px] text-slate-400">AUPRC = {metrics.auprc.toFixed(4)} (Low Prevalence Focus)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              PR Curve
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pr_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="recall" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Recall', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis dataKey="precision" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: number) => [val.toFixed(3)]}
                />
                <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Isotonic Calibration Reliability Curve */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Probability Calibration</h3>
              <span className="text-[10px] text-slate-400">Isotonic Regression (ECE = {calibration.expected_calibration_error.toFixed(4)})</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
              Reliability
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="confidence" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Predicted Risk %', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis dataKey="empiricalAccuracy" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Empirical %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: number) => [`${val.toFixed(1)}%`]}
                />
                <Line type="monotone" dataKey="perfect" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="empiricalAccuracy" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Zoo Comparison & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Comparison Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Model Benchmark & Comparison Zoo</h3>
              <p className="text-[11px] text-slate-400">Strict patient-level GroupShuffleSplit hold-out evaluation (38 unseen test patients)</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              3 Models Evaluated
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Model Candidate</th>
                  <th className="py-3 px-3">AUROC</th>
                  <th className="py-3 px-3">AUPRC</th>
                  <th className="py-3 px-3">F1-Score</th>
                  <th className="py-3 px-3">Sens @ 85% Spec</th>
                  <th className="py-3 px-3">Calibrated Brier</th>
                  <th className="py-3 px-3">ECE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {comparison.map((m) => (
                  <tr key={m.model_name} className={m.is_primary ? 'bg-cyan-950/20 font-bold text-cyan-200' : 'text-slate-300'}>
                    <td className="py-3 px-3 flex items-center space-x-2 font-sans">
                      <span>{m.model_name}</span>
                      {m.is_primary && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          PRIMARY
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">{m.auroc.toFixed(4)}</td>
                    <td className="py-3 px-3 text-emerald-400">{m.auprc.toFixed(4)}</td>
                    <td className="py-3 px-3">{m.f1_score.toFixed(4)}</td>
                    <td className="py-3 px-3">{m.sens_at_85_spec.toFixed(4)}</td>
                    <td className="py-3 px-3">{m.brier_score_calibrated.toFixed(4)}</td>
                    <td className="py-3 px-3">{m.expected_calibration_error.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2x2 Confusion Matrix */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Confusion Matrix</h3>
              <p className="text-[11px] text-slate-400">At operating threshold &ge; {metrics.operating_threshold}</p>
            </div>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-2">
            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">True Negatives</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{confusion_matrix.true_negative}</div>
              <span className="text-[10px] text-slate-500">Correct Controls</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">False Positives</span>
              <div className="text-xl font-bold text-rose-400 mt-1">{confusion_matrix.false_positive}</div>
              <span className="text-[10px] text-slate-500">False Alarms</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">False Negatives</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{confusion_matrix.false_negative}</div>
              <span className="text-[10px] text-slate-500">Missed Events</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">True Positives</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">{confusion_matrix.true_positive}</div>
              <span className="text-[10px] text-slate-500">Correct Detections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Governance Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-start space-x-3">
        <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white">Validation Guarantee:</strong>
          <p className="text-slate-400">
            Training and validation splits were executed using patient-level GroupShuffleSplit on {metadata.split_summary.train_patients} train patients, {metadata.split_summary.val_patients} validation patients, and {metadata.split_summary.test_patients} holdout test patients. No individual patient observations crossed partition boundaries. All rolling features were computed strictly from historical backward-looking windows to eliminate temporal lookahead bias.
          </p>
        </div>
      </div>
    </div>
  );
}
