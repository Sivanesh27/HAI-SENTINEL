import { ShieldAlert, HelpCircle } from 'lucide-react';
import { SHAPExplanation } from '../types';

interface Props {
  explanation: SHAPExplanation | null;
}

export function SHAPContributionsCard({ explanation }: Props) {
  if (!explanation) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        Local feature explanation data not available for this timestamp.
      </div>
    );
  }

  const { top_positive_drivers, top_negative_drivers, disclaimer } = explanation;

  // Maximum SHAP magnitude for bar width normalization
  const maxVal = Math.max(
    ...top_positive_drivers.map((d) => Math.abs(d.shap_value)),
    ...top_negative_drivers.map((d) => Math.abs(d.shap_value)),
    0.1
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Explainable AI Attribution (Tree-SHAP)</h3>
            <p className="text-xs text-slate-400">Local feature contributions driving the current model prediction</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Positive (Elevates Risk) & Negative (Reduces Risk) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Elevating Drivers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>Primary Factors Elevating Risk (+ &Delta;Log-Odds)</span>
            <span>SHAP Impact</span>
          </div>

          <div className="space-y-2.5">
            {top_positive_drivers.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-2">No significant positive risk drivers.</div>
            ) : (
              top_positive_drivers.map((driver, idx) => {
                const barWidth = Math.min(100, Math.max(8, (Math.abs(driver.shap_value) / maxVal) * 100));
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{driver.display_name}</span>
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {driver.category}
                        </span>
                      </div>
                      <span className="font-mono text-rose-400 font-bold">+{driver.shap_value.toFixed(3)}</span>
                    </div>

                    <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%` }}></div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Observed value: <strong className="text-slate-200 font-mono">{driver.feature_value}</strong></span>
                      <span className="text-slate-500 text-[10px]">Model Feature Contrib</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Risk Reducing Drivers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Primary Mitigating Factors (- &Delta;Log-Odds)</span>
            <span>SHAP Impact</span>
          </div>

          <div className="space-y-2.5">
            {top_negative_drivers.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-2">No significant mitigating factors detected.</div>
            ) : (
              top_negative_drivers.map((driver, idx) => {
                const barWidth = Math.min(100, Math.max(8, (Math.abs(driver.shap_value) / maxVal) * 100));
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{driver.display_name}</span>
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {driver.category}
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">{driver.shap_value.toFixed(3)}</span>
                    </div>

                    <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%` }}></div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Observed value: <strong className="text-slate-200 font-mono">{driver.feature_value}</strong></span>
                      <span className="text-slate-500 text-[10px]">Model Feature Contrib</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Guardrail Callout */}
      <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[11px] text-amber-300/90 flex items-start space-x-2.5">
        <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-200">Explainability Interpretation Guardrail:</strong> {disclaimer}
        </div>
      </div>
    </div>
  );
}
