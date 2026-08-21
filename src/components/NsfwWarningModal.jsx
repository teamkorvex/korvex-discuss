import React from 'react';

export default function NsfwWarningModal({ isOpen, user, onConfirm, onCancel, onOpenLogin }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative text-zinc-100 shadow-2xl animate-scaleUp space-y-6">
        
        {/* Header with 18+ Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center font-bold text-xs text-red-500 tracking-tighter">
            18+
          </div>
          <h2 className="text-xl font-bold tracking-tight">Mature Content</h2>
        </div>

        {/* Warning Copy */}
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            {user 
              ? "This community contains mature content. By clicking Continue, you confirm that you are over 18 years of age." 
              : "This community may contain sensitive or adult content that's not for everyone. To view it, please confirm your age or log in."}
          </p>
          <p className="text-xs text-zinc-500">
            By continuing, you agree that use of this platform constitutes acceptance of Korvex's User Agreement and acknowledgement of our Privacy Policy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white transition active:scale-95"
          >
            I'm Not Over 18
          </button>

          <button 
            type="button"
            onClick={() => {
              if (user) {
                onConfirm(); // If logged in, proceed straight to community
              } else {
                onCancel(); 
                if (onOpenLogin) onOpenLogin(); // If not logged in, open login modal
              }
            }}
            className="px-6 py-2.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition active:scale-95 shadow-lg shadow-white/5"
          >
            {user ? 'Continue' : 'Log In'}
          </button>
        </div>

      </div>
    </div>
  );
}