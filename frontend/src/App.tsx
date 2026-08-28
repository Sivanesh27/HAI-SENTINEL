import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UIProvider } from './context/UIContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { PatientList } from './pages/PatientList';
import { PatientDetail } from './pages/PatientDetail';
import { WardIntelligence } from './pages/WardIntelligence';
import { ClusterMonitor } from './pages/ClusterMonitor';
import { ModelPerformance } from './pages/ModelPerformance';
import { ScenarioSimulator } from './pages/ScenarioSimulator';
import { AuditTrail } from './pages/AuditTrail';
import { Methodology } from './pages/Methodology';
import { HackathonDemoMode } from './pages/HackathonDemoMode';
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  return (
    <UIProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          {/* Persistent Clinical Command Header */}
          <Navbar />

          {/* Dynamic Page Router */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/demo" element={<HackathonDemoMode />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/wards" element={<WardIntelligence />} />
              <Route path="/clusters" element={<ClusterMonitor />} />
              <Route path="/models" element={<ModelPerformance />} />
              <Route path="/scenario" element={<ScenarioSimulator />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/about" element={<Methodology />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Clinical Guardrail Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>
                <strong>HAI-Sentinel Clinical AI Platform:</strong> Early-warning trajectory & surveillance decision-support. Not a substitute for clinical diagnosis.
              </span>
            </div>
            <div className="flex items-center space-x-3 font-mono text-[11px]">
              <span className="flex items-center space-x-1 text-cyan-600 dark:text-cyan-400 font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Omni_BioTech_9</span>
              </span>
              <span>•</span>
              <span>v1.0.0 Enterprise</span>
            </div>
          </footer>
        </div>
      </Router>
    </UIProvider>
  );
}
