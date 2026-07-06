import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPatients = async () => {
      try {
        setLoading(true);
        const res = await api.get('/appointments');
        const appointments = res.data.data || [];
        
        // Group unique patients
        const patientMap = {};
        appointments.forEach((apt) => {
          if (apt.patientId) {
            patientMap[apt.patientId._id] = apt.patientId;
          }
        });

        setPatients(Object.values(patientMap));
      } catch (err) {
        toast.error('Failed to load patient records.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPatients();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Consulted Patients</h1>
        <p className="text-slate-500 text-sm">List of unique patients who have scheduled consults with you</p>
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
                <th className="p-4">Email</th>
                <th className="p-4">Age / Gender</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Home Address</th>
                <th className="p-4 pr-6">Emergency Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No consulted patients found.
                  </td>
                </tr>
              ) : (
                patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-900">
                      {pat.userId?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600">{pat.userId?.email || 'N/A'}</td>
                    <td className="p-4 text-slate-700">
                      {pat.age} years ({pat.gender})
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded">
                        {pat.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-550 max-w-xs truncate">{pat.address}</td>
                    <td className="p-4 pr-6 text-slate-700 font-semibold">{pat.emergencyContact}</td>
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

export default DoctorPatients;
