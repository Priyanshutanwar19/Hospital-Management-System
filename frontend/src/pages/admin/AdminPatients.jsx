import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      setPatients(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this patient record?')) return;
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient record removed.');
      fetchPatients();
    } catch (err) {
      toast.error('Failed to delete patient.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patients Management</h1>
        <p className="text-slate-500 text-sm">View registered patients and manage medical files</p>
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
                <th className="p-4">Contact Detail</th>
                <th className="p-4">Demographics</th>
                <th className="p-4">Residential Address</th>
                <th className="p-4">Emergency Contact</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No patients registered yet.
                  </td>
                </tr>
              ) : (
                patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-950">{pat.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400">ID: {pat._id}</div>
                    </td>
                    <td className="p-4 text-slate-700">{pat.userId?.email || 'N/A'}</td>
                    <td className="p-4 text-slate-600">
                      <div>Age: {pat.age} ({pat.gender})</div>
                      <div className="text-xs font-semibold text-indigo-600">Blood: {pat.bloodGroup || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-slate-550 max-w-xs truncate">{pat.address}</td>
                    <td className="p-4 text-slate-600 font-medium">{pat.emergencyContact}</td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(pat._id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-500 transition-colors px-3 py-1 rounded bg-rose-50 hover:bg-rose-100"
                      >
                        Remove
                      </button>
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

export default AdminPatients;
