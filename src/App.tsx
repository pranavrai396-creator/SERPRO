import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ConsumerSearch from './components/ConsumerSearch';
import ProviderDashboard from './components/ProviderDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSignInClick={() => setShowAuthModal(true)} />

      {user && profile ? (
        profile.role === 'provider' ? (
          <ProviderDashboard />
        ) : (
          <ConsumerSearch />
        )
      ) : (
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
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
