import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardCard from '../../components/DashboardCard';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState({
    appointmentsCount: 0,
    prescriptionsCount: 0,
    unpaidInvoicesCount: 0,
    upcoming: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [aptRes, invRes, presRes, notifRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/invoices'),
        api.get(`/prescriptions?patientId=${user.patientId}`),
        api.get('/notifications'),
      ]);

      const appointments = aptRes.data.data || [];
      const invoices = invRes.data.data || [];
      const prescriptions = presRes.data.data || [];
      const notifications = notifRes.data.data || [];

      const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid');
      const upcomingAppointments = appointments.filter((a) => a.status === 'confirmed');

      setData({
        appointmentsCount: appointments.length,
        prescriptionsCount: prescriptions.length,
        unpaidInvoicesCount: unpaidInvoices.length,
        upcoming: upcomingAppointments.slice(0, 3),
        notifications: notifications.slice(0, 5),
      });
    } catch (err) {
      toast.error('Failed to load patient dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.patientId) {
      fetchDashboardData();
    }
  }, [user]);

  const handleMarkRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}`, { readStatus: true });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Care Portal</h1>
        <p className="text-slate-500 text-sm">Welcome back, {user?.name}. Check your appointment schedules and billing dues.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard title="Your Appointments" value={data.appointmentsCount} />
        <DashboardCard title="Active Prescriptions" value={data.prescriptionsCount} />
        <DashboardCard title="Unpaid Dues" value={data.unpaidInvoicesCount} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Consultations */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Your Next Consultations</h2>
            <Link to="/patient/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              View History
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.upcoming.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-450 space-y-3">
                <p>No active consultations scheduled.</p>
                <Link
                  to="/patient/book-appointment"
                  className="inline-block bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-indigo-100 transition-colors"
                >
                  📅 Book Appointment Now
                </Link>
              </div>
            ) : (
              data.upcoming.map((apt) => (
                <div key={apt._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-855 text-sm">{apt.doctorId?.userId?.name || 'Dr. SmartCare'}</p>
                    <p className="text-xs text-slate-450">{apt.doctorId?.specialization || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-xs text-indigo-600 font-semibold">{apt.slot}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications and Alerts */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Care Updates & Reminders</h2>
          <div className="space-y-3">
            {data.notifications.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No care notifications.</p>
            ) : (
              data.notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.readStatus && handleMarkRead(notif._id)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    notif.readStatus
                      ? 'bg-slate-50 border-slate-100 text-slate-500'
                      : 'bg-indigo-50/40 border-indigo-100/60 text-slate-800 font-medium hover:bg-indigo-50 shadow-sm shadow-indigo-500/5'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{notif.title}</span>
                    {!notif.readStatus && (
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    )}
                  </div>
                  <p>{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
