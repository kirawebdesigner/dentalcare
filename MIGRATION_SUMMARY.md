# DentalCare Migration and Deployment Summary

## Current baseline

The repository contains one canonical fresh-install migration at `supabase/migrations/20251206000000_complete_system_reset.sql`. It creates the `profiles`, `patients`, `services`, `appointments`, `payments`, and `medical_history` tables, adds indexes and integrity triggers, enables row-level security, applies role-based policies, and seeds fictional dental services.

The migration is intentionally destructive because it drops and recreates the six application tables. It must not be applied to an existing project without a verified backup and an explicit decision to reset the data. It does not create a known-password user. The first administrator must be provisioned through Supabase Auth and a matching `profiles` row using a buyer-controlled password.

## Runtime architecture

The frontend uses Supabase email/password authentication and direct table queries protected by RLS. The only server-side provisioning dependency is `supabase/functions/create-staff/index.ts`, which creates staff Auth users using a service-role secret after verifying that the caller is an administrator. The function must be deployed separately and configured with restricted `ALLOWED_ORIGINS`.

## Role coverage

| Role | Status |
|---|---|
| Administrator | Implemented for the current dashboard, staff, services, patients, appointments, and payments screens |
| Doctor | Implemented for assigned appointments and medical-history create/read workflows |
| Receptionist | Implemented for patients, appointments, and payments |
| Accountant | Not implemented |

## Deployment status

Firebase Hosting remains a plausible frontend target through `firebase.json` and `.firebaserc`. The historical deployment at `https://dentalcare-1.web.app/` was reachable during the August 2026 audit but served an older build that displayed a demo-credential panel and a 2024 footer. The project should be rebuilt from the cleaned source with buyer-owned environment variables and redeployed only after the Edge Function is configured.

## Verification status

The repository’s `npm run typecheck`, `npm run lint`, and `npm run build` commands pass after the audit cleanup. Live authenticated workflows, RLS behavior in the buyer’s Supabase project, Edge Function deployment, and production Firebase smoke tests remain deployment-specific verification steps.
