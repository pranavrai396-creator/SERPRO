import { Search, Shield, Star, MapPin, Clock, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Find Trusted Service Providers
              <span className="text-blue-600"> Near You</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect instantly with verified professionals for all your home service needs.
              No delays, no uncertainty — just quality service at your fingertips.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Search size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Simply enter your pincode and select the service you need. Find qualified
                professionals in seconds.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Shield size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                All service providers are thoroughly verified and authenticated for your
                safety and peace of mind.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Star size={28} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ratings & Reviews</h3>
              <p className="text-gray-600 leading-relaxed">
                Make informed decisions with transparent ratings and honest reviews from
                real customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to connect with professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Service</h3>
              <p className="text-gray-600">
                Select from plumbers, electricians, carpenters, cleaners, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enter Your Location</h3>
              <p className="text-gray-600">
                Provide your pincode to find verified professionals in your area.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect Instantly</h3>
              <p className="text-gray-600">
                View profiles, check ratings, and contact the right professional immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-lg text-gray-600">The smart way to find home service professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <MapPin size={32} className="text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Location-Based</h3>
              <p className="text-gray-600 text-sm">
                Find professionals near you for faster service and better availability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <Shield size={32} className="text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">100% Verified</h3>
              <p className="text-gray-600 text-sm">
                Every provider is authenticated and verified before joining the platform.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <Clock size={32} className="text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600 text-sm">
                No waiting or posting jobs. Get immediate access to available professionals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <TrendingUp size={32} className="text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 text-sm">
                See hourly rates upfront and make informed decisions about service costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find the Perfect Professional?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust ServiceConnect for their home service needs.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 ServiceConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
