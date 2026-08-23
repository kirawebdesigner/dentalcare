import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/admin/Dashboard';
import { StaffManagement } from './components/admin/StaffManagement';
import { ServiceManagement } from './components/admin/ServiceManagement';
import { PatientManagement } from './components/shared/PatientManagement';
import { AppointmentManagement } from './components/shared/AppointmentManagement';
import { PaymentManagement } from './components/shared/PaymentManagement';
import { MedicalHistoryManagement } from './components/doctor/MedicalHistoryManagement';
import { Stethoscope } from 'lucide-react';
import { UserRole } from './lib/supabase';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Custom tab change handler that clears patient selection
  const handleTabChange = (tab: string, patientId?: string) => {
    setActiveTab(tab);
    setSelectedPatientId(patientId || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-violet-50/20 flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Loading content */}
        <div className="relative z-10 text-center">
          <div className="relative inline-block mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
            {/* Logo container */}
            <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-5 rounded-2xl shadow-2xl">
              <Stethoscope className="w-10 h-10 text-white animate-pulse" strokeWidth={1.5} />
            </div>
          </div>

          {/* Loading spinner */}
          <div className="flex justify-center mb-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          </div>

          <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            DentalCare
          </h2>
          <p className="text-gray-500 text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  if (!['admin', 'doctor', 'receptionist'].includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-gray-900">Account access unavailable</h1>
          <p className="mt-2 text-sm text-gray-600">Your account does not have a supported clinic role. Contact an administrator.</p>
          <button type="button" onClick={() => void signOut()} className="mt-6 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const getDefaultTab = () => {
    if (profile.role === 'admin') return 'dashboard';
    if (profile.role === 'receptionist') return 'patients';
    return 'appointments';
  };

  const allowedTabs: Record<UserRole, string[]> = {
    admin: ['dashboard', 'staff', 'services', 'patients', 'appointments', 'payments'],
    receptionist: ['patients', 'appointments', 'payments'],
    doctor: ['appointments', 'medical-history'],
  };
  const roleTabs = allowedTabs[profile.role];
  const requestedTab = activeTab || getDefaultTab();
  const currentTab = roleTabs?.includes(requestedTab) ? requestedTab : getDefaultTab();

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'staff':
        return <StaffManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'patients':
        return <PatientManagement selectedPatientId={selectedPatientId} />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'medical-history':
        return <MedicalHistoryManagement />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={currentTab} onTabChange={handleTabChange}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
