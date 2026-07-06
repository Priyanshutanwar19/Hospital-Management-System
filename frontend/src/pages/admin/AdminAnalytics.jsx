import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';
import DashboardCard from '../../components/DashboardCard';

const AdminAnalytics = () => {
  const [metrics, setMetrics] = useState({
    doctorsCount: 0,
    patientsCount: 0,
    receptionistsCount: 0,
    appointmentsCount: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [docs, pats, recs, apts, invs] = await Promise.all([
        api.get('/doctors'),
        api.get('/patients'),
        api.get('/receptionists'),
        api.get('/appointments'),
        api.get('/invoices'),
      ]);

      const doctors = docs.data.data || [];
      const patients = pats.data.data || [];
      const receptionists = recs.data.data || [];
      const appointments = apts.data.data || [];
      const invoices = invs.data.data || [];

      // Calculate aggregations
      const completed = appointments.filter((a) => a.status === 'completed').length;
      
      let revenue = 0;
      let pending = 0;
      invoices.forEach((inv) => {
        if (inv.status === 'paid') {
          revenue += inv.amount;
        } else if (inv.status === 'unpaid' || inv.status === 'pending') {
          pending += inv.amount;
        }
      });

      setMetrics({
        doctorsCount: doctors.length,
        patientsCount: patients.length,
        receptionistsCount: receptionists.length,
        appointmentsCount: appointments.length,
        completedAppointments: completed,
        totalRevenue: revenue,
        pendingPayments: pending,
        recentInvoices: invoices.slice(0, 5),
      });
    } catch (err) {
      toast.error('Failed to load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Analytics</h1>
        <p className="text-slate-500 text-sm">Real-time metrics, system performance, and hospital finance auditing</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Total Doctors" value={metrics.doctorsCount} />
        <DashboardCard title="Total Patients" value={metrics.patientsCount} />
        <DashboardCard title="Revenue Book (INR)" value={`₹${metrics.totalRevenue}`} />
        <DashboardCard title="Outstanding Invoices" value={`₹${metrics.pendingPayments}`} />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Appointments stats */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Appointments Delivery Ratio</h2>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Total Bookings</span>
                <span>{metrics.appointmentsCount}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Completed Appointments</span>
                <span>{metrics.completedAppointments}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${metrics.appointmentsCount > 0 ? (metrics.completedAppointments / metrics.appointmentsCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Hospital Billing Audit</h2>
          
          <div className="flex gap-6 items-center justify-center py-4">
            <div className="text-center">
              <span className="text-sm font-semibold text-emerald-600">Collected Revenue</span>
              <div className="text-2xl font-bold text-slate-900">₹{metrics.totalRevenue}</div>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-center">
              <span className="text-sm font-semibold text-rose-500">Uncollected Claims</span>
              <div className="text-2xl font-bold text-slate-900">₹{metrics.pendingPayments}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Ledger Invoices */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Audited Invoices (Recent)</h2>
        <div className="overflow-hidden border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-3 pl-4">Patient</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {metrics.recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-400">
                    No recent invoices.
                  </td>
                </tr>
              ) : (
                metrics.recentInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="p-3 pl-4 font-semibold text-slate-800">
                      {inv.patientId?.userId?.name || 'N/A'}
                    </td>
                    <td className="p-3 font-semibold text-slate-950">₹{inv.amount}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded font-semibold ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
