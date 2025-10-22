import { useState, useEffect } from 'react';
import { Star, MapPin, DollarSign, Briefcase, Save } from 'lucide-react';
import { supabase, ServiceCategory, ProviderProfile, Review } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ProviderDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [formData, setFormData] = useState({
    bio: '',
    experience_years: 0,
    hourly_rate: 0,
    pincode: '',
    address: '',
    selectedServices: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  async function loadData() {
    if (!profile) return;

    try {
      const [categoriesRes, providerRes, reviewsRes] = await Promise.all([
        supabase.from('service_categories').select('*').order('name'),
        supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle(),
        supabase
          .from('provider_profiles')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle()
          .then(async (res) => {
            if (res.data) {
              return supabase
                .from('reviews')
                .select('*, user_profiles(full_name)')
                .eq('provider_id', res.data.id)
                .order('created_at', { ascending: false });
            }
            return { data: [], error: null };
          })
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (providerRes.data) {
        setProviderProfile(providerRes.data);
        setFormData({
          bio: providerRes.data.bio || '',
          experience_years: providerRes.data.experience_years || 0,
          hourly_rate: providerRes.data.hourly_rate || 0,
          pincode: providerRes.data.pincode || '',
          address: providerRes.data.address || '',
          selectedServices: [],
        });

        const servicesRes = await supabase
          .from('provider_services')
          .select('category_id')
          .eq('provider_id', providerRes.data.id);

        if (servicesRes.data) {
          setFormData(prev => ({
            ...prev,
            selectedServices: servicesRes.data.map(s => s.category_id)
          }));
        }
      }

      if (reviewsRes.data) setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    try {
      if (providerProfile) {
        await supabase
          .from('provider_profiles')
          .update({
            bio: formData.bio,
            experience_years: formData.experience_years,
            hourly_rate: formData.hourly_rate,
            pincode: formData.pincode,
            address: formData.address,
            updated_at: new Date().toISOString(),
          })
          .eq('id', providerProfile.id);

        await supabase
          .from('provider_services')
          .delete()
          .eq('provider_id', providerProfile.id);

        if (formData.selectedServices.length > 0) {
          await supabase
            .from('provider_services')
            .insert(
              formData.selectedServices.map(categoryId => ({
                provider_id: providerProfile.id,
                category_id: categoryId,
              }))
            );
        }
      } else {
        const { data: newProfile } = await supabase
          .from('provider_profiles')
          .insert({
            user_id: profile.id,
            bio: formData.bio,
            experience_years: formData.experience_years,
            hourly_rate: formData.hourly_rate,
            pincode: formData.pincode,
            address: formData.address,
          })
          .select()
          .single();

        if (newProfile && formData.selectedServices.length > 0) {
          await supabase
            .from('provider_services')
            .insert(
              formData.selectedServices.map(categoryId => ({
                provider_id: newProfile.id,
                category_id: categoryId,
              }))
            );
        }
      }

      await loadData();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function toggleService(categoryId: string) {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(categoryId)
        ? prev.selectedServices.filter(id => id !== categoryId)
        : [...prev.selectedServices, categoryId]
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Provider Dashboard</h2>

        {providerProfile && (
          <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-600 mb-1">
                <Star size={20} fill="currentColor" />
                <span className="text-2xl font-bold">{providerProfile.average_rating.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {providerProfile.total_reviews}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${providerProfile.is_verified ? 'text-green-600' : 'text-orange-600'}`}>
                {providerProfile.is_verified ? 'Verified' : 'Pending'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell customers about yourself and your services..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase size={16} className="inline mr-1" />
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Hourly Rate
              </label>
              <input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 110001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your service area address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Services Offered
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleService(category.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                    formData.selectedServices.includes(category.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {review.user_profiles?.full_name}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
