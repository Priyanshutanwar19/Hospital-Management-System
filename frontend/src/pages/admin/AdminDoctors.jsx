import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    availability: '09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM',
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors');
      setDoctors(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newDoctor,
        role: 'doctor',
        experience: Number(newDoctor.experience),
        consultationFee: Number(newDoctor.consultationFee),
        availability: newDoctor.availability.split(',').map((s) => s.trim()),
      };
      await api.post('/auth/register', payload);
      toast.success('Doctor registered successfully!');
      setShowModal(false);
      setNewDoctor({
        name: '',
        email: '',
        password: '',
        specialization: '',
        qualification: '',
        experience: '',
        consultationFee: '',
        availability: '09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM',
      });
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor removed successfully.');
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to remove doctor.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctors Management</h1>
          <p className="text-slate-500 text-sm">Register new doctors and view clinician availability</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
        >
          ➕ Register Doctor
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
                <th className="p-4 pl-6">Doctor Details</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Qualifications</th>
                <th className="p-4">Fee (INR)</th>
                <th className="p-4">Availability Slots</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No doctors found in the system.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-950">{doc.userId?.name || 'Dr. SmartCare'}</div>
                      <div className="text-xs text-slate-500">{doc.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{doc.specialization}</td>
                    <td className="p-4 text-slate-600">
                      <div>{doc.qualification}</div>
                      <div className="text-xs text-slate-400">{doc.experience} years experience</div>
                    </td>
                    <td className="p-4 text-slate-800 font-semibold">{doc.consultationFee}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {doc.availability.map((slot) => (
                          <span key={slot} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-500 transition-colors px-3 py-1 rounded bg-rose-50 hover:bg-rose-100"
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

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Register New Doctor</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Doctor Name</label>
                  <input
                    name="name"
                    required
                    value={newDoctor.name}
                    onChange={handleChange}
                    placeholder="Dr. Alexander Pierce"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newDoctor.email}
                    onChange={handleChange}
                    placeholder="alexander@smartcare.com"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={newDoctor.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Specialization</label>
                  <input
                    name="specialization"
                    required
                    value={newDoctor.specialization}
                    onChange={handleChange}
                    placeholder="Cardiology"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Qualification</label>
                  <input
                    name="qualification"
                    required
                    value={newDoctor.qualification}
                    onChange={handleChange}
                    placeholder="MD, MBBS"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Experience</label>
                  <input
                    type="number"
                    name="experience"
                    required
                    value={newDoctor.experience}
                    onChange={handleChange}
                    placeholder="Yrs"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Consultation Fee (INR)</label>
                <input
                  type="number"
                  name="consultationFee"
                  required
                  value={newDoctor.consultationFee}
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Availability Slots (Comma separated)</label>
                <input
                  name="availability"
                  required
                  value={newDoctor.availability}
                  onChange={handleChange}
                  placeholder="09:00 AM, 11:00 AM, 02:00 PM"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 shadow-lg shadow-indigo-600/10 text-sm transition-all"
              >
                Register & Save Doctor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
