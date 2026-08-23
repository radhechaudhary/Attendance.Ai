import { create } from 'zustand'
import axios from 'axios'

const useRoomsStore = create((set) => ({
    roomsList: [],
    fetched: false,

    fetchRoomsList: async () => {
        try {
            const res = await axios.get('http://localhost:3000/rooms/fetchRoomsListTeacher', { withCredentials: true });
            set({ roomsList: [...res.data.rooms], fetched: true });
        }
        catch (err) {
            console.log(err);
        }
    },

    addRoom: async (roomObj) => {
        try {
            const res = await axios.post('http://localhost:3000/rooms/addRoomTeacher', roomObj, { withCredentials: true });
            if (res.data.status === 'success') {
                set((state) => ({
                    roomsList: [
                        ...state.roomsList.filter((r) => r.room_id !== roomObj.room_id),
                        { room_id: roomObj.room_id, room_name: roomObj.room_name }
                    ]
                }));
                return { status: 'success' };
            }
            return { status: 'error', message: res.data.message };
        }
        catch (err) {
            console.error(err);
            return { status: 'error', message: err.response?.data?.message };
        }
    },

    removeRoom: async (roomId) => {
        try {
            await axios.post('http://localhost:3000/rooms/deleteRoomTeacher', { roomId }, { withCredentials: true });
            set((state) => ({ roomsList: state.roomsList.filter((r) => r.room_id !== roomId) }));
        }
        catch (err) {
            console.error(err);
        }
    },
}))

export default useRoomsStore;
