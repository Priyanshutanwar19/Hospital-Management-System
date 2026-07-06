import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const DoctorPrescriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medicines: [{ name: '', dosage: '', frequency: '' }],
    instructions: '',
  });

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/prescriptions?doctorId=${user.doctorId}`);
      setPrescriptions(res.data.data);
    } catch (err) {
      toast.error('Failed to load prescriptions list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.doctorId) {
      fetchPrescriptions();
      fetchPatients();
    }
  }, [user]);

  const handleAddMedicine = () => {
    setNewPrescription({
      ...newPrescription,
      medicines: [...newPrescription.medicines, { name: '', dosage: '', frequency: '' }],
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = [...newPrescription.medicines];
    updated.splice(index, 1);
    setNewPrescription({ ...newPrescription, medicines: updated });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...newPrescription.medicines];
    updated[index][field] = value;
    setNewPrescription({ ...newPrescription, medicines: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPrescription.patientId) {
      toast.error('Please select a patient.');
      return;
    }
    // Verify medicines are filled
    const invalid = newPrescription.medicines.some(m => !m.name || !m.dosage || !m.frequency);
    if (invalid) {
      toast.error('Please fill in all medicine parameters.');
      return;
    }

    try {
      const payload = {
        patientId: newPrescription.patientId,
        doctorId: user.doctorId,
        medicines: newPrescription.medicines,
        instructions: newPrescription.instructions,
      };

      await api.post('/prescriptions', payload);
      toast.success('Prescription generated successfully!');
      setShowModal(false);
      setNewPrescription({
        patientId: '',
        medicines: [{ name: '', dosage: '', frequency: '' }],
        instructions: '',
      });
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate prescription.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prescriptions Board</h1>
          <p className="text-slate-500 text-sm">Issue pharmacy instructions, dosage charts, and view prescription history</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
        >
          ➕ Issue Prescription
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {prescriptions.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-400 border border-slate-200 rounded-3xl">
              No prescriptions recorded.
            </div>
          ) : (
            prescriptions.map((pres) => (
              <div key={pres._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Patient: {pres.patientId?.userId?.name || 'Patient'}
                    </h3>
                    <p className="text-xs text-slate-400">Prescription ID: {pres._id} | Date: {new Date(pres.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider">Prescribed Medicines</span>
                  <div className="grid gap-2">
                    {pres.medicines.map((med, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm">
                        <span className="font-semibold text-slate-900">{med.name}</span>
                        <div className="space-x-4 text-slate-600">
                          <span>Dosage: <strong className="text-slate-800">{med.dosage}</strong></span>
                          <span>Frequency: <strong className="text-indigo-600">{med.frequency}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {pres.instructions && (
                  <div className="text-sm">
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-1">Intake Instructions</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">{pres.instructions}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Issue Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 border border-slate-100 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Issue Prescription</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Patient Profile</label>
                <select
                  name="patientId"
                  value={newPrescription.patientId}
                  onChange={(e) => setNewPrescription({ ...newPrescription, patientId: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat._id} value={pat._id}>
                      {pat.userId?.name} (Age: {pat.age})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicines Array builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Medicines Ledger</label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    ＋ Add Medicine Row
                  </button>
                </div>

                <div className="space-y-3">
                  {newPrescription.medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          placeholder="Dosage (500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          placeholder="Freq (1-0-1)"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {newPrescription.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(index)}
                            className="text-rose-600 hover:text-rose-500 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Pharmacy Instructions</label>
                <textarea
                  name="instructions"
                  rows={3}
                  value={newPrescription.instructions}
                  onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                  placeholder="Take after meals. Avoid cold water."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 shadow-lg shadow-indigo-600/10 text-sm transition-all"
              >
                Issue & Sync Prescription
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
