import { Wrench, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSignInClick: () => void;
}

export default function Header({ onSignInClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wrench size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ServiceConnect</h1>
              <p className="text-xs text-gray-500">Find Trusted Professionals</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && profile ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <User size={18} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {profile.full_name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {profile.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={onSignInClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
