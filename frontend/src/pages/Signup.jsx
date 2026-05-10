import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, User, Building, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import axios from 'axios';

const SignupPage = () => {
    const navigate = useNavigate();
    const [emailVerified, setEmailVerified] = useState(false);
    const login = useUserStore((state) => state.login)
    const handleVerifyEmail = () => {
        // Mock email verification
        setTimeout(() => {
            setEmailVerified(true);
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;
        const collegeName = e.target.collegeName.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:3000/user/teacher-signup',
                {
                    name,
                    email,
                    collegeName,
                    password,
                },
                {
                    withCredentials: true,
                }
            );
            const data = response.data
            console.log(data)
            if (response.status === 200 && data.status === "success") {
                login({
                    name: name,
                    email: email,
                    collegeName: collegeName
                })
                navigate("/dashboard");
            }
        }
        catch (err) {
            console.log(err)
        }

    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">

                {/* Left Column: Branding / Info */}
                <div className="hidden lg:flex flex-col justify-center text-white px-8">
                    <div className="mb-8 inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md w-16 h-16 shadow-2xl border border-white/10">
                        <GraduationCap size={32} className="text-purple-400" />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-emerald-400 to-blue-400">
                        Empower Your Classroom
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-md">
                        Join thousands of educators using Smart AI Attendance to automate routine tasks and focus more on teaching.
                    </p>
                </div>

                {/* Right Column: Interactive Form */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700/50 p-8 sm:p-10 w-full max-w-md mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Teacher Registration</h2>
                            <p className="text-slate-400 text-sm">Create an account to manage your classes.</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User size={18} className="text-slate-500" />
                                    </div>
                                    <input
                                        name='name'
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                                        placeholder="Dr. Jane Smith"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">College/University Info</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Building size={18} className="text-slate-500" />
                                    </div>
                                    <input
                                        name='collegeName'
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 transition-colors placeholder-slate-500"
                                        placeholder="State University"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                                <div className="flex space-x-2">
                                    <div className="relative flex-1">
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
                                    <button
                                        type="button"
                                        onClick={handleVerifyEmail}
                                        disabled={emailVerified}
                                        className={`px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center ${emailVerified
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                            }`}
                                    >
                                        {emailVerified ? <CheckCircle size={18} /> : 'Verify'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-slate-500" />
                                        </div>
                                        <input
                                            name='password'
                                            type="password"
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-9 p-3.5 transition-colors placeholder-slate-500"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-slate-500" />
                                        </div>
                                        <input
                                            name='confirmPassword'
                                            type="password"
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-9 p-3.5 transition-colors placeholder-slate-500"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center inline-flex items-center justify-center transition-all shadow-lg shadow-purple-500/30 group"
                            >
                                Create Account
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="text-center mt-6">
                                <p className="text-sm text-slate-400">
                                    Already have an account? <Link to="/" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Log in</Link>
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
