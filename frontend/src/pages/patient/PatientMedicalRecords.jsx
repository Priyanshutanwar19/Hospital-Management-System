import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const PatientMedicalRecords = () => {
  const { user } = useSelector((state) => state.auth);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRecords = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/medical-records?patientId=${user.patientId}`);
        setRecords(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load your medical records.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.patientId) {
      fetchMyRecords();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Medical Records</h1>
        <p className="text-slate-500 text-sm">Review diagnoses, clinical assessments, symptoms and doctor instructions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {records.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-400 border border-slate-200 rounded-3xl">
              No medical records exist in your name.
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Consultant: {rec.doctorId?.userId?.name || 'Dr. SmartCare'}
                    </h3>
                    <p className="text-xs text-slate-400">Date: {new Date(rec.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    Diagnosis: {rec.diagnosis}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-1">Symptoms Noted</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{rec.symptoms}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-1">Prescribed Treatment</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{rec.treatment}</p>
                  </div>
                </div>

                {rec.notes && (
                  <div className="text-sm">
                    <span className="font-semibold text-slate-550 block text-xs uppercase tracking-wider mb-1">Physician Advice</span>
                    <p className="text-slate-650 italic bg-slate-50/50 p-3 rounded-xl">{rec.notes}</p>
                  </div>
                )}

                {rec.attachments && rec.attachments.length > 0 && (
                  <div className="text-sm pt-2">
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-1">Lab Attachments</span>
                    <div className="flex gap-2">
                      {rec.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100"
                        >
                          📎 Open Document {index + 1}
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
    </div>
  );
};

export default PatientMedicalRecords;
