import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments Ledger</h1>
        <p className="text-slate-500 text-sm">Review doctor visits, scheduling tracks, and appointment statuses</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Patient</th>
                <th className="p-4">Consultant Doctor</th>
                <th className="p-4">Schedule Date & Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No appointments booked.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-900">{apt.patientId?.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-450">ID: {apt.patientId?._id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-850">{apt.doctorId?.userId?.name || 'Dr. SmartCare'}</div>
                      <div className="text-xs text-slate-500">{apt.doctorId?.specialization || 'General'}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      <div className="font-semibold">{new Date(apt.appointmentDate).toDateString()}</div>
                      <div className="text-xs text-indigo-600 font-medium">{apt.slot}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg ${getStatusStyle(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-slate-500 italic max-w-xs truncate">
                      {apt.notes || 'No notes added'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
