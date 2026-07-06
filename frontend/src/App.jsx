import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminReceptionists from './pages/admin/AdminReceptionists';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientBookAppointment from './pages/patient/PatientBookAppointment';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistPatients from './pages/receptionist/ReceptionistPatients';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';
import ReceptionistBilling from './pages/receptionist/ReceptionistBilling';

// Layout & Route Wrapper
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={['admin']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><AdminDoctors /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute allowedRoles={['admin']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><AdminPatients /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/receptionists"
          element={
            <ProtectedRoute allowedRoles={['admin']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><AdminReceptionists /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><AdminAppointments /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><AdminAnalytics /></DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Doctor Dashboard Routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><DoctorDashboard /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['doctor']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><DoctorAppointments /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><DoctorPatients /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/medical-records"
          element={
            <ProtectedRoute allowedRoles={['doctor']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><DoctorMedicalRecords /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['doctor']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><DoctorPrescriptions /></DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Patient Dashboard Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><PatientDashboard /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute allowedRoles={['patient']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><PatientBookAppointment /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><PatientAppointments /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/medical-records"
          element={
            <ProtectedRoute allowedRoles={['patient']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><PatientMedicalRecords /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['patient']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><PatientPrescriptions /></DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Receptionist Dashboard Routes */}
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute allowedRoles={['receptionist']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><ReceptionistDashboard /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/patients"
          element={
            <ProtectedRoute allowedRoles={['receptionist']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><ReceptionistPatients /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/appointments"
          element={
            <ProtectedRoute allowedRoles={['receptionist']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><ReceptionistAppointments /></DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/billing"
          element={
            <ProtectedRoute allowedRoles={['receptionist']} isAuthenticated={isAuthenticated} user={user}>
              <DashboardLayout><ReceptionistBilling /></DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
