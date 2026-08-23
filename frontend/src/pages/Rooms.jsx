import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DoorOpen, X, Trash2, AlertCircle } from 'lucide-react';
import useRoomsStore from '../store/roomsStore';
import Sidebar from '../components/Sidebar';

const Rooms = () => {
  const rooms = useRoomsStore((state) => state.roomsList);
  const addRoom = useRoomsStore((state) => state.addRoom);
  const removeRoom = useRoomsStore((state) => state.removeRoom);
  const fetchRoomsList = useRoomsStore((state) => state.fetchRoomsList);
  const fetched = useRoomsStore((state) => state.fetched);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roomClaim, setRoomClaim] = useState({ room_id: '', camera_password: '', room_name: '' });
  const [claimError, setClaimError] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!fetched) {
      fetchRoomsList();
    }
  }, [fetched]);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setClaimError('');
    setIsClaiming(true);
    try {
      const result = await addRoom(roomClaim);
      if (result.status === 'success') {
        setRoomClaim({ room_id: '', camera_password: '', room_name: '' });
        setIsAddModalOpen(false);
      } else {
        setClaimError(result.message || 'Could not add this room.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm("Remove this room from your list? Any classes using it will need a new room.")) {
      removeRoom(roomId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 p-6 sm:p-10 hide-scrollbar">

        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-50 mb-2">Rooms</h2>
            <p className="text-slate-400">Rooms you've added using their Room ID and password. Pick one on a class to take attendance automatically.</p>
          </div>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-50 flex items-center">
            <DoorOpen className="mr-2 text-blue-400" size={20} />
            My Rooms
          </h3>
          <button
            onClick={() => { setClaimError(''); setIsAddModalOpen(true); }}
            className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} className="mr-2" />
            Add Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {rooms.map((room, index) => (
              <motion.div
                key={room.room_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors group"
              >
                <div className="h-3 w-full bg-gradient-to-r from-blue-600 to-purple-400"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <DoorOpen size={20} />
                    </div>
                    <button
                      onClick={() => handleDeleteRoom(room.room_id)}
                      className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-md transition-colors"
                      title="Remove room"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-slate-50 mb-2">{room.room_name}</h4>
                  <div className="flex items-center text-sm text-slate-400">
                    <span className="font-mono text-xs">Room ID: {room.room_id}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {rooms.length === 0 && (
            <div
              onClick={() => { setClaimError(''); setIsAddModalOpen(true); }}
              className="bg-slate-800/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-700 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/40 transition-all min-h-[220px]"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-blue-500">
                <DoorOpen size={28} />
              </div>
              <h4 className="text-lg font-semibold text-slate-50 mb-2">Add Your First Room</h4>
              <p className="text-sm text-slate-400 max-w-xs">Enter a Room ID and password given to you for its camera to add it here.</p>
            </div>
          )}
        </div>
      </main>

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

              <form onSubmit={handleAddRoom} className="space-y-5">
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
                  {claimError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center space-x-2"
                    >
                      <AlertCircle size={14} />
                      <span>{claimError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-50 font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClaiming}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white font-medium rounded-xl text-sm px-5 py-3.5 text-center transition-colors shadow-lg shadow-blue-500/25"
                  >
                    {isClaiming ? 'Adding...' : 'Add Room'}
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

export default Rooms;
