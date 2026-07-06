import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments Schedule</h1>
        <p className="text-slate-500 text-sm">Review your consultations, diagnose patients, and update statuses</p>
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
                <th className="p-4 pl-6">Patient Name</th>
                <th className="p-4">Demographics</th>
                <th className="p-4">Date & Time Slot</th>
                <th className="p-4">Appointment Status</th>
                <th className="p-4">Notes</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    You have no scheduled appointments.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-950">
                      {apt.patientId?.userId?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600">
                      Age: {apt.patientId?.age || 'N/A'} ({apt.patientId?.gender || 'N/A'})
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
                    <td className="p-4 text-slate-550 italic truncate max-w-xs">{apt.notes || 'N/A'}</td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {apt.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'completed')}
                            className="text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors px-2.5 py-1.5 rounded-lg bg-emerald-50"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                            className="text-xs font-semibold text-rose-650 hover:bg-rose-100 transition-colors px-2.5 py-1.5 rounded-lg bg-rose-50"
                          >
                            Cancel Visit
                          </button>
                        </>
                      )}
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

export default DoctorAppointments;
