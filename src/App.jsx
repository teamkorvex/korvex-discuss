import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import PostCard from './components/PostCard';
import CommunityView from './components/CommunityView';
import CreatePostModal from './components/CreatePostModal';
import CreateCommunityModal from './components/CreateCommunityModal';
import LoginModal from './components/LoginModal';
import OnboardingPage from './components/OnboardingPage';
import NsfwWarningModal from './components/NsfwWarningModal';
import { Home, PlusCircle, ArrowLeft, Hash } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userTopics, setUserTopics] = useState(['General', 'Gaming']);
  
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  const [pendingCommunity, setPendingCommunity] = useState(null);
  const [showNsfwWarning, setShowNsfwWarning] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserTopics(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserTopics(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserTopics = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('topics')
      .eq('id', userId)
      .single();

    if (data && data.topics) {
      setUserTopics(data.topics);
    }
  };

  useEffect(() => {
    if (currentCommunity) {
      fetchPostsForCommunity(currentCommunity.name);
    } else {
      fetchHomeFeedPosts();
    }
  }, [currentCommunity, userTopics]);

  const fetchPostsForCommunity = async (commName) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('community', commName)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching posts:', error);
    else setPosts(data || []);
  };

  const fetchHomeFeedPosts = async () => {
    const { data: matchingCommunities } = await supabase
      .from('communities')
      .select('name')
      .in('category', userTopics);

    const communityNames = matchingCommunities ? matchingCommunities.map(c => c.name) : [];

    let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

    if (communityNames.length > 0) {
      query = query.in('community', communityNames);
    }

    const { data, error } = await query.limit(20);
    if (error) console.error('Error fetching home feed:', error);
    else setPosts(data || []);
  };

  const handleSelectCommunity = (comm) => {
    if (comm.is_nsfw) {
      setPendingCommunity(comm);
      setShowNsfwWarning(true);
    } else {
      setCurrentCommunity(comm);
    }
  };

  const handleAddPost = async (newPost) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    const username = user.email ? user.email.split('@')[0] : 'anonymous';

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: newPost.title,
          body: newPost.body,
          community: newPost.community,
          author: username,
          upvotes: 1,
          downvotes: 0,
          comment_count: 0,
          is_nsfw: newPost.is_nsfw
        }
      ])
      .select();

    if (error) {
      console.error('Error creating post:', error);
    } else if (data) {
      if (!currentCommunity || currentCommunity.name === newPost.community) {
        setPosts([data[0], ...posts]);
      }
    }
    setIsCreatePostOpen(false);
  };

  if (isOnboardingOpen) {
    return (
      <OnboardingPage 
        onComplete={() => setIsOnboardingOpen(false)} 
        onSwitchToLogin={() => { 
          setIsOnboardingOpen(false); 
          setIsLoginOpen(true); 
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-['Inter',sans-serif]">
      <Navbar 
        user={user}
        onOpenCreate={() => {
          if (!user) setIsLoginOpen(true);
          else setIsCreatePostOpen(true);
        }} 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onOpenSignUp={() => setIsOnboardingOpen(true)}
        onLogout={() => supabase.auth.signOut()}
        onHomeClick={() => setCurrentCommunity(null)}
      />

      {/* Main Layout Grid with #0f0f12 Connected Sidebar */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-4rem)]">
        
        {/* LEFT SIDEBAR (#0f0f12 Background Shade) */}
        <aside className="hidden md:flex md:col-span-3 lg:col-span-2 border-r border-zinc-900 bg-[#0f0f12] p-6 flex-col justify-between space-y-6">
          <div className="space-y-6 w-full">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">Feed</p>
              <button
                onClick={() => setCurrentCommunity(null)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  !currentCommunity 
                    ? 'bg-zinc-800/80 text-white font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">Communities</p>
              <button
                onClick={() => {
                  if (!user) setIsLoginOpen(true);
                  else setIsCreateCommOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-white text-zinc-950 hover:bg-zinc-200 py-2.5 rounded-xl text-xs font-semibold transition shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Community</span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3">Your Topics</p>
              <div className="flex flex-wrap gap-1.5 px-1 pt-1">
                {userTopics.map((topic) => (
                  <span key={topic} className="flex items-center space-x-1 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg">
                    <Hash className="w-3 h-3 text-zinc-500" />
                    <span>{topic}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN FEED CONTENT AREA */}
        <main className="col-span-1 md:col-span-9 lg:col-span-10 px-4 md:px-10 py-8 max-w-3xl">
          {currentCommunity ? (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentCommunity(null)}
                    className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-300 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">a/{currentCommunity.name}</h1>
                    <p className="text-xs text-zinc-400">{currentCommunity.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!user) setIsLoginOpen(true);
                    else setIsCreatePostOpen(true);
                  }}
                  className="bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-full text-sm font-semibold transition"
                >
                  Create Post
                </button>
              </div>

              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                    <p className="text-sm text-zinc-400 mb-2">No posts in this community yet.</p>
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="text-xs text-emerald-400 font-semibold hover:underline"
                    >
                      Be the first to start a discussion!
                    </button>
                  </div>
                ) : (
                  posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                    <p className="text-sm text-zinc-400 mb-2">No posts found matching your topic filters.</p>
                    <button
                      onClick={() => setCurrentCommunity(null)}
                      className="text-xs text-white font-semibold underline"
                    >
                      Explore all communities
                    </button>
                  </div>
                ) : (
                  posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            </div>
          )}
        </main>

      </div>

      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 mt-auto bg-[#0f0f12]">
        <span className="font-semibold text-zinc-400">Korvex</span> — Driven by the community, for the community.
      </footer>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
        onAddPost={handleAddPost} 
      />
      <CreateCommunityModal
        isOpen={isCreateCommOpen}
        onClose={() => setIsCreateCommOpen(false)}
        onCommunityCreated={(newComm) => setCurrentCommunity(newComm)}
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <NsfwWarningModal
        isOpen={showNsfwWarning}
        user={user}
        onConfirm={() => {
          setShowNsfwWarning(false);
          setCurrentCommunity(pendingCommunity);
          setPendingCommunity(null);
        }}
        onCancel={() => {
          setShowNsfwWarning(false);
          setPendingCommunity(null);
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
}