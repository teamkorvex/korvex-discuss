import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ShieldAlert, Plus, Users, Tag } from 'lucide-react';

export default function CommunityView({ onSelectCommunity, onOpenCreateCommunity }) {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    fetchCommunities();

    const channel = supabase
      .channel('public:communities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'communities' },
        (payload) => {
          setCommunities((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCommunities = async () => {
    const { data, error } = await supabase.from('communities').select('*').order('name');
    if (error) console.error('Error fetching communities:', error);
    else setCommunities(data || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-xs text-zinc-400 mt-1">Explore spaces by topic or launch your own community.</p>
        </div>
        <button
          onClick={onOpenCreateCommunity}
          className="flex items-center space-x-1.5 bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-full text-sm font-semibold transition shadow-lg shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map((comm) => (
          <div
            key={comm.id}
            onClick={() => onSelectCommunity(comm)}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 cursor-pointer transition flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                  a/{comm.name}
                </span>
                <div className="flex items-center space-x-2">
                  {comm.topic && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium rounded-full">
                      <Tag className="w-3 h-3 text-zinc-400" />
                      <span>{comm.topic}</span>
                    </span>
                  )}
                  {comm.is_nsfw && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 bg-red-950/60 border border-red-800 text-red-400 text-xs font-semibold rounded-full">
                      <ShieldAlert className="w-3 h-3" />
                      <span>NSFW</span>
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2">{comm.description || 'No description provided.'}</p>
            </div>
            <div className="flex items-center text-xs text-zinc-500 space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Active board</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}