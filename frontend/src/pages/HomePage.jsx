import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Helper to determine dashboard path based on role
  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      case 'receptionist':
        return '/receptionist';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f4faf7] via-white to-[#fafdfc] text-slate-800 flex flex-col font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-50/50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-teal-50/60 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/25 text-xl">
            S
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800">
            SmartCare
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to={getDashboardPath(user?.role)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all font-bold shadow-md shadow-indigo-600/15 text-sm hover:-translate-y-0.5 duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all font-bold shadow-md shadow-indigo-600/15 text-sm hover:-translate-y-0.5 duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/60 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-sm">
              ✨ Intelligent Healthcare Management
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
              Modern Solution for <span className="bg-gradient-to-r from-indigo-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">Clinical Excellence</span>
            </h1>
            <p className="text-slate-550 text-lg leading-relaxed max-w-lg">
              SmartCare integrates patients, doctors, receptionists, and administrators into a secure, intuitive dashboard ecosystem. Experience seamless scheduling, payments, and record handling.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  to={getDashboardPath(user?.role)}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 text-white duration-200"
                >
                  Manage System
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 text-white duration-200"
                  >
                    Register as Patient
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 rounded-2xl border border-emerald-200 hover:border-indigo-600 bg-white hover:bg-emerald-50/20 text-slate-700 font-bold hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                  >
                    Staff Portal Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Interactive Feature Board */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md hover:border-indigo-500/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300 font-bold text-xl">
                👤
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-1">Role Portals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tailored layout dashboards for Admins, Doctors, Patients, and Reception teams.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300 font-bold text-xl">
                📅
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-1">Smart Scheduling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Conflict prevention, availability updates, and automatic slot allocations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md hover:border-sky-500/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-sky-600 mb-4 group-hover:scale-110 transition-transform duration-300 font-bold text-xl">
                💳
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-1">Razorpay Checkout</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant patient payment processing, billing audits, and automatic invoice states.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-emerald-100/80 shadow-sm hover:shadow-md hover:border-pink-500/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform duration-300 font-bold text-xl">
                📁
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-1">Cloud Records</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Securely store diagnoses, prescriptions, and upload medical documents to Cloudinary.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100/60 py-6 text-center text-xs text-slate-400 bg-emerald-50/10 relative z-10 font-medium">
        © 2026 SmartCare Hospital Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
