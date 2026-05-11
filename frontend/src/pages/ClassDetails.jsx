import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  ArrowLeft,
  Users,
  Camera,
  ClipboardList,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Clock,
  Trash2,
  Copy,
  Link as LinkIcon
} from 'lucide-react';
import useClassesStore from '../store/classesStore';
import { useEffect } from 'react';

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const classesList = useClassesStore((state) => state.classesList);
  const [classObj, setClassObj] = useState({ classId: '', section: '', subject: '', schedule: '' })
  const [students, setStudents] = useState([])

  useEffect(() => {
    // console.log(classesList);
    const classData = classesList.find(c => c.classId === classId || c.class_id === classId)
    if (!classData) {
      navigate('/dashboard');
      return;
    }
    setClassObj(classData);
    (async () => {
      const res = await axios.post('http://localhost:3000/classes/getStudents', { classId }, { withCredentials: true })
      console.log(res.data);
      setStudents(res.data.students)

    })()
  }, [])

  // Find the class from the store, or fallback to mock data if it's not found (e.g. direct URL visit or mock setup)

  const removeClass = useClassesStore((state) => state.removeClass);
  const fileInputRef = useRef(null);
  const [isManualMode, setIsManualMode] = useState(false);

  const handleDeleteClass = () => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      removeClass(classId);
      navigate('/dashboard');
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`Photo "${file.name}" uploaded for attendance!`);
      // Add logic to send photo to backend here
    }
  };

  // Mock Students Data
  // const [students, setStudents] = useState([
  //   { id: 1, name: 'Alice Smith', rollNo: 'CS001', email: 'alice@example.com', status: 'Absent' },
  //   { id: 2, name: 'Bob Johnson', rollNo: 'CS002', email: 'bob@example.com', status: 'Absent' },
  //   { id: 3, name: 'Charlie Brown', rollNo: 'CS003', email: 'charlie@example.com', status: 'Absent' },
  //   { id: 4, name: 'Diana Prince', rollNo: 'CS004', email: 'diana@example.com', status: 'Absent' },
  //   { id: 5, name: 'Evan Wright', rollNo: 'CS005', email: 'evan@example.com', status: 'Absent' }
  // ]);

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Absent': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 sm:p-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-slate-700 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Dashboard
          </button>

          <button
            onClick={handleDeleteClass}
            className="flex items-center text-rose-400 hover:text-white hover:bg-rose-500/20 px-4 py-2 rounded-xl transition-colors"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Class
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
                {classObj.section}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{classObj.subject}</h1>
              <div className="flex items-center text-slate-400 text-sm space-x-4 mb-4">
                <span className="flex items-center"><Users size={16} className="mr-1.5" /> {students.length} Students</span>
                <span className="flex items-center"><Clock size={16} className="mr-1.5" /> {classObj.schedule || 'No Schedule'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center">
                  <span className="text-xs text-slate-400 mr-2">ID: {classId}</span>
                  <button onClick={() => copyToClipboard(classId, 'Class ID')} className="text-slate-500 hover:text-blue-400 transition-colors" title="Copy Class ID">
                    <Copy size={14} />
                  </button>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center">
                  <span className="text-xs text-slate-400 mr-2">Invite Link</span>
                  <button onClick={() => copyToClipboard(`${window.location.origin}/class/${classId}`, 'Invite Link')} className="text-slate-500 hover:text-blue-400 transition-colors" title="Copy Link">
                    <LinkIcon size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-4 mt-6 md:mt-0 w-full md:w-auto">

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 md:flex-none flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                <Camera size={18} className="mr-2" />
                Photo Attendance
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Users size={20} className="mr-2 text-blue-400" />
              Student Roster
            </h2>
            <div className="text-sm text-slate-400">
              Today's Attendance
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/30 text-slate-400 text-sm">
                  <th className="p-5 font-medium border-b border-slate-800">Name</th>
                  <th className="p-5 font-medium border-b border-slate-800">Roll No</th>
                  <th className="p-5 font-medium border-b border-slate-800">Email ID</th>
                  <th className="p-5 font-medium border-b border-slate-800">Status</th>
                  <th className="p-5 font-medium border-b border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence>
                  {students.map((student) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-800/20 transition-colors group"
                    >
                      <td className="p-5">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-xs mr-3">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-200">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-slate-400 font-mono text-sm">{student.rollNo}</td>
                      <td className="p-5 text-slate-400 text-sm">{student.student_id}</td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(student.status)}`}>
                          {student.status === 'Present' && <CheckCircle2 size={12} className="mr-1" />}
                          {student.status === 'Absent' && <XCircle size={12} className="mr-1" />}
                          {student.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStatusChange(student.id, 'Present')}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
                            title="Mark Present"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ClassDetails;
