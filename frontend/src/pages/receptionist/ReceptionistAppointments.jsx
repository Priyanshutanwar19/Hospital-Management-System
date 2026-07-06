import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const ReceptionistAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    slot: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, patRes, docRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setAppointments(aptRes.data.data || []);
      setPatients(patRes.data.data || []);
      setDoctors(docRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load scheduling systems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment status set to ${status}.`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled and billing invoice updated.');
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel appointment.');
    }
  };

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.patientId || !bookingForm.doctorId || !bookingForm.appointmentDate || !bookingForm.slot) {
      toast.error('Please complete all scheduling fields.');
      return;
    }

    try {
      await api.post('/appointments', bookingForm);
      toast.success('Appointment booked and invoice generated.');
      setShowModal(false);
      setBookingForm({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        slot: '',
        notes: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book slot. Double-booking detected.');
    }
  };

  const selectedDoctorObj = doctors.find((d) => d._id === bookingForm.doctorId);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Appointments</h1>
          <p className="text-slate-500 text-sm">Schedule doctor consultations, handle rescheduling, and modify statuses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
        >
          ➕ Book Appointment
        </button>
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
                <th className="p-4 pl-6">Patient Details</th>
                <th className="p-4">Assigned Consultant</th>
                <th className="p-4">Scheduled Date & Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No scheduled appointments.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-900">{apt.patientId?.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400">Patient ID: {apt.patientId?._id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-850">{apt.doctorId?.userId?.name || 'Dr. SmartCare'}</div>
                      <div className="text-xs text-slate-500">{apt.doctorId?.specialization || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      <div className="font-semibold">{new Date(apt.appointmentDate).toDateString()}</div>
                      <div className="text-xs text-indigo-600 font-semibold">{apt.slot}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg ${getStatusStyle(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {apt.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'completed')}
                            className="text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors px-2 py-1 rounded bg-emerald-50"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(apt._id)}
                            className="text-xs font-semibold text-rose-650 hover:bg-rose-100 transition-colors px-2 py-1 rounded bg-rose-50"
                          >
                            Cancel
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

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 border border-slate-100 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Book Patient Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-505 text-slate-500 uppercase mb-2">Choose Patient</label>
                <select
                  name="patientId"
                  value={bookingForm.patientId}
                  onChange={handleBookingChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat._id} value={pat._id}>
                      {pat.userId?.name} (ID: {pat._id.substring(18)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Specialist Doctor</label>
                <select
                  name="doctorId"
                  value={bookingForm.doctorId}
                  onChange={(e) => {
                    setBookingForm({ ...bookingForm, doctorId: e.target.value, slot: '' });
                  }}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Specialist --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.userId?.name} ({doc.specialization}) - Fee: {doc.consultationFee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Appointment Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingForm.appointmentDate}
                  onChange={handleBookingChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {selectedDoctorObj && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Available Slots</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoctorObj.availability.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, slot: s })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                          bookingForm.slot === s
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Consultation Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={bookingForm.notes}
                  onChange={handleBookingChange}
                  placeholder="e.g. Regular review"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 shadow-lg shadow-indigo-600/10 text-sm transition-all"
              >
                Confirm Booking & Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistAppointments;
