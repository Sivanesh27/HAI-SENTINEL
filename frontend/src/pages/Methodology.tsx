import {
  BookOpen,
  Shield,
  FileText,
  Layers,
  Activity,
} from 'lucide-react';

export function Methodology() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Scientific Foundations &amp; Methodological Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            HAI-Sentinel: Omni_BioTech_9 Hackathon Technical Documentation &amp; Epidemiological Guardrails
          </p>
        </div>
      </div>

      {/* CDC/NHSN Target Definition Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
          <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>1. Clinical Target Definition: CDC/NHSN HAI Surveillance Criteria</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Infection onset is operationalized strictly in concordance with the <strong>Centers for Disease Control and Prevention (CDC) National Healthcare Safety Network (NHSN) Patient Safety Component Protocol (2024)</strong>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
            <strong className="text-cyan-700 dark:text-cyan-300 font-mono font-bold block">Healthcare-Associated Infection Window</strong>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              An infection is defined as healthcare-associated if the localized Infection Window Period (IWP) begins on or after <strong>Calendar Day 3 of ICU admission (&ge; 48 hours)</strong>. Any infection present on Day 1 or Day 2 is classified as Community-Acquired (CAI) and excluded from the HAI positive target label.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
            <strong className="text-amber-700 dark:text-amber-300 font-mono font-bold block">Four Core HAI Classes Supported</strong>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              Covers Central Line-Associated Bloodstream Infections (<strong>CLABSI</strong>), Catheter-Associated Urinary Tract Infections (<strong>CAUTI</strong>), Ventilator-Associated Events (<strong>VAE</strong>), and Hospital-Acquired Pneumonia (<strong>HAP</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* Temporal Anti-Leakage & Machine Learning Pipeline */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>2. Temporal Feature Extraction &amp; Zero-Leakage Split Isolation</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Machine-learning systems in critical care frequently suffer from subtle data leakage. HAI-Sentinel enforces strict mathematical safeguards:
        </p>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
          <li>
            <strong>Strict Patient-Level Partitioning:</strong> Splitting is performed exclusively using <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs">GroupShuffleSplit</code> grouped on <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs">patient_id</code> (70% Train, 15% Validation, 15% Holdout Test). Zero observations from any test patient enter training or feature scaling.
          </li>
          <li>
            <strong>Causal Backward-Looking Windows:</strong> Features at observation timestamp <em>t</em> are derived exclusively from historical intervals [t - 24h, t]. No future lookahead or downstream lab results can contaminate the feature matrix.
          </li>
          <li>
            <strong>Probability Calibration:</strong> Raw tree output logits are mapped to true empirical frequencies via Isotonic Regression, verified by Expected Calibration Error (ECE = 0.0097) and Brier Score (0.0102).
          </li>
        </ul>
      </div>

      {/* Explainability & Calculus */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>3. TreeSHAP Attribution &amp; Dynamic Trajectory Calculus</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Predictions are made clinically actionable through game-theoretic local explanations and discrete derivatives:
        </p>
        <div className="p-5 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-xs sm:text-sm space-y-2 border border-slate-800 shadow-inner">
          <div>// Discrete Trajectory Velocity &amp; Acceleration Calculus:</div>
          <div>v_12h = (Risk(t) - Risk(t - 12h)) / 12  [% / hour]</div>
          <div>a_12h = (v(t) - v(t - 12h)) / 12         [% / hour&sup2;]</div>
          <div>phi_i = Shapley Attribution across all feature subsets S</div>
        </div>
      </div>

      {/* Non-Causal Framing & Ethical Limitations */}
      <div className="rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-500/5 p-6 sm:p-8 space-y-3 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-rose-500" />
          <span>4. Ethical Guardrails &amp; Clinical Decision Support Notice</span>
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>Decision-Support Prototype:</strong> HAI-Sentinel is designed to assist infection preventionists and ICU rounding teams in prioritizing surveillance workflows. It does <em>not</em> provide definitive microbiological diagnoses or replace clinical judgment.
          </p>
        </div>
      </div>
    </div>
  );
}
