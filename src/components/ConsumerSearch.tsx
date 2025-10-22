import { useState, useEffect } from 'react';
import { Search, MapPin, Star, DollarSign, Briefcase, Phone } from 'lucide-react';
import { supabase, ServiceCategory, ProviderProfile, ProviderService } from '../lib/supabase';

interface ProviderWithServices extends ProviderProfile {
  provider_services: ProviderService[];
}

export default function ConsumerSearch() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pincode, setPincode] = useState('');
  const [providers, setProviders] = useState<ProviderWithServices[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithServices | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
  }

  async function handleSearch() {
    if (!pincode.trim()) {
      alert('Please enter a pincode');
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('provider_profiles')
        .select(`
          *,
          user_profiles(full_name, phone),
          provider_services(id, category_id, service_categories(name, description))
        `)
        .eq('is_verified', true)
        .eq('pincode', pincode.trim());

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      if (selectedCategory) {
        filteredData = filteredData.filter((provider: ProviderWithServices) =>
          provider.provider_services.some(
            (service: ProviderService) => service.category_id === selectedCategory
          )
        );
      }

      filteredData.sort((a: ProviderWithServices, b: ProviderWithServices) =>
        b.average_rating - a.average_rating
      );

      setProviders(filteredData);
    } catch (error) {
      console.error('Error searching providers:', error);
      alert('Failed to search providers');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Service Providers</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Pincode
            </label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g., 110001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {providers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedProvider(provider)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {provider.user_profiles?.full_name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {provider.average_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({provider.total_reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Verified
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Briefcase size={16} />
                  <span>{provider.experience_years} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <DollarSign size={16} />
                  <span>₹{provider.hourly_rate}/hour</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>{provider.pincode}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {provider.provider_services.map((service) => (
                  <span
                    key={service.id}
                    className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                  >
                    {service.service_categories?.name}
                  </span>
                ))}
              </div>

              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                View Profile
              </button>
            </div>
          ))}
        </div>
      ) : (
        !loading && pincode && (
          <div className="text-center py-12 text-gray-500">
            No providers found in this area. Try a different pincode or service type.
          </div>
        )
      )}

      {selectedProvider && (
        <ProviderModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}

interface ProviderModalProps {
  provider: ProviderWithServices;
  onClose: () => void;
}

function ProviderModal({ provider, onClose }: ProviderModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [provider.id]);

  async function loadReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, user_profiles(full_name)')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setReviews(data);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {provider.user_profiles?.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-gray-900">
                    {provider.average_rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({provider.total_reviews} reviews)
                </span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded ml-2">
                  Verified
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Briefcase size={18} />
              </div>
              <div className="font-medium text-gray-900">
                {provider.experience_years} years
              </div>
              <div className="text-xs text-gray-500">Experience</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <DollarSign size={18} />
              </div>
              <div className="font-medium text-gray-900">
                ₹{provider.hourly_rate}
              </div>
              <div className="text-xs text-gray-500">Per Hour</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <MapPin size={18} />
              </div>
              <div className="font-medium text-gray-900">
                {provider.pincode}
              </div>
              <div className="text-xs text-gray-500">Pincode</div>
            </div>
          </div>

          {provider.bio && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600">{provider.bio}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Services Offered</h3>
            <div className="flex flex-wrap gap-2">
              {provider.provider_services.map((service) => (
                <span
                  key={service.id}
                  className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-lg"
                >
                  {service.service_categories?.name}
                </span>
              ))}
            </div>
          </div>

          {provider.address && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Area</h3>
              <p className="text-gray-600">{provider.address}</p>
            </div>
          )}

          {provider.user_profiles?.phone && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Phone size={20} className="text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Contact Number</div>
                <div className="font-medium text-gray-900">
                  {provider.user_profiles.phone}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Reviews</h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            {showReviewForm && (
              <ReviewForm
                providerId={provider.id}
                onSuccess={() => {
                  setShowReviewForm(false);
                  loadReviews();
                }}
              />
            )}

            <div className="space-y-4 max-h-64 overflow-y-auto">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {review.user_profiles?.full_name}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
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
                ))
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewFormProps {
  providerId: string;
  onSuccess: () => void;
}

function ReviewForm({ providerId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to leave a review');
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          provider_id: providerId,
          consumer_id: user.id,
          rating,
          comment: comment.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          alert('You have already reviewed this provider');
        } else {
          throw error;
        }
      } else {
        alert('Review submitted successfully!');
        setComment('');
        setRating(5);
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="focus:outline-none"
            >
              <Star
                size={24}
                className={value <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your experience..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
