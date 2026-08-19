import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { Shield } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Persistent Clinical Navigation Header */}
        <Navbar />

        {/* Dynamic Page Router */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
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
        <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-4 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-500/70" />
            <span>
              <strong>HAI-Sentinel Research Prototype:</strong> Clinical decision-support & surveillance intelligence system. Not a diagnostic medical device.
            </span>
          </div>
          <div className="font-mono text-slate-500">
            Omni_BioTech_9 • Version 1.0.0
          </div>
        </footer>
      </div>
    </Router>
  );
}
