import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronLeft, Users, BookOpen, Calendar, CheckCircle2, XCircle, Minus, ArrowUpRight, Percent } from 'lucide-react';
import axios from 'axios';
import useClassesStore from '../store/classesStore';
import Sidebar from '../components/Sidebar';

const Students = () => {
  const classes = useClassesStore((state) => state.classesList);
  const fetchClassesList = useClassesStore((state) => state.fetchClassesList);
  const fetched = useClassesStore((state) => state.fetched);

  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Low (<75%), High (>90%)

  useEffect(() => {
    if (!fetched) {
      fetchClassesList();
    }
  }, [fetched]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentStats(selectedClass.class_id || selectedClass.classId);
    }
  }, [selectedClass]);

  const fetchStudentStats = async (classId) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/classes/getClassStudentStats', { classId }, { withCredentials: true });
      if (res.data.status === 'success') {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Error fetching student stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'Low') return parseFloat(student.percentage) < 75;
    if (filterType === 'High') return parseFloat(student.percentage) > 90;

    return true;
  });

  const getPercentageColor = (percent) => {
    const p = parseFloat(percent);
    if (p < 50) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    if (p < 75) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  };

  const getAttendanceIcon = (status) => {
    if (status === 'Present') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'Absent') return <XCircle size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 p-6 sm:p-10 hide-scrollbar">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              {selectedClass ? (
                <button
                  onClick={() => setSelectedClass(null)}
                  className="mr-4 p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : null}
              {selectedClass ? 'Student Analytics' : 'Select a Class'}
            </h2>
            <p className="text-slate-400">
              {selectedClass
                ? `Detailed attendance metrics for ${selectedClass.subject} (${selectedClass.section})`
                : 'Choose a class to view detailed student attendance statistics.'}
            </p>
          </div>

          {selectedClass && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64 transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="All">All Students</option>
                  <option value="Low">{`Low Attendance (<75%)`}</option>
                  <option value="High">{`High Attendance (>90%)`}</option>
                </select>
              </div>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {!selectedClass ? (
            <motion.div
              key="class-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {classes.map((cls, index) => (
                <motion.div
                  key={cls.class_id || cls.classId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedClass(cls)}
                  className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${cls.color === 'emerald' ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-500'}`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cls.section}</span>
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{cls.subject}</h4>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 group-hover:text-blue-400 transition-colors">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-slate-400 space-x-4">
                    <span className="flex items-center"><Users size={14} className="mr-1.5" /> {cls.students} Students</span>
                    <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {cls.schedule || 'N/A'}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="student-stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/30 text-slate-400 text-sm uppercase tracking-wider">
                      <th className="p-5 font-semibold border-b border-slate-800">Student</th>
                      <th className="p-5 font-semibold border-b border-slate-800">Recent 10 Attendance</th>
                      <th className="p-5 font-semibold border-b border-slate-800 text-center">Sessions</th>
                      <th className="p-5 font-semibold border-b border-slate-800 text-center">Present</th>
                      <th className="p-5 font-semibold border-b border-slate-800">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="p-20 text-center text-slate-500">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p>Loading statistics...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-20 text-center text-slate-500">
                          <p className="text-lg font-medium text-slate-400 mb-2">No students found</p>
                          <p className="text-sm">Try adjusting your search or filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <motion.tr
                          key={student.student_id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-slate-800/20 transition-colors group"
                        >
                          <td className="p-5">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-blue-400 font-bold mr-3 shadow-inner">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{student.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{student.student_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex space-x-1.5">
                              {/* Show 10 slots, even if they have fewer records */}
                              {[...Array(10)].map((_, i) => {
                                const status = student.recent_attendance[i];
                                return (
                                  <div key={i} className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-800/50 border border-slate-700/50" title={status || 'No record'}>
                                    {getAttendanceIcon(status)}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-5 text-center font-mono text-slate-400">{student.total_sessions}</td>
                          <td className="p-5 text-center font-mono text-emerald-400/80 font-bold">{student.present_count}</td>
                          <td className="p-5">
                            <div className="flex items-center">
                              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden mr-3">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${student.percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full ${parseFloat(student.percentage) < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                />
                              </div>
                              <span className={`text-sm font-bold px-2 py-1 rounded-lg border ${getPercentageColor(student.percentage)}`}>
                                {student.percentage}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Students;
