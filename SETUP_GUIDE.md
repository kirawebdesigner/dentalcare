# DentalCare Setup and Buyer Handoff Guide

## Before installation

DentalCare is an authenticated clinic-management prototype with Supabase as its backend and Firebase Hosting as one supported frontend deployment target. It should be installed into a buyer-owned Supabase project and Firebase project. Do not reuse the historical project or deployment without first confirming ownership, access, backups, and data-retention responsibilities.

## Environment variables

Create `.env` in the project root. Start from `.env.example` and replace the placeholders with the buyer’s Supabase project values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The frontend only needs the Supabase URL and public anon key. Never put `SUPABASE_SERVICE_ROLE_KEY` in `.env`, Vite variables, source control, or Firebase Hosting configuration.

## Database setup

Review `supabase/migrations/20251206000000_complete_system_reset.sql` before applying it. It creates the existing tables, indexes, role policies, grants, and fictional sample services. It contains destructive `DROP TABLE` statements and is suitable only for a fresh or intentionally reset project. Back up any existing data before running it.

The migration does not create a known-password administrator. After the schema is installed, create the first user through Supabase Auth, confirm the account through the buyer’s chosen process, and create a matching `profiles` row with the `admin` role. Use a unique password managed by the buyer. Then use the in-app staff screen to create additional accounts.

## Edge Function setup

Deploy `supabase/functions/create-staff/index.ts` as the `create-staff` function. Configure these server-side secrets in Supabase:

| Secret | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public client key used to validate the caller’s session |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used to provision Auth users |
| `ALLOWED_ORIGINS` | Exact comma-separated frontend origins allowed by CORS |

For local development, `ALLOWED_ORIGINS` may include `http://localhost:5173,http://localhost:4173`. For production, use the exact HTTPS Firebase Hosting origin and any approved custom domain. Do not use a wildcard origin.

## Local development

```bash
npm ci
npm run dev
```

The local app is available at `http://localhost:5173`. If the login page reports that Supabase is not configured, confirm the `.env` filename, variable names, and development-server restart.

## Verification

Run the following before every handoff:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

Verify the following workflows with synthetic accounts and fictional data: administrator login and sign-out; administrator staff creation; patient creation and search; appointment booking and status changes; payment recording and marking a payment paid; doctor access to assigned appointments; doctor medical-record creation; and denial of unsupported or unauthorized role access.

## Implemented roles

| Role | Supported access |
|---|---|
| Administrator | Dashboard, staff creation/listing, services, patients, appointments, and payments |
| Doctor | Assigned appointments and medical-history create/read workflow |
| Receptionist | Patients, appointments, and payments |
| Accountant | Not implemented; do not advertise or provision this role |

The frontend hides navigation items, but Supabase RLS remains the security boundary. Review the policies with the buyer before handling real clinical or financial information.

## Firebase Hosting deployment

Build the site with the buyer’s environment variables, then deploy the `dist/` directory using the buyer-owned Firebase project configured in `.firebaserc`. The historical deployment at [dentalcare-1.web.app](https://dentalcare-1.web.app/) was reachable during the audit but served an older build with known demo credentials and an outdated footer. Treat it as a deployment reference, not as a verified production release.

After deployment, use a private browser window to confirm that the current login page no longer publishes demo credentials, the footer/version matches the repository, the Supabase connection works, SPA refreshes resolve correctly, and the deployed `create-staff` function accepts requests only from configured origins.

## Buyer handoff checklist

Provide the buyer with the repository, ownership and access-transfer details for Firebase and Supabase, the environment-variable template, the migration review notes, Edge Function deployment instructions, the manual testing checklist, and the known limitations. Remove all test accounts and synthetic data unless explicitly included as demo data. Confirm that no real patient data, service-role key, or known default password is included in the handoff.

Last reviewed: August 2026. This guide describes the current source tree and should be updated whenever the database schema, roles, deployment target, or provisioning flow changes.
