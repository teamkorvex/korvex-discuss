import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2 } from 'lucide-react';

export default function PostCard({ post }) {
  const [votes, setVotes] = useState(post.upvotes - post.downvotes);
  const [userVote, setUserVote] = useState(0); // 1 = up, -1 = down

  const handleVote = (type) => {
    if (userVote === type) {
      setVotes(votes - type);
      setUserVote(0);
    } else {
      setVotes(votes - (userVote * 2) + type);
      setUserVote(type);
    }
  };

  return (
    <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition mb-4 text-zinc-100 w-full">
      {/* Vote Column */}
      <div className="flex flex-col items-center justify-start p-3 bg-zinc-950/40 rounded-l-lg space-y-1">
        <button 
          onClick={() => handleVote(1)}
          className={`p-1 rounded hover:bg-zinc-800 ${userVote === 1 ? 'text-orange-500' : 'text-zinc-400'}`}
        >
          <ArrowBigUp className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold">{votes}</span>
        <button 
          onClick={() => handleVote(-1)}
          className={`p-1 rounded hover:bg-zinc-800 ${userVote === -1 ? 'text-blue-500' : 'text-zinc-400'}`}
        >
          <ArrowBigDown className="w-6 h-6" />
        </button>
      </div>

      {/* Main Post Content */}
      <div className="p-4 flex-1">
        <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-2">
          <span className="font-semibold text-zinc-200">a/{post.community}</span>
          <span>•</span>
          <span>Posted by u/{post.author} {post.timestamp}</span>
        </div>

        <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
        <p className="text-sm text-zinc-300 mb-4">{post.body}</p>

        <div className="flex items-center space-x-4 text-xs font-medium text-zinc-400">
          <button className="flex items-center space-x-1.5 hover:bg-zinc-800 px-2.5 py-1.5 rounded transition">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount} Comments</span>
          </button>
          <button className="flex items-center space-x-1.5 hover:bg-zinc-800 px-2.5 py-1.5 rounded transition">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}