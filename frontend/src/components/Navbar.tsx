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
  Sun,
  Moon,
  Radio,
} from 'lucide-react';
import { DemoTourModal } from './DemoTourModal';
import { useUI } from '../context/UIContext';

export function Navbar() {
  const location = useLocation();
  const [demoOpen, setDemoOpen] = useState(false);
  const { theme, toggleTheme, fontSize, setFontSizeScale, toggleTelemetryMode, isStreaming } = useUI();

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

      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Brand Identity */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
                <Shield className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white font-mono">
                    HAI-SENTINEL
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono font-bold border border-cyan-500/20">
                    PREVENTION AI
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden sm:block">
                  Hospital Infection Trajectory Intelligence
                </div>
              </div>
            </Link>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden 2xl:flex items-center space-x-1">
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
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-slate-800 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Controls: Live Stream Toggle + Font Scaling + Theme Toggle + Demo Mode */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Real-time Telemetry Mode Button */}
            <button
              onClick={toggleTelemetryMode}
              title={isStreaming ? "Streaming active real-time ICU vitals" : "Click to activate real-time telemetry stream"}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isStreaming
                  ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-rose-500 animate-spin' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{isStreaming ? 'LIVE ICU STREAM' : 'HISTORICAL FEED'}</span>
              <span className="md:hidden">{isStreaming ? 'LIVE' : 'FEED'}</span>
            </button>

            {/* Font Size Adjuster Controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5" title="Adjust Application Font Size">
              <button
                onClick={() => setFontSizeScale('normal')}
                className={`px-2 py-1 text-[11px] font-bold rounded ${
                  fontSize === 'normal'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Normal Font Size (100%)"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeScale('large')}
                className={`px-2 py-1 text-xs font-bold rounded ${
                  fontSize === 'large'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Large Font Size (115% - Recommended)"
              >
                A+
              </button>
              <button
                onClick={() => setFontSizeScale('xlarge')}
                className={`px-2 py-1 text-sm font-bold rounded ${
                  fontSize === 'xlarge'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Extra Large Font Size (130% - Clinical Presentation)"
              >
                A++
              </button>
            </div>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Dark/Light Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* 90s Live Demo Button */}
            <Link
              to="/demo"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-extrabold shadow-md shadow-cyan-500/20 transition hover:scale-102"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">90s Live Demo</span>
              <span className="sm:hidden">Demo</span>
            </Link>
          </div>
        </div>

        {/* Responsive Secondary Navigation Bar */}
        <div className="2xl:hidden flex items-center space-x-1.5 px-4 sm:px-6 py-2 overflow-x-auto border-t border-slate-200 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-950/60 scrollbar-none">
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 font-bold border border-slate-300 dark:border-slate-700 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </header>
    </>
  );
}
