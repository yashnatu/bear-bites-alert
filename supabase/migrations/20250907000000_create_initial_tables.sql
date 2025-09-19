-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  club_name TEXT NOT NULL DEFAULT '',
  club_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create food_alerts table
CREATE TABLE IF NOT EXISTS food_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  club_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  available_until TEXT NOT NULL,
  building TEXT NOT NULL,
  room TEXT NOT NULL,
  additional_info TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for subscribers
CREATE POLICY "Anyone can read subscribers" ON subscribers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert subscribers" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Create policies for food_alerts
CREATE POLICY "Anyone can read food_alerts" ON food_alerts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own food_alerts" ON food_alerts
  FOR INSERT WITH CHECK (auth.uid() = club_id);

CREATE POLICY "Users can update own food_alerts" ON food_alerts
  FOR UPDATE USING (auth.uid() = club_id);

CREATE POLICY "Users can delete own food_alerts" ON food_alerts
  FOR DELETE USING (auth.uid() = club_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, club_email, club_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_alerts_expires_at ON food_alerts(expires_at);
CREATE INDEX IF NOT EXISTS idx_food_alerts_created_at ON food_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_food_alerts_club_id ON food_alerts(club_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
