import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  Camera,
  BookOpen,
  CheckCircle,
  Shield,
  BarChart3,
  Users,
  Zap,
  Smartphone,
  Sparkles,
  Code,
  Server,
  Database,
  Lock,
  Cpu,
  RefreshCw,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState('idle'); // 'idle', 'scanning', 'matching', 'success'
  const [scanProgress, setScanProgress] = useState(0);
  const [activeAngle, setActiveAngle] = useState('front'); // 'front', 'left', 'right'

  // Interactive scanner simulation logic
  const handleSimulateScan = () => {
    if (scanState === 'scanning' || scanState === 'matching') return;

    setScanState('scanning');
    setScanProgress(0);
    setActiveAngle('front');
  };

  useEffect(() => {
    let interval;
    if (scanState === 'scanning') {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState('matching');
            return 100;
          }
          // Shift simulated camera angles during scan
          if (prev > 35 && prev < 70) {
            setActiveAngle('left');
          } else if (prev >= 70) {
            setActiveAngle('right');
          }
          return prev + 2;
        });
      }, 50);
    } else if (scanState === 'matching') {
      const timer = setTimeout(() => {
        setScanState('success');
      }, 1500);
      return () => clearTimeout(timer);
    } else if (scanState === 'success') {
      const timer = setTimeout(() => {
        setScanState('idle');
        setScanProgress(0);
        setActiveAngle('front');
      }, 5000);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans overflow-x-hidden relative selection:bg-blue-600/30 selection:text-blue-200">

      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/70 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400">
              Attendance.Ai
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-blue-400 transition-colors">Live Demo</a>
            <a href="#tech-stack" className="hover:text-blue-400 transition-colors">Tech Stack</a>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => navigate('/login?tab=student')}
              className="text-sm font-semibold text-slate-300 hover:text-slate-50 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all"
            >
              Join Class
            </button>
            <button
              onClick={() => navigate('/login?tab=teacher')}
              className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-95"
            >
              Teacher Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:py-32 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 space-y-8 text-left">

          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-1.5 text-xs text-blue-400 font-medium backdrop-blur-sm">
            <Sparkles size={14} className="animate-pulse" />
            <span>Smart Anti-Proxy Facial Recognition</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-100 to-slate-400">
            Classroom Attendance <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
              Simplified by AI.
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
            Say goodbye to traditional paper registers, static spreadsheets, and proxy attendances. Attendance.Ai uses secure, multi-angle facial recognition to instantly mark student attendance in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login?tab=teacher')}
              className="group flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span>Teacher Dashboard</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login?tab=student')}
              className="flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-100 font-semibold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span>Join Class as Student</span>
            </button>
          </div>

          {/* Core Stats Inline */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 max-w-lg">
            <div>
              <div className="text-3xl font-extrabold text-slate-50">99.8%</div>
              <div className="text-xs text-slate-500 mt-1">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-50">&lt; 2s</div>
              <div className="text-xs text-slate-500 mt-1">Detection Speed</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-50">Zero</div>
              <div className="text-xs text-slate-500 mt-1">Proxy Attendance</div>
            </div>
          </div>

        </div>

        {/* Right Hero: Interactive Scanning Demonstration */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40">

            {/* Window controls decoration */}
            <div className="flex items-center space-x-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-xs text-slate-500 ml-4 font-mono select-none">ai-facial-scanner.service</span>
            </div>

            {/* Simulated Viewfinder */}
            <div id="demo" className="relative aspect-square w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group">

              {/* Simulated Camera Feed (SVG wireframe face) */}
              <div className="absolute inset-0 flex items-center justify-center p-8 select-none">
                <svg viewBox="0 0 100 100" className={`w-2/3 h-2/3 transition-all duration-700 ${scanState === 'scanning' ? 'text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : scanState === 'success' ? 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-500'}`}>
                  {/* Face outline */}
                  <path fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" d="M 50 15 C 32 15 22 25 22 50 C 22 75 32 85 50 85 C 68 85 78 75 78 50 C 78 25 68 15 50 15 Z" />
                  {/* Eye grids */}
                  <circle cx="38" cy="42" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="38" cy="42" r="1" fill="currentColor" />
                  <circle cx="62" cy="42" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="62" cy="42" r="1" fill="currentColor" />
                  {/* Nose outline */}
                  <path fill="none" stroke="currentColor" strokeWidth="1" d="M 50 40 L 50 55 L 46 58 L 54 58 Z" />
                  {/* Mouth */}
                  <path fill="none" stroke="currentColor" strokeWidth="1" d="M 40 68 Q 50 74 60 68" />

                  {/* Recognition points (dots) */}
                  <circle cx="50" cy="22" r="1" fill="currentColor" className="animate-ping" />
                  <circle cx="28" cy="35" r="1" fill="currentColor" />
                  <circle cx="72" cy="35" r="1" fill="currentColor" />
                  <circle cx="26" cy="55" r="1" fill="currentColor" />
                  <circle cx="74" cy="55" r="1" fill="currentColor" />
                  <circle cx="35" cy="74" r="1" fill="currentColor" />
                  <circle cx="65" cy="74" r="1" fill="currentColor" />
                  <circle cx="50" cy="80" r="1" fill="currentColor" />
                </svg>
              </div>

              {/* Scan Beam */}
              {scanState === 'scanning' && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10"
                />
              )}

              {/* Grid lines overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-35"></div>

              {/* Top Corner brackets for Scanner */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-700 rounded-tl-md"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-700 rounded-tr-md"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-700 rounded-bl-md"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-700 rounded-br-md"></div>

              {/* Active simulated angle tag */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                {scanState === 'scanning' ? `SCANNING: ${activeAngle}` : scanState === 'matching' ? 'MATCHING...' : scanState === 'success' ? 'MATCH FOUND' : 'FEED READY'}
              </div>

              {/* Scanner Status overlays */}
              <AnimatePresence>
                {scanState === 'scanning' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col space-y-1.5 z-20 backdrop-blur-md"
                  >
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Facial Feature Mapping</span>
                      <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                  </motion.div>
                )}

                {scanState === 'matching' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30"
                  >
                    <RefreshCw className="text-blue-500 animate-spin" size={32} />
                    <span className="text-sm font-semibold tracking-wider text-blue-400 font-mono">COMPARING BIO-TEMPLATES</span>
                  </motion.div>
                )}

                {scanState === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-40"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                      <CheckCircle size={32} className="animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-50">Attendance Logged!</h3>
                      <p className="text-xs text-slate-400">Verified student signature match</p>
                    </div>

                    {/* Log Card */}
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-left font-mono text-xs space-y-1">
                      <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="text-emerald-400">Alex Mercer</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Roll ID:</span> <span className="text-slate-200">2026-CSE-401</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Class:</span> <span className="text-slate-200">Neural Networks</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Time:</span> <span className="text-slate-200">10:14:02 AM</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scan Simulation Controls */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleSimulateScan}
                disabled={scanState !== 'idle'}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10"
              >
                <Camera size={18} />
                <span>{scanState === 'idle' ? 'Try AI Scan Simulation' : 'Processing Scan...'}</span>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
                <Info size={12} />
                <span>Simulates 3-angle facial verification in real time</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950/20 relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Advanced Features</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-50">Engineered to eliminate fraud</h3>
            <p className="text-slate-400 text-base">
              A comprehensive classroom automation suite powered by cutting-edge neural models, designed for both educational institutions and commercial workshops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Card 1: Multi Angle */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-left hover:border-blue-500/30 transition-all group">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl w-fit mb-6">
                <Camera size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-50 mb-3 group-hover:text-blue-400 transition-colors">Multi-Angle Biometrics</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Requires students to submit three facial registration photos (front, left, right) to create a multi-dimensional bio-mesh, preventing attendance proxies.
              </p>
            </div>

            {/* Card 2: Anti-Spoofing */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-left hover:border-purple-500/30 transition-all group">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl w-fit mb-6">
                <Shield size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-50 mb-3 group-hover:text-purple-400 transition-colors">Liveness Detection</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Prevents photo or video playback fraud. Our advanced model verifies depth and micro-expressions, ensuring only physical presence counts.
              </p>
            </div>

            {/* Card 3: Realtime Dashboards */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-left hover:border-emerald-500/30 transition-all group">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-6">
                <BarChart3 size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-50 mb-3 group-hover:text-emerald-400 transition-colors">Real-Time Dashboards</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Teachers receive instant updates on class metrics, including total present, percentage rates, and warning flags for students with low attendance.
              </p>
            </div>

            {/* Card 4: Companion Mobile App */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-left hover:border-blue-500/30 transition-all group">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl w-fit mb-6">
                <Smartphone size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-50 mb-3 group-hover:text-blue-400 transition-colors">Companion Mobile Client</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tauri-powered cross-platform mobile client allows students to submit registration profiles and allows teachers to trigger scans right from their phones.
              </p>
            </div>

            {/* Card 5: Smart Reporting */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-left hover:border-purple-500/30 transition-all group">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl w-fit mb-6">
                <BookOpen size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-50 mb-3 group-hover:text-purple-400 transition-colors">One-Click Exports</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Export comprehensive class sheets in Excel/CSV layout containing full timestamps, individual session performance, and averages automatically formatted.
              </p>
            </div>

            {/* Card 6: Robust Security */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-left hover:border-emerald-500/30 transition-all group">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-6">
                <Users size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-50 mb-3 group-hover:text-emerald-400 transition-colors">Encrypted Data Vault</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                All face bio-templates are encrypted and hashed, never stored as raw photographs, keeping student privacy and credentials extremely secure.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works / Steps Section */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-purple-500 uppercase tracking-widest">Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-50">Three Simple Steps</h3>
            <p className="text-slate-400 text-base">
              Set up classroom automation in less than five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl font-bold text-blue-400 group-hover:border-blue-500 transition-colors">
                  1
                </div>
                <div className="hidden lg:block absolute top-1/2 left-16 w-[calc(100%-4rem)] h-[1px] bg-slate-800 z-[-1]"></div>
              </div>
              <h4 className="text-xl font-bold text-slate-50">Create Classes</h4>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Teachers register and create a class portal, generating a unique Class Code to share with students.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl font-bold text-purple-400 group-hover:border-purple-500 transition-colors">
                  2
                </div>
                <div className="hidden lg:block absolute top-1/2 left-16 w-[calc(100%-4rem)] h-[1px] bg-slate-800 z-[-1]"></div>
              </div>
              <h4 className="text-xl font-bold text-slate-50">Student Registration</h4>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Students enter the class code and submit 3-angle verification photos using their device camera.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl font-bold text-emerald-400 group-hover:border-emerald-500 transition-colors">
                3
              </div>
              <h4 className="text-xl font-bold text-slate-50">Instant Scans</h4>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Teachers snap a picture of the class or scan face feeds, and AI logs present students directly into the database.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Tech Stack Showcase */}
      <section id="tech-stack" className="py-24 border-t border-slate-900 bg-slate-950/20 relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Technologies</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-50">Powered by Robust Stack</h3>
            <p className="text-slate-400 text-base">
              Built using state of the art frameworks for speed, security, and accuracy.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">

            {/* Tech 1 */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Code size={24} />
              </div>
              <span className="font-semibold text-slate-50">React & Tailwind</span>
              <span className="text-xs text-slate-500">Fluid Web Interface</span>
            </div>

            {/* Tech 2 */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Server size={24} />
              </div>
              <span className="font-semibold text-slate-50">Node & Express</span>
              <span className="text-xs text-slate-500">Robust REST APIs</span>
            </div>

            {/* Tech 3 */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
                <Cpu size={24} />
              </div>
              <span className="font-semibold text-slate-50">Python & OpenCV</span>
              <span className="text-xs text-slate-500">Neural Net Inference</span>
            </div>

            {/* Tech 4 */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Database size={24} />
              </div>
              <span className="font-semibold text-slate-50">PostgreSQL</span>
              <span className="text-xs text-slate-500"> Database</span>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl bg-gradient-to-tr from-blue-900/40 via-purple-900/40 to-slate-900/40 border border-slate-800 p-8 sm:p-16 text-center space-y-8 overflow-hidden shadow-2xl">
          {/* Decorative glows inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-50">
              Elevate Your Classroom Analytics
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Join hundreds of educators streamlining their daily workflows. Reduce admin overheads and focus on what matters most: teaching.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button
              onClick={() => navigate('/login?tab=teacher')}
              className="bg-white hover:opacity-90 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95"
            >
              Get Started Now
            </button>
            <button
              onClick={() => navigate('/login?tab=student')}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-50 font-semibold px-8 py-4 rounded-xl border border-slate-700/60 transition-all active:scale-95"
            >
              Register as Student
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="text-blue-500" size={20} />
            <span className="font-semibold text-slate-400">Attendance.Ai</span>
            <span className="text-slate-600">|</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
