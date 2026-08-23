import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Hash
} from 'lucide-react';

const StudentClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState({ total_sessions: 0, present_count: 0, percentage: '0.00' });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.post('http://localhost:3000/student/getClassDetails', { classId }, { withCredentials: true });
        if (res.data.status === 'success') {
          setClassInfo(res.data.class);
          setStudentInfo(res.data.student);
          setStats(res.data.stats);
          setRecentAttendance(res.data.recent_attendance);
        } else {
          navigate('/student/dashboard');
        }
      } catch (err) {
        console.error(err);
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Absent': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getPercentageColor = (percentage) => {
    const value = parseFloat(percentage);
    if (value >= 75) return 'text-emerald-400';
    if (value >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  if (loading || !classInfo) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 sm:p-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-slate-700 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Dashboard
          </button>
        </div>

        {/* Class Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-sm font-semibold mb-3">
                {classInfo.section}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{classInfo.subject}</h1>
              <div className="flex items-center text-slate-400 text-sm space-x-4 mb-4">
                <span className="flex items-center"><Users size={16} className="mr-1.5" /> {classInfo.students} Students</span>
                <span className="flex items-center"><Hash size={16} className="mr-1.5" /> Roll No: {studentInfo?.roll_no}</span>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 inline-flex items-center">
                <span className="text-xs text-slate-400">Class ID: {classInfo.class_id}</span>
              </div>
            </div>

            {/* Attendance Stat */}
            <div className="flex space-x-4 mt-6 md:mt-0 bg-slate-800/40 border border-slate-700/50 rounded-2xl px-6 py-4 items-center">
              <TrendingUp className={getPercentageColor(stats.percentage)} size={28} />
              <div>
                <p className={`text-2xl font-bold ${getPercentageColor(stats.percentage)}`}>{stats.percentage}%</p>
                <p className="text-xs text-slate-400">{stats.present_count} / {stats.total_sessions} sessions</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attendance History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Clock size={20} className="mr-2 text-blue-400" />
              Attendance History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/30 text-slate-400 text-sm">
                  <th className="p-5 font-medium border-b border-slate-800">Date</th>
                  <th className="p-5 font-medium border-b border-slate-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-slate-500 text-sm">
                      No attendance recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentAttendance.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-5 text-slate-300 text-sm">
                        {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {record.status === 'Present' && <CheckCircle2 size={12} className="mr-1" />}
                          {record.status === 'Absent' && <XCircle size={12} className="mr-1" />}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default StudentClassDetails;
