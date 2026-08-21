import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { supabase } from '../supabase';

const PRESET_TOPICS = ['Gaming', 'Reading', 'Development', 'AI & Tech', 'Art & Design', 'Music', 'General'];

export default function LoginModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1: Username/Auth, 2: Topics (Signup only), 3: Login view

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTopicToggle = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp && step === 1) {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please fill in all fields.');
        return;
      }
      setStep(2); // Move to topic selection onboarding
    } else {
      handleAuthSubmit();
    }
  };

  const handleAuthSubmit = async () => {
    setLoading(true);
    setErrorMsg('');

    if (isSignUp) {
      // 1. Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // 2. Insert profile metadata & selected topics
      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          { id: data.user.id, username: username.trim(), topics: selectedTopics }
        ]);
        if (profileError) {
          setErrorMsg(profileError.message);
          setLoading(false);
          return;
        }
      }

      alert('Account created successfully!');
      onClose();
      resetForm();
    } else {
      // Standard Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg('Invalid email or password.');
      } else {
        onClose();
        resetForm();
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setStep(1);
    setUsername('');
    setEmail('');
    setPassword('');
    setSelectedTopics([]);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 relative text-zinc-100 shadow-2xl animate-scaleUp">
        <button 
          type="button" 
          onClick={() => { onClose(); resetForm(); }} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSignUp && step === 2 ? (
          /* --- ONBOARDING STEP 2: TOPICS --- */
          <div>
            <h2 className="text-xl font-bold mb-1">What are you into?</h2>
            <p className="text-xs text-zinc-400 mb-6">Select topics to personalize your Korvex experience.</p>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {PRESET_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition ${
                      isSelected 
                        ? 'bg-white text-zinc-950 border-white font-semibold' 
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{topic}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-medium transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleAuthSubmit}
                className="w-1/2 py-2.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition shadow-lg shadow-white/5 disabled:opacity-50"
              >
                {loading ? 'Finalizing...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        ) : (
          /* --- STEP 1: CREDENTIALS --- */
          <div>
            <h2 className="text-xl font-bold mb-1">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-xs text-zinc-400 mb-6">
              {isSignUp ? 'Step 1: Enter your account credentials.' : 'Sign in with your email and password.'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center space-x-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleNextStep} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Username</label>
                  <input 
                    type="text" 
                    required
                    placeholder="cool_developer" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition shadow-lg shadow-white/5"
                >
                  <span>{isSignUp ? 'Next: Pick Topics' : 'Log In'}</span>
                  {isSignUp && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setStep(1);
                  setErrorMsg('');
                }}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}