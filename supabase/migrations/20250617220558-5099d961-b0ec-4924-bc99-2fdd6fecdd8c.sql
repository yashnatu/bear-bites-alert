
-- Create a profiles table to store club information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  club_name TEXT NOT NULL,
  club_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a table for food alerts
CREATE TABLE public.food_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES auth.users(id) NOT NULL,
  club_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  available_until TIME NOT NULL,
  building TEXT NOT NULL,
  room TEXT NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS for food_alerts
ALTER TABLE public.food_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for food_alerts
CREATE POLICY "Clubs can view their own alerts" 
  ON public.food_alerts 
  FOR SELECT 
  USING (auth.uid() = club_id);

CREATE POLICY "Clubs can create alerts" 
  ON public.food_alerts 
  FOR INSERT 
  WITH CHECK (auth.uid() = club_id);

CREATE POLICY "Anyone can view active alerts" 
  ON public.food_alerts 
  FOR SELECT 
  USING (expires_at > now());

-- Create a function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, club_name, club_email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'club_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create subscribers table for email notifications
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe) but only view their own
CREATE POLICY "Anyone can subscribe" 
  ON public.subscribers 
  FOR INSERT 
  WITH CHECK (true);
