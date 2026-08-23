-- DentalCare fictional demo data
-- Run only in a buyer-owned demo Supabase project after the schema migration
-- and synthetic Auth/profile accounts have been created.
-- This file contains no real patient information and no passwords.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Create a demo administrator profile before loading demo data';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'doctor') THEN
    RAISE EXCEPTION 'Create a demo doctor profile before loading demo data';
  END IF;
END $$;

INSERT INTO patients (id, full_name, phone, email, date_of_birth, gender, address, emergency_contact, emergency_phone, insurance_provider, insurance_number, allergies, notes)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Ava Morgan', '+1 555 010 1001', 'ava.morgan@example.test', '1991-04-12', 'female', '14 Cedar Lane', 'Ethan Morgan', '+1 555 010 1002', 'Northstar Dental Plan', 'DEMO-AVA-001', 'Penicillin', 'Fictional demo patient for routine preventive care.'),
  ('22222222-2222-4222-8222-222222222222', 'Liam Chen', '+1 555 010 2001', 'liam.chen@example.test', '1986-09-28', 'male', '82 Harbor Street', 'Mei Chen', '+1 555 010 2002', 'Blue Horizon', 'DEMO-LIAM-002', NULL, 'Fictional demo patient for restorative treatment.'),
  ('33333333-3333-4333-8333-333333333333', 'Sofia Patel', '+1 555 010 3001', 'sofia.patel@example.test', '1998-02-07', 'female', '6 Orchard Avenue', 'Raj Patel', '+1 555 010 3002', NULL, NULL, NULL, 'Fictional demo patient for cosmetic consultation.'),
  ('44444444-4444-4444-8444-444444444444', 'Noah Williams', '+1 555 010 4001', 'noah.williams@example.test', '1979-11-19', 'male', '203 Maple Court', 'Grace Williams', '+1 555 010 4002', 'Community Smile', 'DEMO-NOAH-004', 'Latex', 'Fictional demo patient for follow-up care.')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  address = EXCLUDED.address,
  emergency_contact = EXCLUDED.emergency_contact,
  emergency_phone = EXCLUDED.emergency_phone,
  insurance_provider = EXCLUDED.insurance_provider,
  insurance_number = EXCLUDED.insurance_number,
  allergies = EXCLUDED.allergies,
  notes = EXCLUDED.notes,
  updated_at = now();

INSERT INTO appointments (id, patient_id, doctor_id, service_id, appointment_date, appointment_time, duration_minutes, status, notes, created_by)
VALUES
  ('55555555-5555-4555-8555-555555555551', '11111111-1111-4111-8111-111111111111', (SELECT id FROM profiles WHERE role = 'doctor' ORDER BY created_at LIMIT 1), (SELECT id FROM services WHERE name = 'Professional Cleaning' LIMIT 1), CURRENT_DATE + 1, '09:00', 45, 'confirmed', 'Fictional demo appointment.', (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1)),
  ('55555555-5555-4555-8555-555555555552', '22222222-2222-4222-8222-222222222222', (SELECT id FROM profiles WHERE role = 'doctor' ORDER BY created_at LIMIT 1), (SELECT id FROM services WHERE name = 'Dental Filling' LIMIT 1), CURRENT_DATE - 3, '11:30', 45, 'completed', 'Fictional completed visit for payment demo.', (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1)),
  ('55555555-5555-4555-8555-555555555553', '33333333-3333-4333-8333-333333333333', (SELECT id FROM profiles WHERE role = 'doctor' ORDER BY created_at LIMIT 1), (SELECT id FROM services WHERE name = 'Teeth Whitening' LIMIT 1), CURRENT_DATE + 4, '14:00', 60, 'scheduled', 'Fictional consultation.', (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1))
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  doctor_id = EXCLUDED.doctor_id,
  service_id = EXCLUDED.service_id,
  appointment_date = EXCLUDED.appointment_date,
  appointment_time = EXCLUDED.appointment_time,
  duration_minutes = EXCLUDED.duration_minutes,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  updated_at = now();

INSERT INTO payments (id, appointment_id, patient_id, amount, discount, tax, status, payment_method, payment_reference, paid_at, notes, created_by)
VALUES
  ('66666666-6666-4666-8666-666666666661', '55555555-5555-4555-8555-555555555552', '22222222-2222-4222-8222-222222222222', 150.00, 0, 0, 'paid', 'card', 'DEMO-PAY-001', now() - interval '2 days', 'Fictional demo payment.', (SELECT id FROM profiles WHERE role = 'receptionist' ORDER BY created_at LIMIT 1)),
  ('66666666-6666-4666-8666-666666666662', '55555555-5555-4555-8555-555555555551', '11111111-1111-4111-8111-111111111111', 120.00, 0, 0, 'pending', 'insurance', 'DEMO-PAY-002', NULL, 'Fictional pending insurance payment.', (SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1))
ON CONFLICT (id) DO UPDATE SET
  appointment_id = EXCLUDED.appointment_id,
  patient_id = EXCLUDED.patient_id,
  amount = EXCLUDED.amount,
  discount = EXCLUDED.discount,
  tax = EXCLUDED.tax,
  status = EXCLUDED.status,
  payment_method = EXCLUDED.payment_method,
  payment_reference = EXCLUDED.payment_reference,
  paid_at = EXCLUDED.paid_at,
  notes = EXCLUDED.notes,
  updated_at = now();

INSERT INTO medical_history (id, patient_id, appointment_id, visit_date, chief_complaint, diagnosis, treatment, prescriptions, tooth_numbers, follow_up_date, follow_up_notes, notes, recorded_by)
VALUES
  ('77777777-7777-4777-8777-777777777771', '22222222-2222-4222-8222-222222222222', '55555555-5555-4555-8555-555555555552', CURRENT_DATE - 3, 'Sensitivity in lower right molar', 'Small occlusal caries', 'Composite restoration completed', 'Use sensitivity toothpaste twice daily', '46', CURRENT_DATE + 14, 'Review bite and sensitivity.', 'Fictional demo clinical record.', (SELECT id FROM profiles WHERE role = 'doctor' ORDER BY created_at LIMIT 1))
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  appointment_id = EXCLUDED.appointment_id,
  visit_date = EXCLUDED.visit_date,
  chief_complaint = EXCLUDED.chief_complaint,
  diagnosis = EXCLUDED.diagnosis,
  treatment = EXCLUDED.treatment,
  prescriptions = EXCLUDED.prescriptions,
  tooth_numbers = EXCLUDED.tooth_numbers,
  follow_up_date = EXCLUDED.follow_up_date,
  follow_up_notes = EXCLUDED.follow_up_notes,
  notes = EXCLUDED.notes,
  recorded_by = EXCLUDED.recorded_by,
  updated_at = now();
