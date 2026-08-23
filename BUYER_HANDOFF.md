# DentalCare Buyer Handoff Package

## Product description

DentalCare is a functional React + TypeScript + Supabase dental clinic-management codebase. It includes authenticated staff access, administrator/doctor/receptionist roles, patient records, appointment scheduling, service management, payments, a dashboard, and doctor medical records.

It is sold as a configurable side-project foundation. It is not represented as certified healthcare software, a HIPAA/GDPR compliance package, a complete EHR, or a production-ready clinical service.

## Included assets

| Asset | Location or status |
|---|---|
| React/Vite source code | Repository `src/` and project configuration |
| Supabase schema and RLS | `supabase/migrations/20251206000000_complete_system_reset.sql` |
| Staff provisioning backend | `supabase/functions/create-staff/index.ts` |
| Fictional demo accounts guide | `supabase/demo/DEMO_ACCOUNTS.md` |
| Fictional demo profile SQL | `supabase/demo/provision_demo_profiles.sql` |
| Fictional demo data SQL | `supabase/demo/seed_demo_data.sql` |
| Firebase Hosting configuration | `firebase.json` and `.firebaserc` |
| Setup and testing documentation | `SETUP_GUIDE.md` and `TESTING_GUIDE.md` |
| Audit and remediation records | `AUDIT_REPORT.md`, `FIXES_APPLIED.md`, and `HISTORY_REMEDIATION.md` |

## Ownership transfer checklist

Transfer the repository, Firebase project, Supabase project, domain or hosting settings if included, and any deployment credentials through the buyer’s approved secure process. Do not place credentials in GitHub issues, documentation, chat transcripts, or the repository. State clearly whether the historical Firebase project and Supabase project are included or whether the buyer must deploy fresh projects.

If the buyer receives the existing projects, rotate all credentials, review Auth users, remove any real or unwanted data, confirm backups, and inspect project billing and access members. If the buyer deploys fresh projects, keep the existing production projects unchanged until the buyer has completed a successful smoke test.

## Fresh Supabase setup

Create the buyer’s Supabase project, review the destructive migration, back up any existing database, and apply the migration only to a fresh or intentionally reset database. Create the first administrator through Supabase Auth using a buyer-controlled password, then insert the matching `profiles` row with role `admin` through a secured SQL Editor or provisioning process.

Deploy the Edge Function and configure its server-side secrets:

```bash
supabase functions deploy create-staff --project-ref <buyer-project-ref>
supabase secrets set \
  SUPABASE_URL=<buyer-supabase-url> \
  SUPABASE_ANON_KEY=<buyer-anon-key> \
  SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key> \
  ALLOWED_ORIGINS=https://<buyer-hostname>
```

Do not replace the placeholders above with real values in this repository. The service-role key must remain in Supabase server-side secrets.

## Demo setup

For a dedicated demo project, create the three synthetic Auth users described in `supabase/demo/DEMO_ACCOUNTS.md`, choose passwords privately, run `provision_demo_profiles.sql`, and then run `seed_demo_data.sql`. The seed file contains only fictional identities and sample clinical/financial records. Remove the demo project or demo data before transferring ownership unless the buyer explicitly wants it included.

## Firebase deployment

Set the buyer’s public frontend variables in the build environment or local `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then run:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
firebase use <buyer-firebase-project>
firebase deploy --only hosting
```

The Firebase Hosting configuration serves `dist/`, rewrites SPA routes to `index.html`, and adds low-risk security headers. After deployment, confirm that the security headers appear on the buyer’s public HTTPS origin and that the Edge Function `ALLOWED_ORIGINS` matches that exact origin.

## Buyer smoke test

Use a clean browser session and synthetic data. Verify that the login page does not show default credentials, the app title and footer are current, the Supabase connection succeeds, SPA refreshes work, and sign-out clears the session. Verify administrator staff creation, patient creation/search, appointment booking/status changes, payment recording/mark-paid, doctor assignment visibility, and medical-record creation. Confirm that doctor, receptionist, and unsupported-role access matches the documented role matrix.

## Explicit exclusions and limitations

The current package does not include an accountant role, staff edit/disable/delete/reset-password screens, patient edit/delete screens, service edit/delete screens, refunds or partial-payment workflows, complete medical-record editing, reporting, settings, notifications, audit logs, formal compliance certification, legal privacy documentation, or a guarantee of production readiness.

## Final acceptance record

Before the sale is marked complete, record the buyer’s accepted commit or archive, the Firebase and Supabase project ownership status, the successful smoke-test date, the person who verified RLS, and the exact list of included services and support. Keep the acceptance record separate from secrets.
