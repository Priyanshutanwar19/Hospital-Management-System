import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const ReceptionistPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: '',
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      setPatients(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load patients list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPatient,
        age: Number(newPatient.age),
      };
      await api.post('/patients', payload);
      toast.success('Patient registered successfully!');
      setShowModal(false);
      setNewPatient({
        name: '',
        email: '',
        password: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'O+',
        address: '',
        emergencyContact: '',
      });
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register patient.');
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
          <p className="text-slate-500 text-sm">Register new patients, view demographics, and manage active records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
        >
          ➕ Register New Patient
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
                <th className="p-4">Demographics</th>
                <th className="p-4">Contact Phone / Email</th>
                <th className="p-4">Emergency Contact</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No registered patients.
                  </td>
                </tr>
              ) : (
                patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-950">{pat.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400">ID: {pat._id}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      <div>Age: {pat.age} ({pat.gender})</div>
                      <div className="text-xs font-semibold text-indigo-600">Blood: {pat.bloodGroup || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-slate-650">
                      <div>{pat.userId?.email || 'N/A'}</div>
                      <div className="text-xs text-slate-450">{pat.address}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{pat.emergencyContact}</td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(pat._id)}
                        className="text-xs font-semibold text-rose-650 hover:text-rose-500 transition-colors px-3 py-1 rounded bg-rose-50 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 border border-slate-100 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Register New Patient</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Patient Full Name</label>
                  <input
                    name="name"
                    required
                    value={newPatient.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newPatient.email}
                    onChange={handleChange}
                    placeholder="john.doe@gmail.com"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Temporary Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={newPatient.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    required
                    value={newPatient.age}
                    onChange={handleChange}
                    placeholder="e.g. 34"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Gender</label>
                  <select
                    name="gender"
                    value={newPatient.gender}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Blood Group</label>
                  <input
                    name="bloodGroup"
                    value={newPatient.bloodGroup}
                    onChange={handleChange}
                    placeholder="O+"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Emergency Contact</label>
                <input
                  name="emergencyContact"
                  required
                  value={newPatient.emergencyContact}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe (9999999999)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Residential Address</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={newPatient.address}
                  onChange={handleChange}
                  placeholder="Enter patient address"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 shadow-lg shadow-indigo-600/10 text-sm transition-all"
              >
                Register & Save Patient
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistPatients;
