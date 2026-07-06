import { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState({
    doctorsCount: 0,
    patientsCount: 0,
    appointmentsCount: 0,
    recentAppointments: [],
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [docs, pats, apts, invs] = await Promise.all([
          api.get('/doctors'),
          api.get('/patients'),
          api.get('/appointments'),
          api.get('/invoices'),
        ]);

        setData({
          doctorsCount: (docs.data.data || []).length,
          patientsCount: (pats.data.data || []).length,
          appointmentsCount: (apts.data.data || []).length,
          recentAppointments: (apts.data.data || []).slice(0, 5),
          recentInvoices: (invs.data.data || []).slice(0, 5),
        });
      } catch (err) {
        toast.error('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Panel</h1>
        <p className="text-slate-500 text-sm">System administration, statistics, and healthcare workflows</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard title="Active Doctors" value={data.doctorsCount} />
        <DashboardCard title="Registered Patients" value={data.patientsCount} />
        <DashboardCard title="Appointments Booked" value={data.appointmentsCount} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Appointments */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Visits</h2>
            <Link to="/admin/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentAppointments.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No upcoming appointments booked.</p>
            ) : (
              data.recentAppointments.map((apt) => (
                <div key={apt._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-850 text-sm">{apt.patientId?.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">with {apt.doctorId?.userId?.name || 'Dr. SmartCare'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-xs text-indigo-500 font-medium">{apt.slot}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Claims</h2>
            <Link to="/admin/analytics" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              View Analytics
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentInvoices.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No recent billing claims.</p>
            ) : (
              data.recentInvoices.map((inv) => (
                <div key={inv._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-850 text-sm">{inv.patientId?.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-450">Due Date: {new Date(inv.dueDate || inv.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-slate-950">₹{inv.amount}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
