import { useEffect, useState } from 'react';
import { supabase, Service } from '../../lib/supabase';
import { Plus } from 'lucide-react';

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '30',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error: unknown) {
      console.error('Error fetching services:', error);
      alert(error instanceof Error ? error.message : 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('services').insert({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        is_active: true,
      });

      if (error) throw error;

      setFormData({
        name: '',
        description: '',
        price: '',
        duration_minutes: '30',
      });
      setShowForm(false);
      await fetchServices();
    } catch (error: unknown) {
      console.error('Error creating service:', error);
      alert(error instanceof Error ? error.message : 'Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      await fetchServices();
    } catch (error: unknown) {
      console.error('Error updating service status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update service status. Please try again.');
    }
  };

  if (loading && !showForm) {
    return <div className="text-center py-8 text-gray-500">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Service Management</h2>
          <p className="text-gray-600">Manage dental services and pricing</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-pink-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Service</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Teeth Cleaning"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Service'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-all ${
              service.is_active ? 'border-pink-100' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
              <button
                onClick={() => toggleServiceStatus(service)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {service.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
            {service.description && (
              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-pink-600">${service.price}</p>
                <p className="text-xs text-gray-500">{service.duration_minutes} minutes</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
