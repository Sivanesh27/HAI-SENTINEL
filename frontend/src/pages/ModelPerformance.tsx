import { useEffect, useState } from 'react';
import { fetchModelPerformance, fetchModelComparison } from '../services/api';
import { ModelPerformanceResponse, ModelComparisonItem } from '../types';
import { useUI } from '../context/UIContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  BrainCircuit,
} from 'lucide-react';

export function ModelPerformance() {
  const [performance, setPerformance] = useState<ModelPerformanceResponse | null>(null);
  const [comparison, setComparison] = useState<ModelComparisonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme } = useUI();

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
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400 font-semibold">
            Loading ML Evaluation Curves &amp; Calibration Diagnostics...
          </span>
        </div>
      </div>
    );
  }

  const { metrics, calibration, roc_curve, pr_curve } = performance;

  // Format calibration curve points
  const calCurveData = calibration.bins.map((b) => ({
    confidence: b.confidence_mean * 100,
    empiricalAccuracy: b.accuracy_empirical * 100,
    perfect: b.confidence_mean * 100,
    count: b.count,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Model Performance, Calibration &amp; Scientific Governance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Rigorous empirical validation on held-out patient cohorts with zero temporal/patient leakage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Primary Engine:</span>
          <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-extrabold border border-cyan-200 dark:border-cyan-500/30">
            XGBoost (Calibrated Isotonic)
          </span>
        </div>
      </div>

      {/* Top Validation Metrics Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">AUROC</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">{metrics.auroc.toFixed(4)}</div>
          <span className="text-xs text-slate-500 font-medium">Discrimination Power</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">AUPRC (Primary)</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{metrics.auprc.toFixed(4)}</div>
          <span className="text-xs text-slate-500 font-medium">Precision-Recall Curve</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">F1-Score</span>
          <div className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400">{metrics.f1.toFixed(4)}</div>
          <span className="text-xs text-slate-500 font-medium">Harmonic Balance</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Sensitivity</span>
          <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">{(metrics.sensitivity * 100).toFixed(1)}%</div>
          <span className="text-xs text-slate-500 font-medium">At 85% Specificity</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Brier Error</span>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{metrics.brier_score.toFixed(4)}</div>
          <span className="text-xs text-slate-500 font-medium">Mean Squared Error</span>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 shadow-sm space-y-1.5">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">Calib. ECE</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{calibration.expected_calibration_error.toFixed(4)}</div>
          <span className="text-xs text-slate-500 font-medium">&lt;0.010 Isotonic Gold</span>
        </div>
      </div>

      {/* Model Zoo Comparison Benchmark Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Multi-Model Evaluation &amp; Benchmark Comparison (Held-out Test Cohort)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparing primary Isotonic XGBoost against Random Forest ensemble and Linear Logistic Regression
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4">AUROC</th>
                <th className="py-3 px-4">AUPRC (Primary)</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">Sens @ 85% Spec</th>
                <th className="py-3 px-4">Brier Score</th>
                <th className="py-3 px-4">ECE Error</th>
                <th className="py-3 px-4 text-right">Selection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {comparison.map((m, i) => (
                <tr key={i} className={m.is_primary ? 'bg-cyan-50/40 dark:bg-cyan-500/5 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}>
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 dark:text-white text-sm">{m.model_name}</strong>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{m.auroc.toFixed(4)}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{m.auprc.toFixed(4)}</td>
                  <td className="py-3.5 px-4 font-mono">{m.f1_score.toFixed(4)}</td>
                  <td className="py-3.5 px-4 font-mono">{(m.sens_at_85_spec * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-4 font-mono">{m.brier_score_calibrated.toFixed(4)}</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-600 dark:text-cyan-400 font-bold">{m.expected_calibration_error.toFixed(4)}</td>
                  <td className="py-3.5 px-4 text-right">
                    {m.is_primary ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-[10px] font-extrabold border border-cyan-300 dark:border-cyan-500/30">
                        PRIMARY ENGINE
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Evaluated Benchmark</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Diagnostic Charts: ROC Curve, PR Curve, Calibration Reliability Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROC Curve */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Receiver Operating Characteristic (ROC)</h4>
            <p className="text-xs text-slate-500">AUROC = {metrics.auroc.toFixed(4)}</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roc_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="fpr" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(1)} />
                <YAxis dataKey="tpr" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Line type="monotone" dataKey="tpr" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Curve */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Precision-Recall Curve (Primary)</h4>
            <p className="text-xs text-slate-500">AUPRC = {metrics.auprc.toFixed(4)}</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pr_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="recall" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(1)} />
                <YAxis dataKey="precision" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reliability Diagram */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Calibration Reliability Diagram</h4>
            <p className="text-xs text-slate-500">ECE = {calibration.expected_calibration_error.toFixed(4)}</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="confidence" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="empiricalAccuracy" stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Line type="monotone" dataKey="perfect" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="empiricalAccuracy" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
