import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, Camera, BookOpen, Upload, User, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../store/userStore';
import { useEffect } from 'react';

const LoginPage = () => {
  useEffect(() => {
    if (localStorage.getItem('loggedIn') === 'yess') {
      navigate('/dashboard', { replace: true });
    }
  })
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'teacher'
  const [images, setImages] = useState({
    left: { file: null, preview: null },
    right: { file: null, preview: null },
    centre: { file: null, preview: null }
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRefs = {
    left: useRef(null),
    right: useRef(null),
    centre: useRef(null)
  };

  const handleImageChange = (e, angle) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({
          ...prev,
          [angle]: { file, preview: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (angle) => {
    fileInputRefs[angle].current.click();
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    const { name, classCode, email } = e.target;
    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("classCode", classCode.value);
    formData.append("email", email.value);

    if (images.left.file) formData.append("left", images.left.file);
    if (images.right.file) formData.append("right", images.right.file);
    if (images.centre.file) formData.append("centre", images.centre.file);

    // Add student submission logic here
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await axios.post('http://localhost:3000/user/join_class', formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
      if (res.data.status === 'success') {
        setSuccessMessage('Successfully joined the class!');
        e.target.reset();
        setImages({
          left: { file: null, preview: null },
          right: { file: null, preview: null },
          centre: { file: null, preview: null }
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Failed to join the class. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await axios.post("http://localhost:3000/user/teacher-login",
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
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">

        {/* Left Column: Branding / Info */}
        <div className="hidden lg:flex flex-col justify-center text-white px-8">
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
                setSuccessMessage('');
              }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'student'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
            >
              <User size={16} className="mr-2" />
              Student Join
            </button>
            <button
              onClick={() => {
                setActiveTab('teacher');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'teacher'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
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
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Join Your Class</h2>
                  <p className="text-slate-400 text-sm">Enter your details to register for attendance.</p>
                </div>

                <form className="space-y-5" onSubmit={handleStudentSubmit}>

                  {/* Photo Uploads */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {['left', 'centre', 'right'].map((angle) => (
                      <div key={angle} className="flex flex-col items-center">
                        <div
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden group transition-all duration-300 hover:border-blue-500"
                          onClick={() => triggerFileInput(angle)}
                        >
                          {images[angle].preview ? (
                            <>
                              <img src={images[angle].preview} alt={`${angle} preview`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Upload className="text-white" size={20} />
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400 flex flex-col items-center group-hover:text-blue-400 transition-colors">
                              <Camera size={24} className="mb-1" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{angle}</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={fileInputRefs[angle]}
                          onChange={(e) => handleImageChange(e, angle)}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mb-6 text-center italic">
                    * 3 angles required for high-accuracy AI facial recognition
                  </p>

                  {/* Input Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User size={18} className="text-slate-500" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User size={18} className="text-slate-500" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                          placeholder="[EMAIL_ADDRESS]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Class Code</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <KeyRound size={18} className="text-slate-500" />
                        </div>
                        <input
                          type="text"
                          name="classCode"
                          className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500 uppercase font-mono"
                          placeholder="e.g. CS101-FALL"
                          required
                        />
                      </div>
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
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center inline-flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        Join Class
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
                  <h2 className="text-2xl font-bold text-white mb-2">Teacher Login</h2>
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
                        className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
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
                        className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
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

      {/* Success Message Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-emerald-500/90 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-md flex items-center space-x-3 z-50 border border-emerald-400/30"
          >
            <CheckCircle size={20} />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
