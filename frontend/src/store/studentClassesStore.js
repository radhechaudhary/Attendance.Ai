import { create } from 'zustand'
import axios from 'axios'

const useStudentClassesStore = create((set) => ({
    classesList: [],
    fetched: false,

    fetchClassesList: async () => {
        try {
            const res = await axios.get('http://localhost:3000/student/fetchClassesList', { withCredentials: true });
            set({ classesList: [...res.data.classes], fetched: true });
        }
        catch (err) {
            console.log(err);
        }
    },
}))

export default useStudentClassesStore;
