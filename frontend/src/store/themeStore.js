import { create } from 'zustand'

const getInitialTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
};

const applyTheme = (theme) => {
    document.documentElement.className = theme;
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const useThemeStore = create((set, get) => ({
    theme: initialTheme,

    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        applyTheme(theme);
        set({ theme });
    },

    toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
    },
}));

export default useThemeStore;
