import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const JoinClassModal = ({ isOpen, onClose, defaultClassCode = '', onSuccess }) => {
  const [classCode, setClassCode] = useState(defaultClassCode);
  const [images, setImages] = useState({
    left: { file: null, preview: null },
    right: { file: null, preview: null },
    centre: { file: null, preview: null }
  });
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

  const handleClose = () => {
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!images.left.file || !images.right.file || !images.centre.file) {
      setErrorMessage('All 3 photo angles are required.');
      return;
    }

    const formData = new FormData();
    formData.append('classCode', classCode);
    formData.append('left', images.left.file);
    formData.append('right', images.right.file);
    formData.append('centre', images.centre.file);

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/user/join_class', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.status === 'success') {
        onSuccess && onSuccess();
        onClose();
      } else {
        setErrorMessage('Failed to join the class. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Error connecting to the server.');
    } finally {
      setIsLoading(false);
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
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-4">
                <KeyRound className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Join a Class</h3>
                <p className="text-slate-400 text-sm">Enter the class code and capture 3 face angles.</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Class Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-colors placeholder-slate-500 uppercase font-mono"
                  placeholder="e.g. 1234567890"
                  required
                />
              </div>
            </div>

            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
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
              <p className="text-[10px] text-slate-500 text-center italic">
                * 3 angles required for high-accuracy AI facial recognition
              </p>
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

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center inline-flex items-center justify-center transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Joining...
                  </div>
                ) : (
                  <>
                    Join Class
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JoinClassModal;
