/*
  # Dental Clinic Management System - Complete Schema Setup
  
  This SQL file sets up the complete dental clinic management system:
  1. Drops all existing tables and recreates them with proper structure
  2. Creates RLS policies for role-based access control
  3. Seeds sample dental services
  
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
  CONSTRAINT payments_total_nonnegative CHECK (amount - discount + tax >= 0),
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
-- SECTION 3: MAINTAIN DATA INTEGRITY
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER medical_history_set_updated_at
  BEFORE UPDATE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION validate_payment_appointment_patient()
RETURNS trigger AS $$
BEGIN
  IF NEW.appointment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id = NEW.appointment_id
    AND appointments.patient_id = NEW.patient_id
  ) THEN
    RAISE EXCEPTION 'Payment appointment must belong to the selected patient';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_validate_appointment_patient
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION validate_payment_appointment_patient();

-- ============================================================================
-- SECTION 4: CREATE INDEXES FOR PERFORMANCE
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
-- SECTION 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 6: RLS POLICIES
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

-- Profile changes are administrator-managed. There is intentionally no
-- self-update policy, which prevents a user from changing their own role.

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

-- Administrators and receptionists can view the full patient directory.
CREATE POLICY "Admin and receptionist can view patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Doctors can view patients assigned through their appointments.
CREATE POLICY "Doctors can view assigned patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'doctor'
    )
    AND EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.patient_id = patients.id
      AND appointments.doctor_id = auth.uid()
    )
  );

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

-- Administrators and receptionists can view the full appointment schedule.
CREATE POLICY "Admin and receptionist can view appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Doctors can view only appointments assigned to them.
CREATE POLICY "Doctors can view assigned appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid() AND is_doctor_or_admin());

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

-- Administrators and receptionists can update the appointment schedule.
CREATE POLICY "Admin and receptionist can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'receptionist')
    )
  );

-- Doctors may update records assigned to them, but cannot reassign the doctor.
CREATE POLICY "Doctors can update assigned appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid() AND is_doctor_or_admin())
  WITH CHECK (doctor_id = auth.uid() AND is_doctor_or_admin());

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

-- Administrators can view all medical history. Doctors can view records for
-- patients assigned through their appointments or recorded by themselves.
CREATE POLICY "Doctors and admin can view medical history"
  ON medical_history FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'doctor'
      )
      AND (
        recorded_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM appointments
          WHERE appointments.id = medical_history.appointment_id
          AND appointments.doctor_id = auth.uid()
        )
      )
    )
  );

-- Administrators can create any record. Doctors must be the recorder and have
-- an appointment assignment for the patient.
CREATE POLICY "Doctors and admin can insert medical history"
  ON medical_history FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    OR (
      recorded_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM appointments
        WHERE appointments.patient_id = medical_history.patient_id
        AND appointments.doctor_id = auth.uid()
      )
    )
  );

-- Administrators can update all records. Doctors can update records in their
-- assigned scope and cannot change the recorded_by owner.
CREATE POLICY "Doctors and admin can update medical history"
  ON medical_history FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR (
      recorded_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM appointments
        WHERE appointments.patient_id = medical_history.patient_id
        AND appointments.doctor_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    is_admin()
    OR (
      recorded_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM appointments
        WHERE appointments.patient_id = medical_history.patient_id
        AND appointments.doctor_id = auth.uid()
      )
    )
  );

-- Only admin can delete medical history
CREATE POLICY "Admin can delete medical history"
  ON medical_history FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- SECTION 7: AUTHENTICATION HANDOFF
-- ============================================================================
-- Supabase Auth owns password hashing and account lifecycle.
-- Create the first clinic administrator through the Supabase Dashboard or a
-- separately secured provisioning workflow. Do not store default passwords in
-- migrations or source control.

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
-- Check that an administrator profile exists after provisioning:
SELECT id, email, full_name, role
FROM profiles
WHERE role = 'admin';

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
