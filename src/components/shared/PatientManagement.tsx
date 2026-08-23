import { useEffect, useState } from 'react';
import { supabase, Patient } from '../../lib/supabase';
import { UserPlus, Search, X, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PatientManagementProps {
  selectedPatientId?: string | null;
}

export function PatientManagement({ selectedPatientId }: PatientManagementProps) {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(
        (p) =>
          p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  // Handle selectedPatientId from search
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [selectedPatientId, patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!profile || !['admin', 'receptionist'].includes(profile.role)) {
        throw new Error('Only admins and receptionists can create patients');
      }

      if (!user?.id) {
        throw new Error('User authentication required');
      }

      const { error } = await supabase.from('patients').insert({
        full_name: formData.full_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
        notes: formData.notes || null,
        created_by: user.id,
      });

      if (error) throw error;

      setFormData({
        full_name: '',
        phone: '',
        date_of_birth: '',
        address: '',
        notes: '',
      });
      setShowForm(false);
      await fetchPatients();
    } catch (error: unknown) {
      console.error('Error creating patient:', error);
      alert(error instanceof Error ? error.message : 'Failed to create patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showForm) {
    return <div className="text-center py-8 text-gray-500">Loading patients...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Patient Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage patient records and information</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-pink-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Patient</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="Enter patient name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any additional notes"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Patient'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-pink-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Patient Profile</h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Patient Avatar & Name */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {selectedPatient.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{selectedPatient.full_name}</h4>
                    <p className="text-sm text-gray-500">Patient ID: {selectedPatient.id.slice(0, 8)}...</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <Phone className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-800">{selectedPatient.phone}</p>
                    </div>
                  </div>

                  {selectedPatient.date_of_birth && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(selectedPatient.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPatient.address && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-800">{selectedPatient.address}</p>
                      </div>
                    </div>
                  )}

                  {selectedPatient.notes && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <FileText className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm text-gray-800">{selectedPatient.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration Info */}
                <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                  Registered on {new Date(selectedPatient.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-pink-50 to-rose-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date of Birth
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Address
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No patients found
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-pink-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{patient.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {patient.date_of_birth
                      ? new Date(patient.date_of_birth).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{patient.address || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-pink-100 p-6 text-center text-gray-500">
            No patients found
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-lg shadow-md border border-pink-100 p-4 cursor-pointer hover:shadow-lg transition-all active:scale-[0.99]"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  {patient.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{patient.full_name}</h3>
                  <p className="text-sm text-gray-500">{patient.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400">DOB:</span>{' '}
                  {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}
                </div>
                <div className="truncate">
                  <span className="text-gray-400">Address:</span> {patient.address || '-'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
