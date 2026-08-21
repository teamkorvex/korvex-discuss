import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../supabase';

const TOPIC_CATEGORIES = ['General', 'Gaming', 'Reading', 'Development', 'AI & Tech', 'Art & Design', 'Music'];

export default function CreateCommunityModal({ isOpen, onClose, onCommunityCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isNsfw, setIsNsfw] = useState(false);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const { data, error } = await supabase
      .from('communities')
      .insert([
        {
          name: name.trim().toLowerCase(),
          description: description.trim(),
          category: category,
          is_nsfw: isNsfw
        }
      ])
      .select();

    if (error) {
      console.error('Error creating community:', error);
      alert(error.message);
    } else if (data) {
      onCommunityCreated(data[0]);
      onClose();
      setName('');
      setDescription('');
      setCategory('General');
      setIsNsfw(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative text-zinc-100 shadow-2xl animate-scaleUp">
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold tracking-tight mb-1">Create a Community</h2>
        <p className="text-xs text-zinc-400 mb-6">Build a dedicated space for your topics and discussions.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Community Name</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-500 text-sm font-medium">a/</span>
              <input 
                type="text" 
                required
                placeholder="community_name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
              />
            </div>
          </div>

          {/* CUSTOM DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Topic Category</label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 hover:border-zinc-700 transition"
            >
              <span>{category}</span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 animate-scaleUp max-h-56 overflow-y-auto">
                {TOPIC_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition text-left ${
                      category === cat 
                        ? 'bg-zinc-800 text-white font-semibold' 
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea 
              rows="3"
              placeholder="What is this community about?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition resize-none"
            />
          </div>

          {/* CUSTOM TOGGLE WITH UNIQUE WORDING */}
          <div className="pt-2">
            <div 
              onClick={() => setIsNsfw(!isNsfw)}
              className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-red-400 tracking-tighter">
                  18+
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Explicit Content</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Restrict access to adult or sensitive members only</p>
                </div>
              </div>

              {/* Pill Switch */}
              <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${isNsfw ? 'bg-white' : 'bg-zinc-800'}`}>
                <div className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${isNsfw ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition shadow-lg shadow-white/5 active:scale-[0.98]"
            >
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}