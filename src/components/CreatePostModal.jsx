import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabase';

export default function CreatePostModal({ isOpen, onClose, onAddPost }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);

  // Fetch communities fresh every time the modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchCommunities();
    }
  }, [isOpen]);

  const fetchCommunities = async () => {
    const { data, error } = await supabase.from('communities').select('*').order('name');
    if (error) {
      console.error('Error fetching communities for dropdown:', error);
    } else if (data && data.length > 0) {
      setCommunities(data);
      // Keep the current selection if it still exists, otherwise default to the first one
      if (!selectedCommunity || !data.some(c => c.name === selectedCommunity)) {
        setSelectedCommunity(data[0].name);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedCommunity) return;

    onAddPost({
      community: selectedCommunity,
      title,
      body,
      is_nsfw: isNsfw
    });

    setTitle('');
    setBody('');
    setIsNsfw(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 relative text-zinc-100 shadow-2xl animate-scaleUp">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Create a Post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Select Community</label>
            <select 
              value={selectedCommunity} 
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
            >
              {communities.map(c => (
                <option key={c.id} value={c.name}>a/{c.name} {c.is_nsfw ? '(NSFW)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Title</label>
            <input 
              type="text" 
              required
              placeholder="Title of your post..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Body Text</label>
            <textarea 
              rows="4"
              placeholder="Write your content here..." 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input 
              type="checkbox"
              id="nsfw-toggle"
              checked={isNsfw}
              onChange={(e) => setIsNsfw(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-red-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="nsfw-toggle" className="text-xs font-medium text-zinc-300 flex items-center space-x-1 cursor-pointer">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>Mark as NSFW (Not Safe For Work)</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}