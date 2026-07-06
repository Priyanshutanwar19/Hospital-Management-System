import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/axiosConfig';
import { toast } from 'react-toastify';

const PatientPrescriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/prescriptions?patientId=${user.patientId}`);
        setPrescriptions(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load prescriptions list.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.patientId) {
      fetchMyPrescriptions();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Prescriptions</h1>
        <p className="text-slate-500 text-sm">Review doctor instructions, medicine lists, and pharmacy plans</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {prescriptions.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-400 border border-slate-200 rounded-3xl">
              No prescriptions have been registered under your profile.
            </div>
          ) : (
            prescriptions.map((pres) => (
              <div key={pres._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Prescribed By: {pres.doctorId?.userId?.name || 'Dr. SmartCare'}
                    </h3>
                    <p className="text-xs text-slate-400">Date: {new Date(pres.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider">Medicines Checklist</span>
                  <div className="grid gap-2">
                    {pres.medicines.map((med, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm">
                        <span className="font-semibold text-slate-900">{med.name}</span>
                        <div className="space-x-4 text-slate-650">
                          <span>Dosage: <strong className="text-slate-800">{med.dosage}</strong></span>
                          <span>Frequency: <strong className="text-indigo-650">{med.frequency}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {pres.instructions && (
                  <div className="text-sm">
                    <span className="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-1">Pharmacy Advice</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">{pres.instructions}</p>
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

export default PatientPrescriptions;
