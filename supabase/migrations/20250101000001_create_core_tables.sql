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

-- Enable RLS on all tables
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers (admin only for now, or you can make it public readable)
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

-- Create indexes for performance
CREATE INDEX idx_food_alerts_expires_at ON food_alerts(expires_at);
CREATE INDEX idx_food_alerts_created_at ON food_alerts(created_at);
CREATE INDEX idx_food_alerts_club_id ON food_alerts(club_id);
CREATE INDEX idx_subscribers_email ON subscribers(email);
