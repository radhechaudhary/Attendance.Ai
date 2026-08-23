import { create } from 'zustand';

const useUserStore = create((set) => ({
    name: null,
    collegeName: null,
    email: null,
    role: null,

    login: (user) =>
        set({
            name: user.name,
            collegeName: user.collegeName ?? null,
            email: user.email,
            role: user.role || 'teacher',
        }),

    logout: () =>
        set({
            name: null,
            collegeName: null,
            email: null,
            role: null,
        }),
}));

export default useUserStore;