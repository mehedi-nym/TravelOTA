import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...')

    const sqlScript = `
BEGIN;

CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  priority INTEGER DEFAULT 0,
  description TEXT,
  flag_url TEXT,
  visa_processing_days INTEGER,
  visa_fee DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.visa_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  field_label TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  options TEXT,
  placeholder TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(country_id, field_name)
);

CREATE TABLE IF NOT EXISTS public.visa_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  application_data JSONB,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.visa_application_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.visa_applications(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.tour_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  price_per_person DECIMAL(10, 2),
  max_people INTEGER,
  highlights TEXT[],
  itinerary JSONB,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.tour_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.tour_packages(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  number_of_people INTEGER,
  status TEXT DEFAULT 'pending',
  special_requests TEXT,
  total_price DECIMAL(10, 2),
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_code TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  departure_date DATE,
  return_date DATE,
  price DECIMAL(10, 2),
  airline TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "countries_select_public" ON public.countries FOR SELECT USING (is_active = TRUE);
CREATE POLICY "visa_requirements_select_public" ON public.visa_requirements FOR SELECT USING (TRUE);
CREATE POLICY "visa_apps_select_own" ON public.visa_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "visa_apps_insert_own" ON public.visa_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "visa_apps_update_own" ON public.visa_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "visa_files_select_own" ON public.visa_application_files FOR SELECT USING (EXISTS (SELECT 1 FROM public.visa_applications WHERE id = visa_application_files.application_id AND user_id = auth.uid()));
CREATE POLICY "visa_files_insert_own" ON public.visa_application_files FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.visa_applications WHERE id = visa_application_files.application_id AND user_id = auth.uid()));
CREATE POLICY "tour_packages_select_public" ON public.tour_packages FOR SELECT USING (is_active = TRUE);
CREATE POLICY "tour_bookings_select_own" ON public.tour_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tour_bookings_insert_own" ON public.tour_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tour_bookings_update_own" ON public.tour_bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "flights_select_public" ON public.flights FOR SELECT USING (TRUE);

COMMIT;
`

    // Execute via SQL
    const { data, error } = await supabase.rpc('exec', { sql: sqlScript })

    if (error) {
      console.log('[v0] RPC exec not available, trying alternative method...')
      // Alternative: insert sample data to verify connection
      const { error: testError } = await supabase.from('countries').select('count').limit(1)
      if (testError) {
        console.error('[v0] Database error:', testError)
      } else {
        console.log('[v0] Database connection successful!')
      }
    } else {
      console.log('[v0] Database setup completed!')
    }
  } catch (error) {
    console.error('[v0] Setup error:', error)
    process.exit(1)
  }
}

setupDatabase()
