# DentalCare Audit Baseline

## Scope

This baseline covers the repository cloned from `kirawebdesigner/dentalcare` and the attached buyer-readiness brief. The goal is to restore, verify, secure, polish, document, and prepare the existing product for sale without rebuilding it.

## Verified project shape

- React 18 + TypeScript + Vite 5 frontend.
- Tailwind CSS 3 styling.
- Supabase client-side authentication and database access.
- Supabase SQL migration under `supabase/migrations/`.
- Supabase Edge Function under `supabase/functions/create-staff/`.
- Firebase Hosting configuration serving `dist/` with SPA fallback.
- Core areas present: login, role-based shell, dashboard, staff, services, patients, appointments, payments, and medical history.
- No accountant role is present in the type model, migration role constraint, Edge Function, navigation, or UI.

## Baseline verification

- `npm ci`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed, but emits a CSS warning because the Google Fonts `@import` follows Tailwind statements.
- `npm run lint`: failed before linting due to an ESLint/@typescript-eslint compatibility error involving `no-unused-expressions`; this is a tooling/configuration issue that must be repaired.

## High-priority findings

1. The frontend contains hard-coded Supabase fallback configuration. Missing environment variables do not stop the app from initializing against the embedded project configuration. This is unsafe for a buyer handoff and can cause accidental use of the wrong backend.
2. The login screen publishes a default demo email and password. The migration and multiple handoff documents also contain the same default credential. These must be removed from runtime UI and documentation; the migration must not reset a live admin password to a known value.
3. Staff creation uses the deployed `create-staff` Edge Function, while the migration and documentation describe an RPC-based architecture. The Edge Function requires a server-side service-role secret and deployment, so the documented setup is inconsistent with the real runtime dependency.
4. The Edge Function uses permissive `Access-Control-Allow-Origin: *` and returns raw internal error messages. CORS should be restricted to configured origins and errors should be sanitized for clients.
5. Role coverage is limited to admin, doctor, and receptionist. The attached brief mentions accountant as an intended role, but there is no accountant implementation. This must be documented as missing rather than implied as supported.
6. Appointment filtering for doctors happens after a broad database read. RLS is the real security boundary, but the frontend should avoid requesting unrelated records and should make the intended scope explicit.
7. Appointment, patient, service, payment, and medical-history screens provide partial CRUD rather than complete management workflows. Several schema fields and supported statuses are not represented in the UI.
8. Payment workflows use `amount` rather than the schema’s generated `total`, and the payment form does not verify that an optional appointment belongs to the selected patient.
9. Dashboard activity is not actually sorted by timestamp despite the comment, and its trend percentages are hard-coded rather than computed.
10. Buyer-facing documentation overstates readiness, repeats backend identifiers and credentials, contains stale architecture claims, and includes a destructive reset migration as the default setup path.
11. The HTML shell lacks a meta description and social/robots metadata. This is a lower-priority readiness issue for an authenticated internal product.
12. Multiple destructive or error-prone actions use browser `alert()` and raw error messages instead of consistent inline feedback.

## Initial buyer-readiness assessment

The product is a functional prototype with a usable core happy path, but it is not yet buyer-ready as documented. The largest blockers are secret/credential exposure, backend/deployment inconsistency, broken lint verification, incomplete role/CRUD coverage, and handoff documentation that is not trustworthy. A small, focused cleanup can materially improve sale readiness, but full production readiness would still require live Supabase verification, deployed Edge Function verification, and a formal security/privacy review.
