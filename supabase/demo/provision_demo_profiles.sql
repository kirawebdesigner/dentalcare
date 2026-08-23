-- Link synthetic Auth users to DentalCare profiles.
-- Create the users first through Supabase Auth; this SQL contains no passwords.

DO $$
DECLARE
  admin_id uuid;
  doctor_id uuid;
  receptionist_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'demo.admin@example.test';
  SELECT id INTO doctor_id FROM auth.users WHERE email = 'demo.doctor@example.test';
  SELECT id INTO receptionist_id FROM auth.users WHERE email = 'demo.reception@example.test';

  IF admin_id IS NULL OR doctor_id IS NULL OR receptionist_id IS NULL THEN
    RAISE EXCEPTION 'Create all three synthetic Auth users before provisioning demo profiles';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, phone)
  VALUES
    (admin_id, 'demo.admin@example.test', 'Demo Administrator', 'admin', '+1 555 010 9001'),
    (doctor_id, 'demo.doctor@example.test', 'Dr. Jordan Rivera', 'doctor', '+1 555 010 9002'),
    (receptionist_id, 'demo.reception@example.test', 'Taylor Morgan', 'receptionist', '+1 555 010 9003')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = now();
END $$;
