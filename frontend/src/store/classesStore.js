import { create } from 'zustand'
import axios from 'axios'

const useClassesStore = create((set) => ({
    classesList: [],
    fetched: false,

    fetchClassesList: async () => {
        try {
            const res = await axios.get('http://localhost:3000/classes/fetchClassesList', { withCredentials: true });
            set({ classesList: [...res.data.classes] });
            set({ fetched: true })
        }
        catch (err) {
            console.log(err);
        }
    },

    addClass: async (classObj) => {
        try {
            const res = await axios.post('http://localhost:3000/classes/addClass', { section: classObj.section, subject: classObj.subject }, { withCredentials: true });
            if (res.status === 200) {
                set((state) => ({ classesList: [...state.classesList, { ...classObj, classId: res.data.classId }] }))
            }
            else throw new Error("Failed to add class");
        }
        catch (err) {
            console.error(err);
        }

    },
    removeClass: (classId) => set((state) => ({ classesList: state.classesList.filter((c) => c.classId !== classId && c.class_id !== classId) })),
}))

export default useClassesStore;
