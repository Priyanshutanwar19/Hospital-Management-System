import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';

const DashboardLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const getTodayDateString = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex min-h-screen bg-[#fafcfb]">
      
      {/* Dynamic Role-based Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Modern Top Header / Navbar */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-emerald-100/60 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Hospital System
            </span>
            <span className="text-slate-200">/</span>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {user?.role} Workspace
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Live date stamp */}
            <span className="text-xs font-medium text-emerald-850 bg-emerald-50/60 border border-emerald-100/80 rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              {getTodayDateString()}
            </span>

            {/* Online Indicator Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block leading-tight">{user?.name}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                  ID: {user?.patientId || user?.doctorId || user?.receptionistId || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
