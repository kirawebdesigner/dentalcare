import { useEffect, useState } from 'react';
import { supabase, MedicalHistory, Patient, Appointment } from '../../lib/supabase';
import { FileText, Plus, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function MedicalHistoryManagement() {
  const { user } = useAuth();
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historiesRes, patientsRes, appointmentsRes] = await Promise.all([
        supabase
          .from('medical_history')
          .select(`
            *,
            patient:patients(*),
            doctor:profiles!medical_history_recorded_by_fkey(*)
          `)
          .order('recorded_at', { ascending: false }),
        supabase.from('patients').select('*').order('full_name'),
        supabase
          .from('appointments')
          .select('*')
          .eq('status', 'completed')
          .order('appointment_date', { ascending: false }),
      ]);

      if (historiesRes.error) throw historiesRes.error;
      if (patientsRes.error) throw patientsRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;

      setHistories(historiesRes.data || []);
      setPatients(patientsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (error: unknown) {
      console.error('Error fetching medical history data:', error);
      alert(error instanceof Error ? error.message : 'Failed to load medical history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('medical_history').insert({
        ...formData,
        appointment_id: formData.appointment_id || null,
        recorded_by: user?.id,
        recorded_at: new Date().toISOString(),
      });

      if (error) throw error;

      setFormData({
        patient_id: '',
        appointment_id: '',
        diagnosis: '',
        treatment: '',
        prescriptions: '',
        notes: '',
      });
      setShowForm(false);
      await fetchData();
    } catch (error: unknown) {
      console.error('Error creating medical history record:', error);
      alert(error instanceof Error ? error.message : 'Failed to create medical history record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistories = selectedPatient
    ? histories.filter(h => h.patient_id === selectedPatient)
    : histories;

  const patientAppointments = appointments.filter(
    a => a.patient_id === formData.patient_id
  );

  if (loading && !showForm) {
    return <div className="text-center py-8 text-gray-500">Loading medical history...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Medical History</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage patient medical records</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-pink-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Medical Record</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value, appointment_id: '' })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} - {patient.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Appointment (Optional)
                </label>
                <select
                  value={formData.appointment_id}
                  onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                  disabled={!formData.patient_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none disabled:bg-gray-100"
                >
                  <option value="">Select appointment</option>
                  {patientAppointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {new Date(apt.appointment_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                required
                rows={3}
                placeholder="Enter diagnosis"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                required
                rows={3}
                placeholder="Enter treatment details"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medications/Prescriptions</label>
              <textarea
                value={formData.prescriptions}
                onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
                rows={2}
                placeholder="Enter medications prescribed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Any additional notes"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Record'}
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
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
          >
            <option value="">All Patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredHistories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-pink-100 p-8 text-center text-gray-500">
            No medical records found
          </div>
        ) : (
          filteredHistories.map((history) => (
            <div
              key={history.id}
              className="bg-white rounded-lg shadow-md border border-pink-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {history.patient?.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(history.recorded_at).toLocaleDateString()} at{' '}
                      {new Date(history.recorded_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {history.doctor && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Recorded by</p>
                    <p className="text-sm font-medium text-gray-800">{history.doctor.full_name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                {history.diagnosis && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Diagnosis</p>
                    <p className="text-blue-800">{history.diagnosis}</p>
                  </div>
                )}

                {history.treatment && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">Treatment</p>
                    <p className="text-green-800">{history.treatment}</p>
                  </div>
                )}

                {history.prescriptions && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium text-purple-900 mb-1">Medications/Prescriptions</p>
                    <p className="text-purple-800">{history.prescriptions}</p>
                  </div>
                )}

                {history.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Additional Notes</p>
                    <p className="text-gray-800">{history.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
