import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import axios from 'axios';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:3000/user/logout', {}, {
        withCredentials: true
      });
      if (response.status === 200) {
        localStorage.setItem('loggedIn', 'no');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Students', icon: Users, path: '/students' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col z-10 hidden md:flex h-screen sticky top-0">
      <div className="h-20 flex items-center px-8 border-b border-slate-800">
        <BookOpen className="text-blue-500 mr-3" size={28} />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Smart AI
        </h1>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium transition-colors w-full"
        >
          <LogOut size={20} className="mr-3" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
