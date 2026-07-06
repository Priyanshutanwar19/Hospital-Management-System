import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const DoctorMedicalRecords = () => {
  const { user } = useSelector((state) => state.auth);
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    attachmentUrl: '',
  });
  const [uploading, setUploading] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Fetch only records created by this doctor
      const res = await api.get(`/medical-records?doctorId=${user.doctorId}`);
      setRecords(res.data.data);
    } catch (err) {
      toast.error('Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data);
    } catch (err) {
      console.error('Failed to load patients list', err);
    }
  };

  useEffect(() => {
    if (user?.doctorId) {
      fetchRecords();
      fetchPatients();
    }
  }, [user]);

  const handleChange = (e) => {
    setNewRecord({ ...newRecord, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await api.post('/uploads/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewRecord({ ...newRecord, attachmentUrl: res.data.data.url });
      toast.success('Document uploaded to Cloudinary successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.patientId) {
      toast.error('Please select a patient.');
      return;
    }

    try {
      const payload = {
        patientId: newRecord.patientId,
        doctorId: user.doctorId,
        diagnosis: newRecord.diagnosis,
        symptoms: newRecord.symptoms,
        treatment: newRecord.treatment,
        notes: newRecord.notes,
        attachments: newRecord.attachmentUrl ? [newRecord.attachmentUrl] : [],
      };

      await api.post('/medical-records', payload);
      toast.success('Medical record created successfully!');
      setShowModal(false);
      setNewRecord({
        patientId: '',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        attachmentUrl: '',
      });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Medical Records</h1>
          <p className="text-slate-500 text-sm">Write clinical diagnoses, symptoms, treatments, and upload reports</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 text-sm transition-all"
        >
          ➕ Create Medical Record
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {records.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-400 border border-slate-200 rounded-3xl">
              No medical records registered.
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Patient: {rec.patientId?.userId?.name || 'N/A'}
                    </h3>
                    <p className="text-xs text-slate-400">Record ID: {rec._id} | Date: {new Date(rec.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-55 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    Diagnosis: {rec.diagnosis}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-550 block text-xs uppercase tracking-wider mb-1">Symptoms Description</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{rec.symptoms}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-550 block text-xs uppercase tracking-wider mb-1">Treatment Plan</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{rec.treatment}</p>
                  </div>
                </div>

                {rec.notes && (
                  <div className="text-sm">
                    <span className="font-semibold text-slate-550 block text-xs uppercase tracking-wider mb-1">Doctor Remarks</span>
                    <p className="text-slate-600 italic bg-slate-50/50 p-3 rounded-xl">{rec.notes}</p>
                  </div>
                )}

                {rec.attachments && rec.attachments.length > 0 && (
                  <div className="text-sm pt-2">
                    <span className="font-semibold text-slate-550 block text-xs uppercase tracking-wider mb-1">Attached Lab Reports</span>
                    <div className="flex gap-2">
                      {rec.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                        >
                          📎 View Report Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create Medical Record</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Patient</label>
                <select
                  name="patientId"
                  value={newRecord.patientId}
                  onChange={handleChange}
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

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Diagnosis</label>
                <input
                  name="diagnosis"
                  required
                  value={newRecord.diagnosis}
                  onChange={handleChange}
                  placeholder="Seasonal Influenza"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Symptoms</label>
                  <textarea
                    name="symptoms"
                    required
                    rows={3}
                    value={newRecord.symptoms}
                    onChange={handleChange}
                    placeholder="High fever, cough, fatigue"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Treatment Plan</label>
                  <textarea
                    name="treatment"
                    required
                    rows={3}
                    value={newRecord.treatment}
                    onChange={handleChange}
                    placeholder="Antivirals, paracetamol, bed rest"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Additional Notes</label>
                <input
                  name="notes"
                  value={newRecord.notes}
                  onChange={handleChange}
                  placeholder="Drink warm liquids regularly"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Upload Reports (PDF / Image)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {uploading && <p className="text-xs text-indigo-600 mt-1 animate-pulse">Uploading file to Cloudinary...</p>}
                {newRecord.attachmentUrl && (
                  <p className="text-xs text-emerald-600 mt-1">✓ File uploaded: {newRecord.attachmentUrl.substring(0, 45)}...</p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 shadow-lg shadow-indigo-600/10 text-sm transition-all disabled:opacity-50"
              >
                Save Medical Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
