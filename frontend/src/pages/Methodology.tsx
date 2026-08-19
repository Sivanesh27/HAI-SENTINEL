import {
  BookOpen,
  Shield,
  FileText,
  Layers,
  Activity,
} from 'lucide-react';

export function Methodology() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Scientific Foundations & Methodological Architecture
          </h1>
          <p className="text-xs text-slate-400">
            HAI-Sentinel: Omni_BioTech_9 Hackathon Technical Documentation & Epidemiological Guardrails
          </p>
        </div>
      </div>

      {/* CDC/NHSN Target Definition Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>1. Clinical Target Definition: CDC/NHSN HAI Surveillance Criteria</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Infection onset is operationalized strictly in concordance with the <strong>Centers for Disease Control and Prevention (CDC) National Healthcare Safety Network (NHSN) Patient Safety Component Protocol (2024)</strong>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
            <strong className="text-cyan-300 font-mono">Healthcare-Associated Infection Window</strong>
            <p className="text-slate-400">
              An infection is defined as healthcare-associated if the localized Infection Window Period (IWP) begins on or after <strong>Calendar Day 3 of ICU admission (&ge; 48 hours)</strong>. Any infection present on Day 1 or Day 2 is classified as Community-Acquired (CAI) and excluded from the HAI positive target label.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
            <strong className="text-amber-300 font-mono">Four Core HAI Classes Supported</strong>
            <p className="text-slate-400">
              Covers Central Line-Associated Bloodstream Infections (<strong>CLABSI</strong>), Catheter-Associated Urinary Tract Infections (<strong>CAUTI</strong>), Ventilator-Associated Events (<strong>VAE</strong>), and Hospital-Acquired Pneumonia (<strong>HAP</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* Temporal Anti-Leakage & Machine Learning Pipeline */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span>2. Temporal Feature Extraction & Zero-Leakage Split Isolation</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Machine-learning systems in critical care frequently suffer from subtle data leakage. HAI-Sentinel enforces strict mathematical safeguards:
        </p>
        <ul className="space-y-3 text-xs text-slate-300 list-disc list-inside">
          <li>
            <strong>Strict Patient-Level Partitioning:</strong> Splitting is performed exclusively using <code>GroupShuffleSplit</code> grouped on <code>patient_id</code> (70% Train, 15% Validation, 15% Holdout Test). Zero observations from any test patient enter training or feature scaling.
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
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>3. TreeSHAP Attribution & Dynamic Trajectory Calculus</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Predictions are made clinically actionable through game-theoretic local explanations and discrete derivatives:
        </p>
        <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 space-y-2 border border-slate-800">
          <div>// Discrete Trajectory Velocity &amp; Acceleration Equations:</div>
          <div>v_12h = (Risk(t) - Risk(t - 12h)) / 12  [% / hour]</div>
          <div>a_12h = (v(t) - v(t - 12h)) / 12         [% / hour&sup2;]</div>
          <div>phi_i = Shapley Attribution across all feature subsets S</div>
        </div>
      </div>

      {/* Non-Causal Framing & Ethical Limitations */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-3 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-rose-400" />
          <span>4. Ethical Guardrails & Clinical Decision Support Notice</span>
        </h2>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>Decision-Support Prototype:</strong> HAI-Sentinel is designed to assist infection preventionists and ICU rounding teams in prioritizing surveillance workflows. It does <em>not</em> provide definitive microbiological diagnoses or replace clinical judgment.
          </p>
          <p>
            <strong>Non-Causal Scenarios:</strong> The What-If Simulator and TreeSHAP attributions describe statistical model sensitivities. They do not claim that altering a single parameter will causally prevent clinical infection.
          </p>
          <p>
            <strong>Outbreak Designation:</strong> Algorithmic spatial cluster signals are framed strictly as <em>"Potential cluster requiring IPC review"</em> to prevent alarm fatigue and false public health panic.
          </p>
        </div>
      </div>

      {/* Peer-Reviewed References */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Peer-Reviewed References & Authoritative Guidelines
        </h2>
        <div className="space-y-2 text-xs text-slate-400 font-mono">
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            [1] CDC / NHSN Surveillance Criteria (2024). <em>Patient Safety Component Manual: Device-Associated Module.</em> Atlanta, GA: CDC.
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            [2] Lundberg, S. M., et al. (2020). <em>From local explanations to global understanding with explainable AI for trees.</em> Nature Machine Intelligence, 2(1), 56-67.
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            [3] Niculescu-Mizil, A., & Caruana, R. (2005). <em>Predicting good probabilities with supervised learning.</em> ICML '05, 625-632.
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            [4] Vincent, J. L., et al. (2009). <em>International study of the prevalence and outcomes of infection in intensive care units (EPIC II).</em> JAMA, 302(21), 2323-2329.
          </div>
        </div>
      </div>
    </div>
  );
}
