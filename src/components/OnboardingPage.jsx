import React, { useState } from 'react';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

const PRESET_TOPICS = ['Gaming', 'Reading', 'Development', 'AI & Tech', 'Art & Design', 'Music', 'General'];

export default function OnboardingPage({ onComplete, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopicToggle = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleUsernameNext = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter a username.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleCredentialsNext = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      setRegisteredUserId(data.user.id);
      setStep(3);
    }
    setLoading(false);
  };

  const handleFinalizeOnboarding = async () => {
    setLoading(true);
    setErrorMsg('');

    const targetUserId = registeredUserId || (await supabase.auth.getUser())?.data?.user?.id;

    if (targetUserId) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ topics: selectedTopics })
        .eq('id', targetUserId);

      if (updateError) {
        setErrorMsg(updateError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 animate-scaleUp transition-all">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? 'Username' : step === 2 ? 'Credentials' : 'Interests'}</span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center space-x-2 text-xs text-red-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleUsernameNext} className="space-y-4 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Choose your username</h1>
              <p className="text-xs text-zinc-400 mt-1">This is how other community members will see you.</p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Username</label>
              <input 
                type="text"
                required
                autoFocus
                placeholder="e.g. spatial_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition active:scale-[0.98]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleCredentialsNext} className="space-y-4 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Secure your account</h1>
              <p className="text-xs text-zinc-400 mt-1">Enter your login email and password.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Email</label>
                <input 
                  type="email"
                  required
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-medium transition active:scale-[0.98]"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="w-2/3 flex items-center justify-center space-x-2 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-55"
              >
                <span>{loading ? 'Creating...' : 'Continue'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">What are you into?</h1>
              <p className="text-xs text-zinc-400 mt-1">Pick preset topics to personalize your feed.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {PRESET_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition transform active:scale-95 ${
                      isSelected 
                        ? 'bg-white text-zinc-950 border-white font-semibold shadow-md' 
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{topic}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            <button 
              type="button"
              disabled={loading}
              onClick={handleFinalizeOnboarding}
              className="w-full py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-white/5"
            >
              {loading ? 'Finalizing Setup...' : 'Complete Onboarding'}
            </button>
          </div>
        )}

        <div className="text-center pt-2 border-t border-zinc-800">
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-xs text-zinc-400 hover:text-white transition"
          >
            Already have an account? Log in
          </button>
        </div>

      </div>
    </div>
  );
}