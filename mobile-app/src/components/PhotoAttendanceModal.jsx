import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PhotoAttendanceModal = ({ isOpen, onClose, students, setStudents }) => {
  const { classId } = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef(null);

  // Sync video element with stream
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, isCameraActive]);

  // Clean up camera stream on unmount or when modal is closed
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const startCamera = async (deviceId = null) => {
    try {
      setCameraError(null);
      setIsCameraActive(true);

      // Stop existing stream first
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);

      // Enumerate devices to get camera list
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoDevices);

      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        if (activeTrack) {
          const settings = activeTrack.getSettings();
          if (settings.deviceId) {
            setSelectedDeviceId(settings.deviceId);
          }
        }
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser or application settings to use this feature.');
      } else {
        setCameraError('Unable to access the camera. Please ensure it is connected and not in use by another application.');
      }
    }
  };

  const checkPermissionAndStart = async (deviceId = null) => {
    try {
      setCameraError(null);
      setIsCameraActive(true);

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' });
          if (result.state === 'denied') {
            setCameraError('Camera access is blocked by your browser or system settings. Please enable camera permission in your settings and try again.');
            return;
          }
        } catch (e) {
          console.warn('Camera permissions query not supported:', e);
        }
      }

      await startCamera(deviceId);
    } catch (err) {
      console.error('Permission check failed:', err);
      setCameraError('Camera permission check failed. Please check camera connections and permissions.');
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    if (cameraDevices.length <= 1) return;
    const currentIndex = cameraDevices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    const nextDevice = cameraDevices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    startCamera(nextDevice.deviceId);
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to URL and File
    const dataUrl = canvas.toDataURL('image/jpeg');
    const filename = `camera_${Date.now()}.jpg`;
    const file = dataURLtoFile(dataUrl, filename);

    setPreviews(prev => [...prev, dataUrl]);
    setSelectedFiles(prev => [...prev, file]);

    // Flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
  };

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

  const handleClose = () => {
    stopCamera();
    onClose();
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
          handleClose();
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
                <p className="text-slate-400 text-sm">Upload or capture group photos for AI recognition</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col items-center justify-center group shadow-inner">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Shutter flash effect */}
                <AnimatePresence>
                  {isFlashing && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 bg-white z-20 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Camera overlay / viewfinder */}
                <div className="absolute inset-0 border-[16px] border-slate-950/20 pointer-events-none flex items-center justify-center">
                  {/* Corner viewfinder lines */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-purple-400/50" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-purple-400/50" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-purple-400/50" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-purple-400/50" />
                </div>

                {/* Last Capture Thumbnail */}
                {previews.length > 0 && (
                  <div className="absolute top-4 right-4 w-14 h-14 rounded-xl border border-white/20 overflow-hidden shadow-2xl z-10 pointer-events-none">
                    <img src={previews[previews.length - 1]} alt="Last capture" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[8px] text-center text-white py-0.5 font-bold uppercase">
                      Captured
                    </div>
                  </div>
                )}

                {/* Camera controls overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 z-10">
                  <div className="flex-1 flex justify-start">
                    {cameraDevices.length > 1 && (
                      <button
                        type="button"
                        onClick={switchCamera}
                        className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Switch Camera"
                      >
                        <RotateCw size={18} />
                      </button>
                    )}
                  </div>

                  {/* Capture Button */}
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all border-4 border-white/10 cursor-pointer"
                    title="Capture Photo"
                  >
                    <Camera size={24} />
                  </button>

                  <div className="flex-1 flex justify-end">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>

                {/* Camera status/error message overlay */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-30">
                    <AlertCircle className="text-rose-500 mb-2" size={32} />
                    <p className="text-white font-medium mb-4 text-sm">{cameraError}</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => checkPermissionAndStart(selectedDeviceId)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-500 transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : previews.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Upload Card */}
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center group hover:border-purple-500/50 transition-all cursor-pointer relative bg-slate-900/40 hover:bg-slate-800/10 flex flex-col justify-center items-center min-h-[220px]">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-purple-500/10 transition-colors">
                    <Upload className="text-slate-400 group-hover:text-purple-400" size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Upload Files</h4>
                  <p className="text-slate-400 text-sm max-w-[200px]">Select group photos from your device library</p>
                </div>

                {/* Camera Card */}
                <button
                  type="button"
                  onClick={() => checkPermissionAndStart()}
                  className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center group hover:border-purple-500/50 transition-all cursor-pointer bg-slate-900/40 hover:bg-slate-800/10 flex flex-col justify-center items-center min-h-[220px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-purple-500/10 transition-colors">
                    <Camera className="text-slate-400 group-hover:text-purple-400" size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Use Camera</h4>
                  <p className="text-slate-400 text-sm max-w-[200px]">Take photos of students in real-time</p>
                </button>
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
                        className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}

                  {/* Add Files Card inside Grid */}
                  <label className="aspect-square border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/30 transition-all text-slate-500 hover:text-purple-400">
                    <Upload size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Add Files</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  {/* Capture Card inside Grid */}
                  <button
                    type="button"
                    onClick={() => checkPermissionAndStart()}
                    className="aspect-square border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/30 transition-all text-slate-500 hover:text-purple-400"
                  >
                    <Camera size={18} className="mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Capture</span>
                  </button>
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
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
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
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || isUploading || status === 'success'}
              className={`px-8 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg flex items-center cursor-pointer ${status === 'success'
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
