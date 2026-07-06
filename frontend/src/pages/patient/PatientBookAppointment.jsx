import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PatientBookAppointment = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors');
      setDoctors(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const selectedDoctorObj = doctors.find((d) => d._id === selectedDoctorId);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error('Please select a doctor.');
      return;
    }
    if (!appointmentDate) {
      toast.error('Please pick a date.');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please choose a time slot.');
      return;
    }

    try {
      const payload = {
        patientId: user.patientId,
        doctorId: selectedDoctorId,
        appointmentDate,
        slot: selectedSlot,
        notes,
      };

      await api.post('/appointments', payload);
      toast.success('Appointment booked successfully! Consultation invoice generated.');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment. Doctor may already be booked for this slot.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Book Consultation</h1>
        <p className="text-slate-500 text-sm">Choose a specialist clinician, schedule date and time slot</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleBook} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Specialist Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedSlot(''); // Reset slot on doctor change
              }}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- Choose Specialist --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.userId?.name} ({doc.specialization}) - Consultation: INR {doc.consultationFee}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Info Subpanel */}
          {selectedDoctorObj && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-450 uppercase font-semibold">Clinician Profile</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedDoctorObj.userId?.name}</p>
                <p className="text-slate-500">{selectedDoctorObj.qualification} ({selectedDoctorObj.experience} yrs exp)</p>
              </div>
              <div>
                <p className="text-slate-450 uppercase font-semibold">Consultation Cost</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">INR {selectedDoctorObj.consultationFee}</p>
                <p className="text-slate-500">Payable via Razorpay checkout</p>
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Appointment Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]} // Block past dates
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Slots Selector */}
          {selectedDoctorObj && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Choose Available Time Slot
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedDoctorObj.availability.length === 0 ? (
                  <p className="text-xs text-slate-400">Doctor has no slots configured.</p>
                ) : (
                  selectedDoctorObj.availability.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        selectedSlot === slot
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Booking Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Brief Symptoms / Consultation Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Cough, mild fever for 2 days..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 shadow-lg shadow-indigo-600/30 text-sm transition-all hover:-translate-y-0.5 duration-200"
          >
            Confirm & Schedule Appointment
          </button>
        </form>
      )}
    </div>
  );
};

export default PatientBookAppointment;
