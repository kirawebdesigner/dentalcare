import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkSupabaseConnection, SupabaseConnectionStatus } from '../lib/supabase';
import { Stethoscope, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus | null>(null);
  const { signIn } = useAuth();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const status = await checkSupabaseConnection();
    setConnectionStatus(status);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      // Show more specific error message
      const message = err?.message || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-violet-50">
        {/* Floating decorative shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-violet-200/40 to-purple-300/30 rounded-full blur-3xl translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200/30 to-teal-200/30 rounded-full blur-3xl translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div
            className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10 relative overflow-hidden"
            style={{
              animation: 'fadeIn 0.6s ease-out',
            }}
          >
            {/* Subtle gradient overlay on card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-teal-50/30 pointer-events-none rounded-3xl" />

            {/* Content */}
            <div className="relative z-10">
              {/* Logo section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl blur-lg opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 p-4 rounded-2xl shadow-xl">
                    <Stethoscope className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent">
                  DentalCare
                </h1>
                <p className="text-gray-500 mt-2 text-center text-sm sm:text-base">
                  Practice Management System
                </p>
              </div>

              {/* Features badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-medium text-teal-700">Secure Healthcare Platform</span>
                </div>
              </div>

              {/* Connection Status Banner */}
              {connectionStatus && !connectionStatus.isConnected && (
                <div className="mb-6 bg-amber-50/80 backdrop-blur-sm border border-amber-200 text-amber-800 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Unable to connect to Supabase</h3>
                      <p className="mb-2">Please check your configuration.</p>

                      <details className="text-xs mt-2 bg-amber-100/50 p-2 rounded cursor-pointer group">
                        <summary className="font-medium hover:text-amber-900 focus:outline-none select-none">Troubleshooting Steps</summary>
                        <ul className="list-disc list-inside mt-2 space-y-1 opacity-90 pl-1">
                          <li>Ensure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                          <li className="font-bold">Restart your development server (npm run dev) if you just created the .env file</li>
                          <li>Verify Supabase project is active and accessible</li>
                          <li>Check browser console for detailed error messages</li>
                        </ul>
                      </details>

                      <button
                        onClick={checkConnection}
                        className="mt-3 text-xs font-semibold bg-amber-200/50 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all duration-300 outline-none"
                      placeholder="you@clinic.com"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all duration-300 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div
                    className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                    style={{ animation: 'fadeIn 0.3s ease-out' }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>Sign In</>
                    )}
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>
              </form>

              {/* Demo credentials */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400 mb-3">Demo Credentials</p>
                <div className="flex justify-center gap-4 text-xs">
                  <div className="px-3 py-2 rounded-lg bg-gray-50/80 border border-gray-100">
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-1 font-mono text-gray-700">admin@clinic.com</span>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-gray-50/80 border border-gray-100">
                    <span className="text-gray-500">Pass:</span>
                    <span className="ml-1 font-mono text-gray-700">admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © 2024 DentalCare. Built with modern healthcare standards.
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
