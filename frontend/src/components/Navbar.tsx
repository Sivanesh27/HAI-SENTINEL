import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Activity,
  Users,
  Layers,
  AlertTriangle,
  BrainCircuit,
  Sliders,
  FileText,
  BookOpen,
  Play,
} from 'lucide-react';
import { DemoTourModal } from './DemoTourModal';

export function Navbar() {
  const location = useLocation();
  const [demoOpen, setDemoOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Wards', path: '/wards', icon: Layers },
    { name: 'Clusters', path: '/clusters', icon: AlertTriangle },
    { name: 'Model Performance', path: '/models', icon: BrainCircuit },
    { name: 'Scenario Simulator', path: '/scenario', icon: Sliders },
    { name: 'Audit', path: '/audit', icon: FileText },
    { name: 'Methodology', path: '/about', icon: BookOpen },
  ];

  return (
    <>
      <DemoTourModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />

      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                    HAI-SENTINEL
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/20">
                    AI COMMAND
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Hospital-Acquired Infection Intelligence
                </div>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-cyan-300 font-semibold border border-slate-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions & System Status */}
          <div className="flex items-center space-x-3">
            <Link
              to="/demo"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-500/20 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>90s Live Demo</span>
            </Link>

            <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">TELEMETRY: ONLINE</span>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Sub-Navigation Scroll Bar */}
        <div className="xl:hidden flex items-center space-x-2 px-6 py-2 overflow-x-auto border-t border-slate-800/60 bg-slate-950/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </header>
    </>
  );
}
