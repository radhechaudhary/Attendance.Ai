import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, BookOpen, ChevronRight, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useUserStore from '../store/userStore';
import useStudentClassesStore from '../store/studentClassesStore';
import Sidebar from '../components/Sidebar';
import JoinClassModal from '../components/JoinClassModal';

const getAttendanceColor = (percentage) => {
  const value = parseFloat(percentage);
  if (value >= 75) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (value >= 50) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { name, email } = useUserStore();
  const classes = useStudentClassesStore((state) => state.classesList);
  const fetchClassesList = useStudentClassesStore((state) => state.fetchClassesList);
  const fetched = useStudentClassesStore((state) => state.fetched);

  const joinClassId = searchParams.get('joinClassId') || '';
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(() => !!joinClassId);

  useEffect(() => {
    if (!fetched) {
      fetchClassesList();
    }
  }, [fetched]);

  const closeJoinModal = () => {
    setIsJoinModalOpen(false);
    if (joinClassId) {
      searchParams.delete('joinClassId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <Sidebar />

      {isJoinModalOpen && (
        <JoinClassModal
          isOpen={isJoinModalOpen}
          onClose={closeJoinModal}
          defaultClassCode={joinClassId}
          onSuccess={fetchClassesList}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 p-6 sm:p-10 hide-scrollbar">

        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome, {name}</h2>
            <p className="text-slate-400">{email}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
              <span className="text-lg font-bold text-slate-300">{name ? name.slice(0, 2) : ''}</span>
            </div>
          </div>
        </header>

        {/* Classes Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <BookOpen className="mr-2 text-blue-400" size={20} />
            My Classes
          </h3>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} className="mr-2" />
            Join a Class
          </button>
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {classes.map((cls, index) => (
              <motion.div
                key={cls.class_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/student/class/${cls.class_id}`)}
                className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors group cursor-pointer"
              >
                <div className="h-3 w-full bg-gradient-to-r from-blue-600 to-purple-500"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold mb-3 text-blue-400">
                        {cls.section}
                      </span>
                      <h4 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{cls.subject}</h4>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getAttendanceColor(cls.percentage)}`}>
                      <TrendingUp size={12} className="mr-1" />
                      {cls.percentage}%
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-slate-400">
                      <Users size={16} className="mr-3 opacity-70" />
                      <span>{cls.students || 0} Students</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                      <Calendar size={16} className="mr-3 opacity-70" />
                      <span>{cls.present_count} / {cls.total_sessions} sessions attended</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Click to view details</span>
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State / Join Card Trigger */}
          {classes.length === 0 && (
            <div
              onClick={() => setIsJoinModalOpen(true)}
              className="bg-slate-800/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-700 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/40 transition-all min-h-[250px]"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-blue-500">
                <Plus size={32} />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Join Your First Class</h4>
              <p className="text-sm text-slate-400 max-w-xs">You haven't joined any classes yet. Click here to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
