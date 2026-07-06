import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import authService from '../services/authService';
import { toast } from 'react-toastify';

// SVG Icons Components
const DashboardIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
  </svg>
);

const DoctorsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2.5 0-4.5-2-4.5-4.5V4m9 3.5V4M12 12c2.5 0 4.5-2 4.5-4.5V4M7.5 4h9M12 12v6m0 0a3.5 3.5 0 107 0m-7 0a3.5 3.5 0 11-7 0" />
  </svg>
);

const PatientsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ReceptionistsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AppointmentsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
  </svg>
);

const MedicalRecordsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
  </svg>
);

const PrescriptionsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BillingIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const BookAppointmentIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const renderIcon = (name) => {
  switch (name) {
    case 'dashboard': return <DashboardIcon />;
    case 'doctors': return <DoctorsIcon />;
    case 'patients': return <PatientsIcon />;
    case 'receptionists': return <ReceptionistsIcon />;
    case 'appointments': return <AppointmentsIcon />;
    case 'analytics': return <AnalyticsIcon />;
    case 'medical-records': return <MedicalRecordsIcon />;
    case 'prescriptions': return <PrescriptionsIcon />;
    case 'billing': return <BillingIcon />;
    case 'book-appointment': return <BookAppointmentIcon />;
    default: return null;
  }
};

const Sidebar = () => {
  const { user, refreshToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout API failure, proceeding to clear client state:', err);
    }
    dispatch(logout());
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const getNavItems = (role) => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
          { label: 'Doctors', path: '/admin/doctors', icon: 'doctors' },
          { label: 'Patients', path: '/admin/patients', icon: 'patients' },
          { label: 'Receptionists', path: '/admin/receptionists', icon: 'receptionists' },
          { label: 'Appointments', path: '/admin/appointments', icon: 'appointments' },
          { label: 'Analytics', path: '/admin/analytics', icon: 'analytics' },
        ];
      case 'doctor':
        return [
          { label: 'Dashboard', path: '/doctor', icon: 'dashboard' },
          { label: 'Appointments', path: '/doctor/appointments', icon: 'appointments' },
          { label: 'Patients', path: '/doctor/patients', icon: 'patients' },
          { label: 'Medical Records', path: '/doctor/medical-records', icon: 'medical-records' },
          { label: 'Prescriptions', path: '/doctor/prescriptions', icon: 'prescriptions' },
        ];
      case 'patient':
        return [
          { label: 'Dashboard', path: '/patient', icon: 'dashboard' },
          { label: 'Book Appointment', path: '/patient/book-appointment', icon: 'book-appointment' },
          { label: 'Appointment History', path: '/patient/appointments', icon: 'appointments' },
          { label: 'Medical Records', path: '/patient/medical-records', icon: 'medical-records' },
          { label: 'Prescriptions', path: '/patient/prescriptions', icon: 'prescriptions' },
        ];
      case 'receptionist':
        return [
          { label: 'Dashboard', path: '/receptionist', icon: 'dashboard' },
          { label: 'Manage Patients', path: '/receptionist/patients', icon: 'patients' },
          { label: 'Manage Appointments', path: '/receptionist/appointments', icon: 'appointments' },
          { label: 'Billing / Invoices', path: '/receptionist/billing', icon: 'billing' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(user?.role);

  return (
    <aside className="w-64 bg-white border-r border-emerald-100/60 flex flex-col justify-between text-slate-650 shrink-0">
      
      {/* Top Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow shadow-indigo-600/30 text-base">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">SmartCare</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/doctor' || item.path === '/patient' || item.path === '/receptionist'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:text-white'
                    : 'hover:bg-emerald-50/50 hover:text-indigo-600 text-slate-600'
                }`
              }
            >
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile panel & Logout */}
      {user && (
        <div className="p-4 border-t border-emerald-100/40 bg-emerald-50/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-indigo-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100/60 text-[10px] uppercase font-bold text-indigo-750 tracking-wider rounded-full mt-1.5">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
      
    </aside>
  );
};

export default Sidebar;
