import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const PatientAppointments = () => {
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Payment drawer modal states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, invRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/invoices'),
      ]);
      setAppointments(aptRes.data.data || []);
      setInvoices(invRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load appointment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.patientId) {
      fetchData();
    }
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled successfully.');
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel appointment.');
    }
  };

  const getInvoiceForAppointment = (aptId) => {
    return invoices.find((inv) => inv.appointmentId?._id === aptId);
  };

  const handleRazorpayPayment = async (invoice) => {
    try {
      setPaymentProcessing(true);
      // 1. Create Order on backend
      const res = await api.post(`/invoices/${invoice._id}/pay`);
      const order = res.data.data;

      // 2. Setup checkout options
      const options = {
        key: order.keyId || 'rzp_test_dummykey',
        amount: order.amount,
        currency: order.currency,
        name: 'SmartCare Hospital',
        description: 'Consultation Fee Payment',
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post(`/invoices/${invoice._id}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              setPaymentSuccess(true);
              fetchData();
              setTimeout(() => {
                setShowPaymentModal(false);
              }, 2000);
            } else {
              toast.error('Signature verification failed.');
            }
          } catch (err) {
            toast.error('Verification error.');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#10b981',
        },
      };

      // 3. Open checkout (or simulate if mock mode is detected)
      if (order.isMock) {
        // We will simulate payment instantly with processing animation in our modal
        setTimeout(async () => {
          try {
            const verifyRes = await api.post(`/invoices/${invoice._id}/verify`, {
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(7)}`,
              razorpay_order_id: order.id,
              razorpay_signature: `sig_mock_${Math.random().toString(36).substring(7)}`,
            });
            if (verifyRes.data.success) {
              setPaymentSuccess(true);
              fetchData();
              setTimeout(() => {
                setShowPaymentModal(false);
              }, 2500);
            }
          } catch (err) {
            toast.error('Sandbox payment verification failed.');
          } finally {
            setPaymentProcessing(false);
          }
        }, 1200);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
        setPaymentProcessing(false);
      }
    } catch (err) {
      toast.error('Payment gateway setup failed.');
      setPaymentProcessing(false);
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Consultations</h1>
        <p className="text-slate-500 text-sm">Monitor upcoming appointments, cancelled slots, and settle bills</p>
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
                <th className="p-4 pl-6">Doctor</th>
                <th className="p-4">Schedule Time</th>
                <th className="p-4">Appointment Status</th>
                <th className="p-4">Consultation Invoice</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    You have not scheduled any consultations.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => {
                  const invoice = getInvoiceForAppointment(apt._id);
                  return (
                    <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-slate-900">{apt.doctorId?.userId?.name || 'Dr. SmartCare'}</div>
                        <div className="text-xs text-slate-500">{apt.doctorId?.specialization || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        <div>{new Date(apt.appointmentDate).toDateString()}</div>
                        <div className="text-xs text-indigo-600 font-semibold">{apt.slot}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg ${getStatusStyle(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {invoice ? (
                          <div className="flex items-center gap-3">
                            <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                              invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {invoice.status} (INR {invoice.amount})
                            </span>
                            {invoice.status === 'unpaid' && apt.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPaymentModal(true);
                                  setPaymentSuccess(false);
                                  setPaymentProcessing(false);
                                  setPaymentMethod('razorpay');
                                }}
                                className="bg-indigo-600 hover:bg-indigo-755 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs shadow shadow-indigo-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200"
                              >
                                💳 Pay Fee
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Invoice unavailable</span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            className="text-xs font-semibold text-rose-650 hover:text-rose-500 transition-colors px-3 py-1 rounded bg-rose-50 hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modern custom payment overlay modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-emerald-100 p-8 relative animate-fade-in">
            
            {/* Close Button */}
            {!paymentSuccess && !paymentProcessing && (
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors font-bold text-base"
              >
                ✕
              </button>
            )}

            {paymentSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-605 text-3xl mx-auto mb-4 animate-bounce">
                  ✓
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Payment Complete</h3>
                <p className="text-sm text-slate-500 mt-2">Your consultation fee has been verified successfully.</p>
                <div className="mt-6 text-xs text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full inline-block animate-pulse">
                  Status: Completed • Redirecting
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Secure Checkout</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">SmartCare Premium Billing Desk</p>

                {/* Invoice Summary Box */}
                <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 my-6">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                    <span>Invoice Details</span>
                    <span className="text-indigo-600">ID: {selectedInvoice._id.substring(18)}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mb-1">
                    Dr. {appointments.find(a => a._id === selectedInvoice.appointmentId?._id)?.doctorId?.userId?.name || 'SmartCare Specialist'}
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    Consultation & Digital Health Report
                  </div>
                  <div className="border-t border-emerald-100/60 pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Total Fee:</span>
                    <span className="text-lg font-extrabold text-emerald-800">INR {selectedInvoice.amount}</span>
                  </div>
                </div>
                               {/* Information text about payment gateway */}
                <div className="text-center py-6 px-4 border border-emerald-100/80 rounded-2xl mb-6 bg-slate-55/30">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-indigo-600 flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    💳
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Razorpay Secure Checkout</p>
                  <p className="text-xs text-slate-450 leading-relaxed max-w-[280px] mx-auto">
                    Supports UPI, Credit/Debit Cards, Netbanking, and Digital Wallets.
                  </p>
                </div>

                <button
                  onClick={() => handleRazorpayPayment(selectedInvoice)}
                  disabled={paymentProcessing}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 shadow-md shadow-indigo-600/20 text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
                >
                  {paymentProcessing ? 'Processing Securely...' : 'Proceed to Pay'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
