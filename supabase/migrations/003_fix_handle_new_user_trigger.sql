-- Fix: handle_new_user trigger was crashing when a user already existed
-- in profiles (e.g. signed up with email, then tried Google OAuth).
-- The INSERT would hit a PRIMARY KEY conflict and cause a 500 on Supabase's
-- auth callback, breaking all sign-in/sign-up flows.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = ''
      THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
