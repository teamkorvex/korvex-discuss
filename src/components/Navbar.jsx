import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, LogIn, UserPlus, LogOut, User, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png'; // Adjust path if your logo is located elsewhere

export default function Navbar({ user, onOpenCreate, onOpenLogin, onOpenSignUp, onLogout, onHomeClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract username and email from user object
  const email = user?.email || '';
  const username = user?.user_metadata?.username || email.split('@')[0] || 'User';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-[#0f0f12] border-b border-zinc-900">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={onHomeClick}>
        <img src={logo} alt="Korvex Logo" className="w-8 h-8 object-contain hover:opacity-85 transition" />
      </div>

      <div className="hidden md:flex items-center relative w-96">
        <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search communities, posts, or users..." 
          className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-full pl-9 pr-4 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
        />
      </div>

      <div className="flex items-center space-x-3">
        <button 
          onClick={onOpenCreate}
          className="flex items-center space-x-1.5 bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-full text-sm font-semibold transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 p-1.5 pr-3 rounded-full text-zinc-200 transition active:scale-95"
            >
              <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 text-zinc-300">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium max-w-[100px] truncate">{username}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2.5 border-b border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{username}</p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{email}</p>
                </div>
                
                <div className="p-1">
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button 
              onClick={onOpenLogin}
              className="flex items-center space-x-1 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 border border-zinc-800/80 px-3.5 py-2 rounded-full text-sm font-medium transition active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <button 
              onClick={onOpenSignUp}
              className="flex items-center space-x-1 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 border border-zinc-800/80 px-3.5 py-2 rounded-full text-sm font-medium transition active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}