import { create } from 'zustand';

const useUserStore = create((set) => ({
    name: null,
    collegeName: null,
    email: null,

    login: (user) =>
        set({
            name: user.name,
            collegeName: user.collegeName,
            email: user.email,
        }),

    logout: () =>
        set({
            name: null,
            collegeName: null,
            email: null,
        }),
}));

export default useUserStore;