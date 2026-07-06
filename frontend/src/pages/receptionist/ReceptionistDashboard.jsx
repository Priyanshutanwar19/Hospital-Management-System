import { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ReceptionistDashboard = () => {
  const [data, setData] = useState({
    patientsCount: 0,
    appointmentsCount: 0,
    unpaidInvoicesCount: 0,
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [patRes, aptRes, invRes] = await Promise.all([
          api.get('/patients'),
          api.get('/appointments'),
          api.get('/invoices'),
        ]);

        const patients = patRes.data.data || [];
        const appointments = aptRes.data.data || [];
        const invoices = invRes.data.data || [];

        const unpaid = invoices.filter((i) => i.status === 'unpaid').length;
        const upcomingApts = appointments.filter((a) => a.status === 'confirmed').slice(0, 3);

        setData({
          patientsCount: patients.length,
          appointmentsCount: appointments.length,
          unpaidInvoicesCount: unpaid,
          upcoming: upcomingApts,
        });
      } catch (err) {
        toast.error('Failed to load receptionist dashboard.');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Front Desk Dashboard</h1>
          <p className="text-slate-550 text-sm">Welcome back. Handle patient registry, bookings, and cash payments.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/receptionist/patients"
            className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
          >
            ➕ Register Patient
          </Link>
          <Link
            to="/receptionist/appointments"
            className="border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
          >
            📅 Book Appointment
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard title="Registered Patients" value={data.patientsCount} />
        <DashboardCard title="Total Booked Consults" value={data.appointmentsCount} />
        <DashboardCard title="Unpaid Invoices" value={data.unpaidInvoicesCount} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Consultations */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Next Scheduled Appointments</h2>
            <Link to="/receptionist/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              Manage Bookings
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.upcoming.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No upcoming appointments booked.</p>
            ) : (
              data.upcoming.map((apt) => (
                <div key={apt._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-850 text-sm">{apt.patientId?.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-450">with {apt.doctorId?.userId?.name || 'Dr. SmartCare'}</p>
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

        {/* Quick Help Guide */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Front Desk Guide</h2>
          <div className="space-y-3 text-sm text-slate-650">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800 block mb-0.5">1. New Patients</span>
              Receptionist must collect contact and emergency info to register patients offline.
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800 block mb-0.5">2. Appointment Billing</span>
              Appointments automatically generate unpaid consultation bills. Patient can pay online using Razorpay, or receptionist can record offline cash payments in the Billing tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
