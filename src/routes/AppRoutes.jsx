import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ProfilePage from '../pages/auth/ProfilePage';
import DashboardPage, { UnauthorizedPage } from '../pages/auth/DashboardPage';
import PatientPriorityPage from '../pages/admin/PatientPriorityPage';
import QueueDashboardPage from '../pages/admin/QueueDashboardPage';
import PatientProfilePage from '../pages/patients/PatientProfilePage';
import PatientQueuePage from '../pages/patients/PatientQueuePage';
import PatientListPage from '../pages/patients/PatientListPage';
import DoctorListPage from '../pages/admin/DoctorListPage';
import DoctorDetailPage from '../pages/admin/DoctorDetailPage';
import DoctorBrowsePage from '../pages/patients/DoctorBrowsePage';
import BookAppointmentPage from '../pages/patients/BookAppointmentPage';
import PatientAppointmentsPage from '../pages/patients/PatientAppointmentsPage';
import StaffAppointmentsPage from '../pages/admin/StaffAppointmentsPage';
import SubmitSymptomsPage from '../pages/patients/SubmitSymptomsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Patient routes */}
            <Route element={<ProtectedRoute roles={['Patient']} />}>
              <Route element={<AppLayout />}>
                <Route path="/patient/profile" element={<PatientProfilePage />} />
                <Route path="/doctors" element={<DoctorBrowsePage />} />
                <Route path="/patient/book-appointment" element={<BookAppointmentPage />} />
                <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
                <Route path="/patient/submit-symptoms/:appointmentId" element={<SubmitSymptomsPage />} />
                <Route path="/patient/queue" element={<PatientQueuePage />} />
              </Route>
            </Route>

            {/* Staff-only routes */}
            <Route element={<ProtectedRoute roles={['Admin', 'Doctor', 'Receptionist']} />}>
              <Route element={<AppLayout />}>
                <Route path="/staff/patients" element={<PatientListPage />} />
                <Route path="/admin/patient-priority/:patientId" element={<PatientPriorityPage />} />
                <Route path="/admin/doctors" element={<DoctorListPage />} />
                <Route path="/admin/doctors/:doctorId" element={<DoctorDetailPage />} />
                <Route path="/staff/appointments" element={<StaffAppointmentsPage />} />
                <Route path="/admin/queue" element={<QueueDashboardPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
