import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardCard from '../../components/DashboardCard';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState({
    appointmentsCount: 0,
    patientsCount: 0,
    consultationFee: 0,
    availabilitySlots: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDashboardData = async () => {
      try {
        setLoading(true);
        // Get doctor details
        const docRes = await api.get(`/doctors/${user.doctorId}`);
        const doctorProfile = docRes.data.data;

        // Get appointments list
        const aptsRes = await api.get('/appointments');
        const appointments = aptsRes.data.data || [];

        // Count unique patients
        const pMap = {};
        appointments.forEach((apt) => {
          if (apt.patientId) pMap[apt.patientId._id] = true;
        });

        setData({
          appointmentsCount: appointments.length,
          patientsCount: Object.keys(pMap).length,
          consultationFee: doctorProfile.consultationFee,
          availabilitySlots: doctorProfile.availability || [],
          upcoming: appointments.filter((a) => a.status === 'confirmed').slice(0, 3),
        });
      } catch (err) {
        toast.error('Failed to load doctor dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.doctorId) {
      fetchDoctorDashboardData();
    }
  }, [user]);

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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinician Control Panel</h1>
        <p className="text-slate-500 text-sm">Welcome back, {user?.name}. Review schedules and consultations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard title="Assigned Appointments" value={data.appointmentsCount} />
        <DashboardCard title="Active Consulted Patients" value={data.patientsCount} />
        <DashboardCard title="Consultation Fee (INR)" value={`₹${data.consultationFee}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Availability slots summary */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Your Regular Time Slots</h2>
          <div className="flex flex-wrap gap-2 pt-2">
            {data.availabilitySlots.length === 0 ? (
              <p className="text-sm text-slate-400">No time slots configured.</p>
            ) : (
              data.availabilitySlots.map((slot) => (
                <span key={slot} className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold rounded-xl">
                  ⏰ {slot}
                </span>
              ))
            )}
          </div>
          <p className="text-xs text-slate-450 italic mt-3">
            Note: Speak to administrators to add or modify weekly availability schedules.
          </p>
        </div>

        {/* Upcoming appointments checklist */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Patient Visits</h2>
            <Link to="/doctor/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              Go to Schedule
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.upcoming.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No upcoming appointments booked today.</p>
            ) : (
              data.upcoming.map((apt) => (
                <div key={apt._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-850 text-sm">{apt.patientId?.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-450">Age: {apt.patientId?.age || 'N/A'} ({apt.patientId?.gender || 'N/A'})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-xs text-indigo-600 font-semibold">{apt.slot}</p>
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

export default DoctorDashboard;
