# DentalCare Manual Testing Guide

## Test data policy

Use a buyer-owned Supabase project with fictional staff and patient data. Never use real patient information in a development or demo environment. Do not publish passwords in this guide or commit them to the repository.

## Pre-flight checks

Confirm that `.env` contains the buyer’s Supabase URL and public anon key, the database migration has been reviewed and applied to the intended project, and the `create-staff` Edge Function is deployed with its service-role key stored only in Supabase secrets. Confirm that `ALLOWED_ORIGINS` contains the exact application origin.

Run the repository checks:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

## Authentication tests

Create or invite a synthetic administrator through Supabase Auth, create its matching `profiles` row with the `admin` role, and sign in through the application. Confirm that the loading state resolves, the administrator shell appears, sign-out clears the session, an invalid password displays a generic error, and the page does not display or suggest a default credential.

Repeat login and sign-out using synthetic doctor and receptionist accounts. Confirm that an account with no supported profile role is shown an access-unavailable state rather than receiving a dashboard.

## Administrator tests

Verify that the administrator can view the dashboard, staff list, services, patients, appointments, and payments. Create a synthetic doctor or receptionist through the staff screen and confirm that the record appears in the list. Verify that invalid email input, a short password, a duplicate email, and a failed function deployment produce a bounded error without exposing server internals.

Create and deactivate a service. Confirm that inactive services are not offered for new appointments. Add a fictional patient, search by name and phone, open the patient profile, and verify that the information is displayed correctly.

Book an appointment with a valid patient, doctor, service, date, and time. Confirm that it appears in the appointment list, that supported status filters work, and that completing or cancelling an appointment refreshes the record. Verify that duplicate doctor/date/time slots are rejected by the database constraint.

Record a payment for the correct patient and, optionally, a matching completed appointment. Confirm that the payment appears as pending, that the displayed totals use the generated payment total, and that marking it paid updates the paid timestamp and dashboard totals.

## Doctor tests

Verify that the doctor sees only the doctor navigation items and receives only appointments assigned to that doctor. Confirm that the doctor can create a medical-history record for a patient and view records allowed by the RLS policy. Confirm that the doctor cannot create payments, patients, staff, or services through the UI or direct database requests.

## Receptionist tests

Verify that the receptionist can create and search patients, book appointments, update appointment status, and record or mark payments as paid. Confirm that the receptionist cannot manage staff, services, or medical-history records.

## Responsive and accessibility checks

Test at approximately 320px, 768px, and 1280px viewport widths. Confirm that tables switch to readable mobile cards, forms do not overflow, buttons remain reachable, status text remains legible, the password visibility control has an accessible label, errors are announced, and visible focus rings remain present during keyboard navigation.

## Production smoke test

After Firebase deployment, verify the HTTPS URL, SPA refresh routing, no credential block on the login page, correct page title and metadata, Supabase connection, role navigation, and the staff Edge Function from the deployed origin. Do not use real clinical or financial data during the smoke test.
