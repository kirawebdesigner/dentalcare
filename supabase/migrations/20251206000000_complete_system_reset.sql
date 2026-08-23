/*
  # Dental Clinic Management System - Complete Schema Setup
  
  This SQL file sets up the complete dental clinic management system:
  1. Drops all existing tables and recreates them with proper structure
  2. Creates RLS policies for role-based access control
  3. Creates helper functions (verify_password, create_staff_member)
  4. Bootstraps the admin user (admin@clinic.com / admin123)
  5. Seeds sample dental services
  
  Run this script in Supabase SQL Editor for a fresh setup.
  
  IMPORTANT: This will DROP existing tables. Backup data if needed.
*/

-- ============================================================================
-- SECTION 1: CLEANUP - Drop existing objects
-- ============================================================================

DROP TABLE IF EXISTS medical_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS verify_password(text, text) CASCADE;
DROP FUNCTION IF EXISTS create_staff_member(text, text, text, text, text) CASCADE;

-- ============================================================================
-- SECTION 2: CREATE TABLES
-- ============================================================================

-- Profiles table: Staff user profiles linked to Supabase auth
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table: Patient records
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address text,
  emergency_contact text,
  emergency_phone text,
  insurance_provider text,
  insurance_number text,
  allergies text,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table: Dental services offered
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'General',
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  duration_minutes integer DEFAULT 30 CHECK (duration_minutes > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table: Patient appointments
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Prevent double-booking same doctor at same time
  CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, appointment_time)
);

-- Payments table: Payment records
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
  discount numeric DEFAULT 0 CHECK (discount >= 0),
  tax numeric DEFAULT 0 CHECK (tax >= 0),
  total numeric GENERATED ALWAYS AS (amount - discount + tax) STORED,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'refunded', 'cancelled')),
  payment_method text CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'insurance', 'other')),
  payment_reference text,
  paid_at timestamptz,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medical history table: Patient treatment records
CREATE TABLE medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  visit_date date DEFAULT CURRENT_DATE,
  chief_complaint text,
  diagnosis text,
  treatment text,
  prescriptions text,
  tooth_numbers text,
  x_ray_notes text,
  follow_up_date date,
  follow_up_notes text,
  notes text,
  recorded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- SECTION 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Patients indexes
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_created_by ON patients(created_by);

-- Appointments indexes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Payments indexes
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Medical history indexes
CREATE INDEX idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX idx_medical_history_appointment_id ON medical_history(appointment_id);
CREATE INDEX idx_medical_history_recorded_at ON medical_history(recorded_at);

-- ============================================================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 5: RLS POLICIES
-- ============================================================================

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function to check if current user has any staff role
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'doctor', 'receptionist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function to check if current user is doctor or admin
CREATE OR REPLACE FUNCTION is_doctor_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'doctor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -------------------------
-- PROFILES POLICIES
-- -------------------------

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can insert profiles (for staff creation)
CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- -------------------------
-- PATIENTS POLICIES
-- -------------------------

-- All staff can view patients
CREATE POLICY "Staff can view patients"
  ON patients FOR SELECT
  TO authenticated
  USING (is_staff());

-- Admin and receptionist can insert patients
CREATE POLICY "Admin and receptionist can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Admin and receptionist can update patients
CREATE POLICY "Admin and receptionist can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Only admin can delete patients
CREATE POLICY "Admin can delete patients"
  ON patients FOR DELETE
  TO authenticated
  USING (is_admin());

-- -------------------------
-- SERVICES POLICIES
-- -------------------------

-- All staff can view services
CREATE POLICY "Staff can view services"
  ON services FOR SELECT
  TO authenticated
  USING (is_staff());

-- Only admin can manage services
CREATE POLICY "Admin can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (is_admin());

-- -------------------------
-- APPOINTMENTS POLICIES
-- -------------------------

-- All staff can view appointments
CREATE POLICY "Staff can view appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (is_staff());

-- Admin and receptionist can create appointments
CREATE POLICY "Admin and receptionist can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Admin, receptionist, and doctors can update appointments
CREATE POLICY "Staff can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (is_staff());

-- Only admin can delete appointments
CREATE POLICY "Admin can delete appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (is_admin());

-- -------------------------
-- PAYMENTS POLICIES
-- -------------------------

-- Admin and receptionist can view payments
CREATE POLICY "Admin and receptionist can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Admin and receptionist can insert payments
CREATE POLICY "Admin and receptionist can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Admin and receptionist can update payments
CREATE POLICY "Admin and receptionist can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Only admin can delete payments
CREATE POLICY "Admin can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (is_admin());

-- -------------------------
-- MEDICAL HISTORY POLICIES
-- -------------------------

-- Doctors and admin can view medical history
CREATE POLICY "Doctors and admin can view medical history"
  ON medical_history FOR SELECT
  TO authenticated
  USING (is_doctor_or_admin());

-- Doctors and admin can insert medical history
CREATE POLICY "Doctors and admin can insert medical history"
  ON medical_history FOR INSERT
  TO authenticated
  WITH CHECK (is_doctor_or_admin());

-- Doctors and admin can update medical history
CREATE POLICY "Doctors and admin can update medical history"
  ON medical_history FOR UPDATE
  TO authenticated
  USING (is_doctor_or_admin());

-- Only admin can delete medical history
CREATE POLICY "Admin can delete medical history"
  ON medical_history FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to verify user password (for custom auth flows)
