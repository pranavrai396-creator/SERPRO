/*
  # Service Platform Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text) - either 'consumer' or 'provider'
      - `full_name` (text)
      - `phone` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `service_categories`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., 'Plumber', 'Electrician', 'Carpenter'
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `provider_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `bio` (text)
      - `experience_years` (integer)
      - `hourly_rate` (numeric)
      - `pincode` (text)
      - `address` (text)
      - `is_verified` (boolean)
      - `average_rating` (numeric)
      - `total_reviews` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `provider_services`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, references provider_profiles)
      - `category_id` (uuid, references service_categories)
      - `created_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, references provider_profiles)
      - `consumer_id` (uuid, references user_profiles)
      - `rating` (integer) - 1 to 5
      - `comment` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read their own profile
    - Users can update their own profile
    - Providers can manage their own provider profile and services
    - Consumers can read all verified provider profiles
    - Consumers can create reviews for providers
    - Anyone can read service categories
    - Reviews are readable by all authenticated users
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('consumer', 'provider')),
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read service categories"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

-- Provider Profiles Table
CREATE TABLE IF NOT EXISTS provider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bio text,
  experience_years integer DEFAULT 0,
  hourly_rate numeric(10,2) DEFAULT 0,
  pincode text NOT NULL,
  address text,
  is_verified boolean DEFAULT false,
  average_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verified providers"
  ON provider_profiles FOR SELECT
  TO authenticated
  USING (is_verified = true);

CREATE POLICY "Providers can read own profile"
  ON provider_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Providers can insert own profile"
  ON provider_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can update own profile"
  ON provider_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Provider Services Junction Table
CREATE TABLE IF NOT EXISTS provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, category_id)
);

ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read provider services"
  ON provider_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Providers can manage own services"
  ON provider_services FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id IN (
      SELECT id FROM provider_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete own services"
  ON provider_services FOR DELETE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM provider_profiles WHERE user_id = auth.uid()
    )
  );

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  consumer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, consumer_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Consumers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (consumer_id = auth.uid());

CREATE POLICY "Consumers can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (consumer_id = auth.uid())
  WITH CHECK (consumer_id = auth.uid());

CREATE POLICY "Consumers can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (consumer_id = auth.uid());

-- Insert default service categories
INSERT INTO service_categories (name, description) VALUES
  ('Plumber', 'Water supply, drainage, and pipe installation services'),
  ('Electrician', 'Electrical wiring, repairs, and installation services'),
  ('Carpenter', 'Woodwork, furniture making, and repair services'),
  ('Cleaner', 'Home and office cleaning services'),
  ('Painter', 'Interior and exterior painting services'),
  ('AC Technician', 'Air conditioning installation and repair services'),
  ('Appliance Repair', 'Home appliance repair and maintenance'),
  ('Pest Control', 'Pest elimination and prevention services')
ON CONFLICT (name) DO NOTHING;

-- Function to update provider rating after review
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET 
    average_rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    updated_at = now()
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_rating_after_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating();

-- Function to update provider rating after review deletion
CREATE OR REPLACE FUNCTION update_provider_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET 
    average_rating = COALESCE((
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE provider_id = OLD.provider_id
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = OLD.provider_id
    ),
    updated_at = now()
  WHERE id = OLD.provider_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_rating_after_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating_on_delete();