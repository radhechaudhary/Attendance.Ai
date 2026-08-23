import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, Camera, BookOpen, User, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../store/userStore';
import { useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const classCodeParam = searchParams.get('classId');

  const login = useUserStore((state) => state.login);
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'teacher'
  const [studentMode, setStudentMode] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    if (localStorage.getItem('loggedIn') === 'yess') {
      const role = localStorage.getItem('role');
      navigate(role === 'student' ? '/student/dashboard' : '/dashboard', { replace: true });
    }
  }, []);

  useEffect(() => {
    if (tabParam === 'teacher' || tabParam === 'student') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await axios.post('http://localhost:3000/user/student-login',
        {
          email: e.target.email.value,
          password: e.target.password.value,
        },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        login({ name: res.data.name, email: res.data.email, role: 'student' });
        localStorage.setItem('loggedIn', 'yess');
        localStorage.setItem('role', 'student');
        navigate(classCodeParam ? `/student/dashboard?joinClassId=${classCodeParam}` : '/student/dashboard', { replace: true });
      } else {
        setErrorMessage(res.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error connecting to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleStudentSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/user/student-signup',
        {
          name: e.target.name.value,
          email: e.target.email.value,
          password,
        },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        login({ name: res.data.name, email: res.data.email, role: 'student' });
        localStorage.setItem('loggedIn', 'yess');
        localStorage.setItem('role', 'student');
        navigate(classCodeParam ? `/student/dashboard?joinClassId=${classCodeParam}` : '/student/dashboard', { replace: true });
      } else {
        setErrorMessage(res.data.message || 'Sign up failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error connecting to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/teacher-login`,
        {
          email: e.target.email.value,
          password: e.target.password.value
        },
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMessage(res.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Error connecting to the server. Please try again later.');
    } finally {
      localStorage.setItem('loggedIn', 'yess')
      localStorage.setItem('role', 'teacher')
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative">
      <div className="fixed top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">

        {/* Left Column: Branding / Info */}
        <div className="hidden lg:flex flex-col justify-center text-slate-50 px-8">
          <div className="mb-8 inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md w-16 h-16 shadow-2xl border border-white/10">
            <GraduationCap size={32} className="text-blue-400" />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
            Smart AI Attendance
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-md">
            The next generation of classroom management. Seamlessly track attendance, manage classes, and engage with students using advanced AI technology.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-slate-300">
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <Camera size={20} className="text-blue-400" />
              </div>
              <span>Facial recognition for instant attendance</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-300">
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <BookOpen size={20} className="text-purple-400" />
              </div>
              <span>Real-time analytics for teachers</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700/50 p-8 sm:p-10 w-full max-w-md mx-auto">

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-800/50 rounded-xl mb-8 border border-slate-700/50">
            <button
              onClick={() => {
                setActiveTab('student');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'student'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-700/30'
                }`}
            >
              <User size={16} className="mr-2" />
              Student
            </button>
            <button
              onClick={() => {
                setActiveTab('teacher');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'teacher'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-700/30'
                }`}
            >
              <GraduationCap size={16} className="mr-2" />
              Teacher Login
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Student Form */}
            {activeTab === 'student' && (
              <motion.div
                key="student-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-50 mb-2">
                    {studentMode === 'login' ? 'Student Login' : 'Student Sign Up'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {studentMode === 'login' ? 'Log in to view your classes and attendance.' : 'Create an account to join classes and track attendance.'}
                  </p>
                </div>

                {/* Login / Sign Up sub-switcher */}
                <div className="flex p-1 bg-slate-800/50 rounded-lg mb-6 border border-slate-700/50 max-w-[220px] mx-auto">
                  <button
                    type="button"
                    onClick={() => { setStudentMode('login'); setErrorMessage(''); }}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-300 ${studentMode === 'login'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-50'
                      }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentMode('signup'); setErrorMessage(''); }}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-300 ${studentMode === 'signup'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-50'
                      }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form className="space-y-4" onSubmit={studentMode === 'login' ? handleStudentLogin : handleStudentSignup}>

                  {studentMode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User size={18} className="text-slate-500" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          autoComplete="name"
                          className="w-full bg-slate-900/50 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={18} className="text-slate-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                        placeholder="student@school.edu"
                        required
                      />
                    </div>
                  </div>

                  <div className={studentMode === 'signup' ? 'grid grid-cols-2 gap-4' : ''}>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock size={18} className="text-slate-500" />
                        </div>
                        <input
                          name="password"
                          type="password"
                          autoComplete={studentMode === 'signup' ? 'new-password' : 'current-password'}
                          className="w-full bg-slate-900/50 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                          placeholder="••••••••"
                          required
                        />
                        {studentMode === 'signup' && (
                          <p className="text-[11px] text-slate-500 mt-1.5 ml-1">At least 6 characters</p>
                        )}
                      </div>
                    </div>

                    {studentMode === 'signup' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-500" />
                          </div>
                          <input
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="w-full bg-slate-900/50 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2"
                      >
                        <AlertCircle size={14} />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center inline-flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        {studentMode === 'login' ? 'Log In' : 'Create Account'}
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Teacher Form */}
            {activeTab === 'teacher' && (
              <motion.div
                key="teacher-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-50 mb-2">Teacher Login</h2>
                  <p className="text-slate-400 text-sm">Log in to your account.</p>
                </div>

                <form className="space-y-5" onSubmit={handleTeacherSubmit}>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={18} className="text-slate-500" />
                      </div>
                      <input
                        name='email'
                        type="email"
                        autoComplete="email"
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                        placeholder="teacher@school.edu"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className="text-slate-500" />
                      </div>
                      <input
                        name='password'
                        type="password"
                        autoComplete="current-password"
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot Password?</a>
                    </div>
                  </div>

                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2"
                      >
                        <AlertCircle size={14} />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center inline-flex items-center justify-center transition-all shadow-lg shadow-purple-500/30 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        Log In
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-6">
                    <p className="text-sm text-slate-400">
                      Don't have an account? <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign up here</Link>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
