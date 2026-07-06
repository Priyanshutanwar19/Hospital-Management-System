import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Logged in successfully!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  // Google GSI script initialization
  useEffect(() => {
    const handleGoogleResponse = async (response) => {
      const idToken = response.credential;
      const result = await dispatch(googleLogin(idToken));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Logged in with Google successfully!');
        navigate('/');
      } else {
        toast.error(result.payload || 'Google sign-in failed');
      }
    };

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id',
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: '380' }
      );
    }
  }, [dispatch, navigate]);

  const handleMockGoogleLogin = async () => {
    const mockEmail = prompt(
      'Enter any email to simulate Google OAuth 2.0 Login (Sandbox Mode):',
      'google.tester@smartcare.com'
    );
    if (!mockEmail || !mockEmail.trim()) return;
    
    const result = await dispatch(googleLogin(mockEmail.trim()));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`Welcome ${mockEmail}! Google Auth Mocked.`);
      navigate('/');
    } else {
      toast.error(result.payload || 'Google mock auth failed');
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
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your medical services</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="patient@smartcare.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all font-bold text-white py-3.5 shadow-md shadow-indigo-600/20 text-sm hover:-translate-y-0.5 active:translate-y-0 duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {status === 'loading' ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-100"></div>
          </div>
          <span className="relative px-3 bg-white text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            Or Use Social
          </span>
        </div>

        {/* Social Authentication Portals */}
        <div className="space-y-3">
          <div id="google-signin-btn" className="flex justify-center rounded-2xl overflow-hidden bg-white"></div>
        </div>

        {/* Footnote */}
        <div className="mt-8 text-center text-xs text-slate-500">
          New to SmartCare?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
