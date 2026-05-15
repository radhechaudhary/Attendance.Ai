import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Settings, LogOut, BookOpen, ChevronRight, MoreVertical, LayoutDashboard, X, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import useClassesStore from '../store/classesStore';
import { useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const { name, collegeName, email } = useUserStore();
  const classes = useClassesStore((state) => state.classesList);
  const addClass = useClassesStore((state) => state.addClass);
  const fetchClassesList = useClassesStore((state) => state.fetchClassesList);
  const fetched = useClassesStore((state) => state.fetched);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Mock data for classes
  // const [classes, setClasses] = useState([
  //   { id: 1, name: 'Introduction to Computer Science', code: 'CS101', students: 45, schedule: 'Mon, Wed 10:00 AM', color: 'blue' },
  //   { id: 2, name: 'Data Structures and Algorithms', code: 'CS201', students: 38, schedule: 'Tue, Thu 2:00 PM', color: 'purple' },
  //   { id: 3, name: 'Artificial Intelligence', code: 'CS450', students: 25, schedule: 'Fri 9:00 AM', color: 'emerald' },
  // ]);

  useEffect(() => {
    if (!fetched) {
      fetchClassesList();
    }
  }, [fetched])


  const [newClass, setNewClass] = useState({ subject: '', section: '', schedule: '' });

  const handleAddClass = async (e) => {
    e.preventDefault();

    if (newClass.subject && newClass.section) {
      console.log(newClass)
      // const colors = ['blue', 'purple', 'emerald', 'rose', 'amber'];
      addClass(newClass);
      setNewClass({ subject: '', section: '', schedule: '' });
      setIsAddModalOpen(false);
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'from-blue-600 to-blue-400 border-blue-500/30 shadow-blue-500/20 text-blue-400',
      purple: 'from-purple-600 to-purple-400 border-purple-500/30 shadow-purple-500/20 text-purple-400',
      emerald: 'from-emerald-600 to-emerald-400 border-emerald-500/30 shadow-emerald-500/20 text-emerald-400',
      rose: 'from-rose-600 to-rose-400 border-rose-500/30 shadow-rose-500/20 text-rose-400',
      amber: 'from-amber-600 to-amber-400 border-amber-500/30 shadow-amber-500/20 text-amber-400',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 p-6 sm:p-10 hide-scrollbar">

        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome,{name}</h2>
            <p className="text-slate-400">{collegeName}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
              <span className="text-lg font-bold text-slate-300">{name[0] + name[1]}</span>
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} className="mr-2" />
            Add Class
          </button>
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {classes.map((cls, index) => {
              const theme = getColorClasses(cls.color);
              const gradientClass = theme.split(' text-')[0]; // Extract gradient part
              const textClass = `text-${cls.color}-400`;

              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/class/${cls.class_id || cls.classId || cls.id}`)}
                  className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors group cursor-pointer"
                >
                  <div className={`h-3 w-full bg-gradient-to-r ${gradientClass}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold mb-3 ${textClass}`}>
                          {cls.section}
                        </span>
                        <h4 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{cls.subject}</h4>
                      </div>
                      <button className="text-slate-500 hover:text-white transition-colors p-1">
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-slate-400">
                        <Users size={16} className="mr-3 opacity-70" />
                        <span>{cls.students || 0} Students</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <Calendar size={16} className="mr-3 opacity-70" />
                        <span>{cls.schedule || 'No schedule set'}</span>
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
              );
            })}
          </AnimatePresence>

          {/* Empty State / Add Card Trigger */}
          {classes.length === 0 && (
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-800/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-700 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/40 transition-all min-h-[250px]"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-blue-500">
                <Plus size={32} />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Create First Class</h4>
              <p className="text-sm text-slate-400 max-w-xs">You haven't created any classes yet. Click here to get started.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Class Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Create New Class</h3>
                <p className="text-slate-400 text-sm">Add a new class to your dashboard to start taking AI attendance.</p>
              </div>

              <form onSubmit={handleAddClass} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Class Subject</label>
                  <input
                    type="text"
                    value={newClass.subject}
                    onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-colors"
                    placeholder="e.g. Introduction to Programming"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Class Section</label>
                  <input
                    type="text"
                    value={newClass.section}
                    onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-colors uppercase font-mono"
                    placeholder="e.g. CS101"
                    required
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Schedule (Optional)</label>
                  <input
                    type="text"
                    value={newClass.schedule}
                    onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-colors"
                    placeholder="e.g. Mon, Wed 10:00 AM"
                  />
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-colors shadow-lg shadow-blue-500/25"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;