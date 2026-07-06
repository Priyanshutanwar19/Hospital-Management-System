import { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const ReceptionistBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [invoiceForm, setInvoiceForm] = useState({
    patientId: '',
    appointmentId: '',
    amount: '',
    dueDate: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, patRes, aptRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/patients'),
        api.get('/appointments'),
      ]);
      setInvoices(invRes.data.data || []);
      setPatients(patRes.data.data || []);
      setAppointments(aptRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load billing ledgers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualMarkPaid = async (id) => {
    if (!window.confirm('Mark this invoice as Paid manually?')) return;
    try {
      await api.put(`/invoices/${id}`, { status: 'paid' });
      toast.success('Invoice updated to PAID.');
      fetchData();
    } catch (err) {
      toast.error('Failed to update invoice.');
    }
  };

  const handleInvoiceChange = (e) => {
    setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceForm.patientId || !invoiceForm.appointmentId || !invoiceForm.amount) {
      toast.error('Please fill in patient, appointment reference, and amount.');
      return;
    }

    try {
      const payload = {
        ...invoiceForm,
        amount: Number(invoiceForm.amount),
        dueDate: invoiceForm.dueDate || new Date(Date.now() + 86400000),
      };
      await api.post('/invoices', payload);
      toast.success('Custom billing invoice generated successfully!');
      setShowModal(false);
      setInvoiceForm({
        patientId: '',
        appointmentId: '',
        amount: '',
        dueDate: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice.');
    }
  };

  // Filter appointments for the selected patient in the form
  const filteredAppointments = appointments.filter(
    (apt) => apt.patientId?._id === invoiceForm.patientId && apt.status !== 'cancelled'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Invoices & Billing</h1>
          <p className="text-slate-500 text-sm">Review incoming transactions, mark offline payments, and generate invoices</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
        >
          ➕ Generate custom Invoice
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
                <th className="p-4 pl-6">Patient</th>
                <th className="p-4">Consultation / Appointment Ref</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-900">
                      {inv.patientId?.userId?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>with {inv.appointmentId?.doctorId?.userId?.name || 'Dr. SmartCare'}</div>
                      <div className="text-xs text-slate-400">Ref: {inv.appointmentId?._id}</div>
                    </td>
                    <td className="p-4 text-slate-900 font-bold">₹{inv.amount}</td>
                    <td className="p-4 text-slate-650">
                      {new Date(inv.dueDate || inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-705 text-emerald-700 border-emerald-200'
                            : inv.status === 'cancelled'
                            ? 'bg-slate-100 text-slate-550 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {inv.status === 'unpaid' && (
                        <button
                          onClick={() => handleManualMarkPaid(inv._id)}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-500 hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded-lg bg-emerald-50"
                        >
                          Mark Paid (Offline)
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Custom Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Generate Manual Invoice</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Choose Patient</label>
                <select
                  name="patientId"
                  value={invoiceForm.patientId}
                  onChange={(e) => {
                    setInvoiceForm({ ...invoiceForm, patientId: e.target.value, appointmentId: '' });
                  }}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat._id} value={pat._id}>
                      {pat.userId?.name} (ID: {pat._id.substring(18)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Appointment Reference</label>
                <select
                  name="appointmentId"
                  value={invoiceForm.appointmentId}
                  onChange={handleInvoiceChange}
                  required
                  disabled={!invoiceForm.patientId}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">-- Choose Appointment --</option>
                  {filteredAppointments.map((apt) => (
                    <option key={apt._id} value={apt._id}>
                      {new Date(apt.appointmentDate).toLocaleDateString()} - {apt.slot} (with {apt.doctorId?.userId?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Billing Amount (INR)</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    value={invoiceForm.amount}
                    onChange={handleInvoiceChange}
                    placeholder="e.g. 1000"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    value={invoiceForm.dueDate}
                    onChange={handleInvoiceChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 shadow-lg shadow-indigo-600/10 text-sm transition-all"
              >
                Generate & Settle Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistBilling;
