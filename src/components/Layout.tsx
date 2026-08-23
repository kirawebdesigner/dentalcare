import { ReactNode, useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LogOut,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Stethoscope,
  UserPlus,
  LayoutDashboard,
  ChevronRight,
  Search,
  X
} from 'lucide-react';

interface SearchResult {
  type: 'patient' | 'appointment';
  id: string;
  title: string;
  subtitle: string;
}

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string, patientId?: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function
  useEffect(() => {
    let ignore = false;

    const searchData = async () => {
      const term = searchQuery.trim();
      if (term.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setSearching(true);
      try {
        const results: SearchResult[] = [];
        const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;

        // Use separate parameterized filters rather than interpolating a raw
        // PostgREST .or() expression with user input.
        const [nameResponse, phoneResponse] = await Promise.all([
          supabase.from('patients').select('id, full_name, phone').ilike('full_name', pattern).limit(5),
          supabase.from('patients').select('id, full_name, phone').ilike('phone', pattern).limit(5),
        ]);

        const patients = [...(nameResponse.data ?? []), ...(phoneResponse.data ?? [])]
          .filter((patient, index, all) => all.findIndex((item) => item.id === patient.id) === index)
          .slice(0, 5);

        patients.forEach(p => {
          results.push({
            type: 'patient',
            id: p.id,
            title: p.full_name,
            subtitle: p.phone
          });
        });

        // Search appointments (by patient name)
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, patients(full_name)')
          .limit(10);

        if (appointments) {
          appointments
            .filter(a => {
              const patient = Array.isArray(a.patients) ? a.patients[0] : a.patients;
              return patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .slice(0, 3)
            .forEach(a => {
              const patient = Array.isArray(a.patients) ? a.patients[0] : a.patients;
              results.push({
                type: 'appointment',
                id: a.id,
                title: `Appointment: ${patient?.full_name || 'Unknown'}`,
                subtitle: `${new Date(a.appointment_date).toLocaleDateString()} at ${a.appointment_time}`
              });
            });
        }

        if (!ignore) {
          setSearchResults(results);
          setShowResults(true);
        }
      } catch {
        if (!ignore) {
          setSearchResults([]);
          setShowResults(true);
        }
      } finally {
        if (!ignore) setSearching(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => {
      ignore = true;
      clearTimeout(debounce);
    };
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'patient') {
      onTabChange('patients', result.id);
    } else if (result.type === 'appointment') {
      onTabChange('appointments');
    }
    setSearchQuery('');
    setShowResults(false);
  };

  const getNavItems = () => {
    if (profile?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'staff', label: 'Staff', icon: Users },
        { id: 'services', label: 'Services', icon: Stethoscope },
        { id: 'patients', label: 'Patients', icon: UserPlus },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'payments', label: 'Payments', icon: CreditCard },
      ];
    } else if (profile?.role === 'receptionist') {
      return [
        { id: 'patients', label: 'Patients', icon: UserPlus },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'payments', label: 'Payments', icon: CreditCard },
      ];
    } else if (profile?.role === 'doctor') {
      return [
        { id: 'appointments', label: 'My Schedule', icon: Calendar },
        { id: 'medical-history', label: 'Medical Records', icon: FileText },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-violet-500 to-purple-500 text-white';
      case 'doctor':
        return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white';
      case 'receptionist':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-violet-50/20 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="backdrop-blur-xl bg-white/70 border-b border-white/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl blur opacity-40" />
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  DentalCare
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleBadgeColor(profile?.role)}`}>
                    {profile?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Search bar - hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <label htmlFor="global-search" className="sr-only">Search patients and appointments</label>
                <input
                  id="global-search"
                  type="search"
                  placeholder="Search patients, appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {searching && (
                      <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
                    )}
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                        <div className={`p-2 rounded-lg ${result.type === 'patient' ? 'bg-blue-100' : 'bg-teal-100'}`}>
                          {result.type === 'patient' ? (
                            <UserPlus className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Calendar className="w-4 h-4 text-teal-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{result.title}</p>
                          <p className="text-xs text-gray-500">{result.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3 text-sm text-gray-500 z-50">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* User info */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200/50">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-teal-500/20">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
              </div>

              {/* Sign out */}
              <button
                type="button"
                aria-label="Sign out"
                onClick={() => void signOut()}
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Content Card */}
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
            <nav className="flex gap-1 p-2 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onTabChange(item.id)}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                      : 'text-gray-600 hover:bg-teal-50/70 hover:text-teal-700'
                      }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                    <span className="hidden sm:inline">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 hidden sm:inline animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-16rem)]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-gray-400">
          <p>© 2026 DentalCare Practice Management • Created by Kirubel Daniel</p>
        </footer>
      </div>
    </div>
  );
}
