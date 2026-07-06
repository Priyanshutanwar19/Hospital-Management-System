import { useState } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await authService.forgotPassword({ email });
      toast.success('Password reset email sent! Check your inbox/console.');
      setStatus('succeeded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f4faf7] via-white to-[#fafdfc] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-50/40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-teal-50/50 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-white border border-emerald-100/80 p-8 shadow-xl shadow-emerald-600/5 backdrop-blur-sm relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-11 h-11 rounded-xl bg-indigo-600 items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30 text-xl mb-4">
            S
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Forgot Password</h2>
          <p className="text-sm text-slate-500 mt-1">We will send you a password recovery link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="user@example.com"
              required
              className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all font-bold text-white py-3.5 shadow-md shadow-indigo-600/20 text-sm hover:-translate-y-0.5 active:translate-y-0 duration-200 disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Footnote */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Back to{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
