import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PhotoAttendanceModal = ({ isOpen, onClose, students, setStudents }) => {
  const { classId } = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map(file => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then(results => {
      setPreviews(prev => [...prev, ...results]);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setStatus(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('photos', file);
    });
    formData.append('classId', classId);

    try {
      const res = await axios.post('http://localhost:3000/classes/photoAttendance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.status === 200) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          const newStudents = students.map(student => {
            if (student.status === 'Present' || res.data.attendance[student.student_id]) {
              student.status = 'Present';
            } else {
              student.status = 'Absent';
            }
            return student;
          });
          setStudents(newStudents);
          setSelectedFiles([]);
          setPreviews([]);
          setStatus(null);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4">
                <Camera className="text-purple-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Photo Attendance</h3>
                <p className="text-slate-400 text-sm">Upload group photos for AI recognition</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {previews.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center group hover:border-purple-500/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/10 transition-colors">
                  <Upload className="text-slate-400 group-hover:text-purple-400" size={24} />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">Select multiple photos</h4>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  Drag and drop or click to browse. You can upload up to 15 photos at once.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {previews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-xl overflow-hidden group border border-slate-800"
                    >
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/30 transition-all text-slate-500 hover:text-purple-400">
                    <Upload size={20} className="mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Add More</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                <div className="flex items-center justify-between bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                  <div className="text-sm">
                    <span className="text-white font-medium">{selectedFiles.length}</span>
                    <span className="text-slate-400 ml-1">images selected</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFiles([]);
                      setPreviews([]);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || isUploading || status === 'success'}
              className={`px-8 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg flex items-center ${status === 'success'
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 size={18} className="mr-2" />
                  Sent Successfully
                </>
              ) : status === 'error' ? (
                <>
                  <AlertCircle size={18} className="mr-2" />
                  Try Again
                </>
              ) : (
                'Submit Attendance'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PhotoAttendanceModal;
