import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const AdminReceptionists = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRec, setNewRec] = useState({
    name: '',
    email: '',
    password: '',
    shift: 'Morning',
    phone: '',
  });

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/receptionists');
      setReceptionists(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve receptionists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const handleChange = (e) => {
    setNewRec({ ...newRec, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newRec,
        role: 'receptionist',
      };
      await api.post('/auth/register', payload);
      toast.success('Receptionist registered successfully!');
      setShowModal(false);
      setNewRec({
        name: '',
        email: '',
        password: '',
        shift: 'Morning',
        phone: '',
      });
      fetchReceptionists();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register receptionist.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this receptionist?')) return;
    try {
      await api.delete(`/receptionists/${id}`);
      toast.success('Receptionist removed.');
      fetchReceptionists();
    } catch (err) {
      toast.error('Failed to remove receptionist.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Receptionists Management</h1>
          <p className="text-slate-500 text-sm">Register front desk receptionist staff and manage shifts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
        >
          ➕ Register Receptionist
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
                <th className="p-4 pl-6">Staff Name</th>
                <th className="p-4">Shift Details</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Email Address</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {receptionists.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No receptionists registered yet.
                  </td>
                </tr>
              ) : (
                receptionists.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-slate-950">{rec.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400">Staff ID: {rec._id}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-wider rounded-lg">
                        {rec.shift}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{rec.phone}</td>
                    <td className="p-4 text-slate-650">{rec.userId?.email || 'N/A'}</td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(rec._id)}
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

      {/* Register Receptionist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Register Receptionist</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Staff Full Name</label>
                <input
                  name="name"
                  required
                  value={newRec.name}
                  onChange={handleChange}
                  placeholder="Amy Brooks"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={newRec.email}
                  onChange={handleChange}
                  placeholder="amy@smartcare.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={newRec.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Shift</label>
                  <select
                    name="shift"
                    value={newRec.shift}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Contact Phone</label>
                <input
                  name="phone"
                  required
                  value={newRec.phone}
                  onChange={handleChange}
                  placeholder="9999999999"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 shadow-lg shadow-indigo-600/10 text-sm transition-all"
              >
                Register & Save Staff
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReceptionists;