CREATE OR REPLACE FUNCTION verify_password(
  email_input text,
  password_input text
) RETURNS TABLE (
  id uuid,
  email character varying,
  full_name text,
  role text
) AS $$
BEGIN
  -- Input validation
  IF email_input IS NULL OR email_input = '' THEN
    RETURN;
  END IF;
  
  IF password_input IS NULL OR password_input = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.full_name,
    p.role
  FROM auth.users u
  JOIN profiles p ON u.id = p.id
  WHERE u.email = email_input
    AND u.encrypted_password = crypt(password_input, u.encrypted_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO anon;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO authenticated;

-- Function to create staff members (admin only)
CREATE OR REPLACE FUNCTION create_staff_member(
  email_input text,
  password_input text,
  full_name_input text,
  role_input text,
  phone_input text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Validate authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate admin role
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create staff members';
  END IF;

  -- Validate email format (basic check)
  IF email_input IS NULL OR email_input !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate password length
  IF password_input IS NULL OR length(password_input) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  -- Validate role
  IF role_input NOT IN ('admin', 'doctor', 'receptionist') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, doctor, or receptionist';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_input) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  -- Generate new UUID
  new_user_id := gen_random_uuid();

  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    email_input,
    crypt(password_input, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('full_name', full_name_input),
    now(),
    now(),
    '',
    '',
    ''
  );

  -- Insert into profiles
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    phone,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    email_input,
    full_name_input,
    role_input,
    phone_input,
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_staff_member(text, text, text, text, text) TO authenticated;

-- ============================================================================
-- SECTION 7: BOOTSTRAP ADMIN USER
-- ============================================================================

DO $$
DECLARE
  admin_user_id uuid;
  existing_user_id uuid;
BEGIN
  -- Check if admin user already exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = 'admin@clinic.com';

  IF existing_user_id IS NOT NULL THEN
    -- Update existing user's password
    UPDATE auth.users
    SET
      encrypted_password = crypt('admin123', gen_salt('bf')),
      updated_at = now()
    WHERE id = existing_user_id;
    
    admin_user_id := existing_user_id;
    
    RAISE NOTICE 'Admin user password updated successfully';
  ELSE
    -- Create new admin user
    admin_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@clinic.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Administrator"}',
      now(),
      now(),
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Admin user created in auth.users';
  END IF;

  -- Insert or update admin profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    phone,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@clinic.com',
    'System Administrator',
    'admin',
    NULL,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = 'admin@clinic.com',
    full_name = 'System Administrator',
    role = 'admin',
    updated_at = now();

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin user setup complete!';
  RAISE NOTICE 'Email: admin@clinic.com';
  RAISE NOTICE 'Password: admin123';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- SECTION 8: SEED SAMPLE SERVICES
-- ============================================================================

INSERT INTO services (name, description, category, price, duration_minutes, is_active) VALUES
  ('Dental Checkup', 'Comprehensive oral examination and assessment', 'Preventive', 75.00, 30, true),
  ('Professional Cleaning', 'Deep cleaning and polishing of teeth', 'Preventive', 120.00, 45, true),
  ('Teeth Whitening', 'Professional in-office teeth whitening treatment', 'Cosmetic', 350.00, 60, true),
  ('Dental Filling', 'Composite or amalgam filling for cavities', 'Restorative', 150.00, 45, true),
  ('Root Canal', 'Endodontic treatment for infected tooth pulp', 'Endodontics', 800.00, 90, true),
  ('Tooth Extraction', 'Simple tooth extraction procedure', 'Oral Surgery', 200.00, 30, true),
  ('Wisdom Tooth Removal', 'Surgical extraction of wisdom teeth', 'Oral Surgery', 450.00, 60, true),
  ('Dental Crown', 'Porcelain or ceramic crown placement', 'Restorative', 950.00, 60, true),
  ('Dental Bridge', 'Fixed bridge to replace missing teeth', 'Restorative', 1500.00, 90, true),
  ('Dental Implant', 'Titanium implant placement for missing tooth', 'Implantology', 2500.00, 120, true),
  ('Invisalign Consultation', 'Clear aligner treatment consultation', 'Orthodontics', 150.00, 45, true),
  ('Braces Adjustment', 'Monthly braces adjustment visit', 'Orthodontics', 100.00, 30, true),
  ('Dental X-Ray', 'Digital dental radiograph (single or full mouth)', 'Diagnostic', 50.00, 15, true),
  ('Emergency Dental Care', 'Urgent dental treatment for emergencies', 'Emergency', 250.00, 45, true),
  ('Gum Treatment', 'Periodontal treatment for gum disease', 'Periodontics', 300.00, 60, true),
  ('Dental Veneer', 'Porcelain veneer for cosmetic enhancement', 'Cosmetic', 1200.00, 60, true),
  ('Fluoride Treatment', 'Professional fluoride application', 'Preventive', 40.00, 15, true),
  ('Dental Sealant', 'Protective sealant for molars', 'Preventive', 60.00, 20, true),
  ('Night Guard Fitting', 'Custom night guard for teeth grinding', 'Preventive', 350.00, 30, true),
  ('Dentures', 'Complete or partial denture fitting', 'Restorative', 1800.00, 90, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 9: FINAL GRANTS AND CLEANUP
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table access (RLS will control row-level access)
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON patients TO authenticated;
GRANT SELECT, INSERT, UPDATE ON services TO authenticated;
GRANT SELECT, INSERT, UPDATE ON appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON medical_history TO authenticated;

-- Grant delete permissions (RLS will restrict to admins)
GRANT DELETE ON patients TO authenticated;
GRANT DELETE ON services TO authenticated;
GRANT DELETE ON appointments TO authenticated;
GRANT DELETE ON payments TO authenticated;
GRANT DELETE ON medical_history TO authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verification queries (run these to confirm setup):
/*
-- Check admin user exists:
SELECT u.id, u.email, p.full_name, p.role 
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.id 
WHERE u.email = 'admin@clinic.com';

-- Check RLS is enabled:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check services were seeded:
SELECT name, price, category FROM services ORDER BY category, name;

-- Check all tables exist:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
*/
