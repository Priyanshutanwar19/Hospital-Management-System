import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, googleLogin } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    // Patient specific fields
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: '',
    // Doctor specific fields
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    availability: '09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM',
    // Receptionist specific fields
    shift: 'Morning',
    phone: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format fields depending on role before dispatching
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    if (form.role === 'patient') {
      payload.age = Number(form.age);
      payload.gender = form.gender;
      payload.bloodGroup = form.bloodGroup;
      payload.address = form.address;
      payload.emergencyContact = form.emergencyContact;
    } else if (form.role === 'doctor') {
      payload.specialization = form.specialization;
      payload.qualification = form.qualification;
      payload.experience = Number(form.experience);
      payload.consultationFee = Number(form.consultationFee);
      payload.availability = form.availability.split(',').map(s => s.trim());
    } else if (form.role === 'receptionist') {
      payload.shift = form.shift;
      payload.phone = form.phone;
    }

    const result = await dispatch(register(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Registration failed');
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
        toast.error(result.payload || 'Google registration failed');
      }
    };

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id',
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signup-btn'),
        { theme: 'outline', size: 'large', width: '380' }
      );
    }
  }, [dispatch, navigate]);

  const handleMockGoogleLogin = async () => {
    const mockEmail = prompt(
      'Enter any email to simulate Google OAuth 2.0 Registration (Sandbox Mode):',
      'google.patient@smartcare.com'
    );
    if (!mockEmail || !mockEmail.trim()) return;

    const result = await dispatch(googleLogin(mockEmail.trim()));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`Welcome ${mockEmail}! Google Auth Mocked.`);
      navigate('/');
    } else {
      toast.error(result.payload || 'Google mock registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f4faf7] via-white to-[#fafdfc] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-50/40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-teal-50/50 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg rounded-3xl bg-white border border-emerald-100/80 p-8 shadow-xl shadow-emerald-600/5 backdrop-blur-sm relative z-10 my-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-11 h-11 rounded-xl bg-indigo-600 items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30 text-xl mb-4">
            S
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">Register for patient care or staff credentials</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Role / Credentials
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-705 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
              >
                <option value="patient" className="bg-white text-slate-800">Patient</option>
                <option value="doctor" className="bg-white text-slate-800">Doctor</option>
                <option value="receptionist" className="bg-white text-slate-800">Receptionist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 chars"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* DYNAMIC FIELD RENDERERS */}

          {/* Patient Fields */}
          {form.role === 'patient' && (
            <div className="border-t border-emerald-105 pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="34"
                    value={form.age}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-700 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  >
                    <option value="Male" className="bg-white text-slate-800">Male</option>
                    <option value="Female" className="bg-white text-slate-800">Female</option>
                    <option value="Other" className="bg-white text-slate-800">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                  <input
                    name="bloodGroup"
                    placeholder="O+"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact</label>
                <input
                  name="emergencyContact"
                  placeholder="Contact Name & Number"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-655 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Residential Address</label>
                <textarea
                  name="address"
                  placeholder="Enter full address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Doctor Fields */}
          {form.role === 'doctor' && (
            <div className="border-t border-emerald-105 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Specialization</label>
                  <input
                    name="specialization"
                    placeholder="Cardiologist"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Qualification</label>
                  <input
                    name="qualification"
                    placeholder="MD, MBBS"
                    value={form.qualification}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience"
                    placeholder="10"
                    value={form.experience}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-655 focus:outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fee (INR)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    placeholder="500"
                    value={form.consultationFee}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Availability Slots (Comma separated)</label>
                <input
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Receptionist Fields */}
          {form.role === 'receptionist' && (
            <div className="border-t border-emerald-105 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Shift</label>
                  <select
                    name="shift"
                    value={form.shift}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-700 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  >
                    <option value="Morning" className="bg-white text-slate-800">Morning</option>
                    <option value="Evening" className="bg-white text-slate-800">Evening</option>
                    <option value="Night" className="bg-white text-slate-800">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    name="phone"
                    placeholder="9999999999"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl bg-[#fafcfb] border border-emerald-100 text-slate-800 placeholder-slate-400 px-4 py-3.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-650 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all font-bold text-white py-3.5 shadow-md shadow-indigo-600/20 text-sm hover:-translate-y-0.5 active:translate-y-0 duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {status === 'loading' ? 'Creating Account...' : 'Register'}
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
          <div id="google-signup-btn" className="flex justify-center rounded-2xl overflow-hidden bg-white"></div>
        </div>

        {/* Footnote */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
