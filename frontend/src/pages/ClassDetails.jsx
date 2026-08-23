import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  ArrowLeft,
  Users,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Copy,
  Link as LinkIcon,
  DoorOpen,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import useClassesStore from '../store/classesStore';
import useRoomsStore from '../store/roomsStore';
import { useEffect } from 'react';
import PhotoAttendanceModal from '../components/PhotoAttendanceModal';

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const classesList = useClassesStore((state) => state.classesList);
  const rooms = useRoomsStore((state) => state.roomsList);
  const fetchRoomsList = useRoomsStore((state) => state.fetchRoomsList);
  const roomsFetched = useRoomsStore((state) => state.fetched);
  const addRoom = useRoomsStore((state) => state.addRoom);
  const [classObj, setClassObj] = useState({ classId: '', section: '', subject: '', schedule: '' })
  const [students, setStudents] = useState([])
  const [roomId, setRoomId] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureMessage, setCaptureMessage] = useState(null)
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false)
  const [roomClaim, setRoomClaim] = useState({ room_id: '', camera_password: '', room_name: '' })
  const [roomClaimError, setRoomClaimError] = useState('')
  const [isClaimingRoom, setIsClaimingRoom] = useState(false)

  const ADD_ROOM_OPTION = '__add_room__';

  useEffect(() => {
    if (!roomsFetched) {
      fetchRoomsList();
    }
  }, [roomsFetched])

  useEffect(() => {
    // console.log(classesList);
    const classData = classesList.find(c => c.classId === classId || c.class_id === classId)
    if (!classData) {
      navigate('/dashboard');
      return;
    }
    setClassObj(classData);
    setRoomId(classData.room_id || '');
    (async () => {
      const res = await axios.post('http://localhost:3000/classes/getStudents', { classId }, { withCredentials: true })
      // console.log(res.data.students);
      res.data.students.forEach(student => {
        student.status = "Absent"
      })
      setStudents(res.data.students)

    })()
  }, [])

  const persistRoomAssignment = async (newRoomId) => {
    setRoomId(newRoomId);
    try {
      await axios.post('http://localhost:3000/classes/assignRoom', { classId, roomId: newRoomId || null }, { withCredentials: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignRoom = (e) => {
    const value = e.target.value;
    if (value === ADD_ROOM_OPTION) {
      setRoomClaim({ room_id: '', camera_password: '', room_name: '' });
      setRoomClaimError('');
      setIsAddRoomModalOpen(true);
      return;
    }
    persistRoomAssignment(value);
  };

  const handleClaimRoom = async (e) => {
    e.preventDefault();
    setRoomClaimError('');
    setIsClaimingRoom(true);
    try {
      const result = await addRoom(roomClaim);
      if (result.status === 'success') {
        setIsAddRoomModalOpen(false);
        await persistRoomAssignment(roomClaim.room_id);
      } else {
        setRoomClaimError(result.message || 'Could not add this room.');
      }
    } finally {
      setIsClaimingRoom(false);
    }
  };

  const handleAutoCapture = async () => {
    setIsCapturing(true);
    setCaptureMessage(null);
    try {
      const res = await axios.post('http://localhost:3000/classes/autoCaptureAttendance', { classId }, { withCredentials: true });
      if (res.data.status === 'success') {
        const { status = {}, confidence = {} } = res.data.attendance || {};
        setStudents(students.map(student => ({
          ...student,
          status: status[student.student_id] ? 'Present' : 'Absent',
          confidence: confidence[student.student_id] || 0,
        })));
        setCaptureMessage({ type: 'success', text: `Attendance captured: ${res.data.presentCount} / ${res.data.totalStudents} present.` });
      } else {
        setCaptureMessage({ type: 'error', text: res.data.message || 'Could not capture attendance.' });
      }
    } catch (err) {
      console.error(err);
      setCaptureMessage({ type: 'error', text: err.response?.data?.message || 'Could not capture attendance.' });
    } finally {
      setIsCapturing(false);
    }
  };

  // Find the class from the store, or fallback to mock data if it's not found (e.g. direct URL visit or mock setup)

  const removeClass = useClassesStore((state) => state.removeClass);
  const fileInputRef = useRef(null);
  const [photoMode, setPhotoMode] = useState(false);

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
    setStudents(students.map(s => s.student_id === studentId ? { ...s, status: newStatus } : s));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Absent': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const attendanceRecords = students.map(s => ({
        student_id: s.student_id,
        class_id: classId,
        date: date,
        status: s.status
      }));

      const res = await axios.post('http://localhost:3000/classes/markAttendance', { attendanceRecords }, { withCredentials: true });
      if (res.data.status === 'success') {
        alert('Attendance saved successfully!');
        navigate('/dashboard');
      } else {
        alert('Failed to save attendance');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving attendance');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-6 sm:p-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      {photoMode && <PhotoAttendanceModal isOpen={photoMode} onClose={() => setPhotoMode(false)} classId={classId} students={students} setStudents={setStudents} />}
      <AnimatePresence>
        {isAddRoomModalOpen && (
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
                onClick={() => setIsAddRoomModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-50 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
                  <DoorOpen size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Add a Room</h3>
                <p className="text-slate-400 text-sm">Enter the Room ID and password given to you for that room's camera, and pick a name for it.</p>
              </div>

              <form onSubmit={handleClaimRoom} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Room ID</label>
                  <input
                    type="text"
                    value={roomClaim.room_id}
                    onChange={(e) => setRoomClaim({ ...roomClaim, room_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-colors font-mono"
                    placeholder="e.g. 204"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Room Password</label>
                  <input
                    type="password"
                    value={roomClaim.camera_password}
                    onChange={(e) => setRoomClaim({ ...roomClaim, camera_password: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Alias Name</label>
                  <input
                    type="text"
                    value={roomClaim.room_name}
                    onChange={(e) => setRoomClaim({ ...roomClaim, room_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-50 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-colors"
                    placeholder="e.g. Lab 204"
                    required
                  />
                </div>

                <AnimatePresence>
                  {roomClaimError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2"
                    >
                      <AlertCircle size={14} />
                      <span>{roomClaimError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddRoomModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-50 font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClaimingRoom}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-colors shadow-lg shadow-blue-500/25"
                  >
                    {isClaimingRoom ? 'Adding...' : 'Add Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-slate-400 hover:text-slate-50 transition-colors group"
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
              <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">{classObj.subject}</h1>
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
                  <button onClick={() => copyToClipboard(`${window.location.origin}/login?tab=student&classId=${classId}`, 'Invite Link')} className="text-slate-500 hover:text-blue-400 transition-colors" title="Copy Link">
                    <LinkIcon size={14} />
                  </button>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center">
                  <DoorOpen size={14} className="text-slate-500 mr-2" />
                  <select
                    value={roomId}
                    onChange={handleAssignRoom}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer max-w-[140px]"
                  >
                    <option value="" className="bg-slate-800">No room assigned</option>
                    {rooms.map((r) => (
                      <option key={r.room_id} value={r.room_id} className="bg-slate-800">{r.room_name}</option>
                    ))}
                    <option value={ADD_ROOM_OPTION} className="bg-slate-800 text-blue-400">+ Add a Room</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-4 mt-6 md:mt-0 w-full md:w-auto">

              <button
                onClick={handleAutoCapture}
                disabled={!roomId || isCapturing}
                title={!roomId ? 'Assign a room with a camera first' : 'Capture a photo from the room camera and mark attendance'}
                className="flex-1 md:flex-none flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
              >
                {isCapturing ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Camera size={18} className="mr-2" />}
                {isCapturing ? 'Capturing...' : 'Take Attendance'}
              </button>

              <button
                onClick={() => setPhotoMode(true)}
                className="flex-1 md:flex-none flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                <Camera size={18} className="mr-2" />
                Photo Attendance
              </button>
            </div>
          </div>

          <AnimatePresence>
            {captureMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-6 p-3 rounded-xl text-sm flex items-center ${captureMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
              >
                {captureMessage.type === 'success' ? <CheckCircle2 size={16} className="mr-2 flex-shrink-0" /> : <AlertCircle size={16} className="mr-2 flex-shrink-0" />}
                {captureMessage.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-50 flex items-center">
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
                  <th className="p-5 font-medium border-b border-slate-800">Confidence</th>
                  <th className="p-5 font-medium border-b border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence>
                  {students.map((student) => (
                    <motion.tr
                      key={student.student_id}
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
                      <td className="p-5 text-slate-400 text-sm">{student.confidence || "0.0"}%</td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {student.status === 'Absent' ? (
                            <button
                              onClick={() => handleStatusChange(student.student_id, 'Present')}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
                              title="Mark Present"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(student.student_id, 'Absent')}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                              title="Mark Absent"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Save Attendance Button */}
          <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50">
            <button
              onClick={handleSaveAttendance}
              className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle2 size={18} className="mr-2" />
              Save Attendance
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ClassDetails;
