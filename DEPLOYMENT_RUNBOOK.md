# DentalCare Redeployment Runbook

This runbook redeploys the cleaned repository to buyer-owned services. It does not contain or request credentials in source control.

## 1. Verify the repository

```bash
git clone https://github.com/kirawebdesigner/dentalcare.git
cd dentalcare
npm ci
npm run typecheck
npm run lint
npm run build
```

The build must complete before any deployment. The generated `dist/` directory is the Firebase Hosting artifact.

## 2. Configure Supabase

Create or select the buyer-owned Supabase project. Review `supabase/migrations/20251206000000_complete_system_reset.sql`; it is a destructive fresh-install/reset migration. Back up existing data and apply it only when the reset decision is explicit.

Create the first administrator through Supabase Auth with a buyer-controlled password, then create the matching `profiles` row with role `admin`. Create synthetic doctor and receptionist users for demo verification. Never store their passwords in Git.

Deploy and configure staff provisioning:

```bash
supabase functions deploy create-staff --project-ref <buyer-project-ref>
supabase secrets set \
  SUPABASE_URL=<buyer-supabase-url> \
  SUPABASE_ANON_KEY=<buyer-anon-key> \
  SUPABASE_SERVICE_ROLE_KEY=<server-only-key> \
  ALLOWED_ORIGINS=https://<buyer-hostname>
```

The `SUPABASE_SERVICE_ROLE_KEY` is server-only. Confirm that the function returns a bounded error for unauthenticated, non-admin, malformed, and invalid-origin requests.

## 3. Configure Firebase

Authenticate with the buyer’s Firebase account and select the buyer-owned project configured in `.firebaserc` or replace the project binding before deployment:

```bash
firebase login
firebase use <buyer-firebase-project>
```

Provide the public frontend variables to the build environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then build and deploy:

```bash
npm run typecheck
npm run lint
npm run build
firebase deploy --only hosting
```

## 4. Production smoke test

Open the deployed HTTPS origin in a clean browser. Confirm that the title and footer are current, no demo credentials are displayed, the configuration warning is absent, SPA refreshes work, and security headers include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.

Sign in with the synthetic administrator and verify staff creation, services, patients, appointments, payments, and dashboard totals. Sign in with the synthetic doctor and confirm that only assigned appointments and permitted medical records are visible. Sign in with the synthetic receptionist and confirm patient, appointment, and payment workflows. Remove demo accounts/data or explicitly include them in the buyer transfer.

## 5. Rollback

If the deployment fails, do not change database data blindly. Keep the last known-good Firebase build available, inspect the Firebase release history, and restore the previous hosting version if required. For database issues, use the buyer’s verified backup and Supabase recovery process. Record the failed release and do not transfer an unverified deployment.
