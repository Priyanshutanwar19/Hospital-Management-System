import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/admin', roles: ['admin'] },
  { label: 'Doctors', path: '/admin/doctors', roles: ['admin'] },
  { label: 'Patients', path: '/admin/patients', roles: ['admin'] },
  { label: 'Receptionists', path: '/admin/receptionists', roles: ['admin'] },
  { label: 'Appointments', path: '/admin/appointments', roles: ['admin', 'doctor', 'receptionist'] },
  { label: 'Analytics', path: '/admin/analytics', roles: ['admin'] },
];

const Sidebar = () => {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-6">
      <div className="text-xl font-semibold text-slate-900 mb-6">SmartCare</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-slate-700 hover:bg-slate-100 ${isActive ? 'bg-slate-100 font-semibold' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
