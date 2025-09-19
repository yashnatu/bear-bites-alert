-- Update the profile creation trigger to handle terms_accepted field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert with terms_accepted if column exists, otherwise without it
  BEGIN
    INSERT INTO public.profiles (id, club_email, club_name, terms_accepted)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      false
    );
  EXCEPTION
    WHEN undefined_column THEN
      -- terms_accepted column doesn't exist yet, insert without it
      INSERT INTO public.profiles (id, club_email, club_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
      );
    WHEN others THEN
      -- Log any other error but don't fail the user creation
      RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
