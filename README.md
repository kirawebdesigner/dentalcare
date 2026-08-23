# DentalCare Practice Management System

DentalCare is a role-based internal web application for small dental clinics. The current implementation provides authenticated staff access to patient records, appointment scheduling, service catalog management, payment tracking, and doctor-facing medical history. It is an existing React/Supabase product that has been cleaned up for evaluation and handoff; it is not presented as a certified electronic health record or a substitute for a clinic’s legal, privacy, or security review.

## Current product scope

| Area | Current implementation | Important limitation |
|---|---|---|
| Authentication | Supabase email/password authentication with session refresh | Account provisioning and password recovery must be configured in Supabase |
| Admin | Dashboard, staff creation/listing, services, patients, appointments, payments | Staff edit, disable, delete, and password-reset workflows are not included |
| Doctor | Assigned appointment view and medical-history create/read workflow | Medical-history edit/delete and richer clinical fields are not fully exposed in the UI |
| Receptionist | Patient creation/listing, appointment booking/status updates, payment recording | Patient edit/delete and advanced scheduling workflows are not included |
| Accountant | Not implemented | Do not advertise this role until the data model, policies, navigation, and workflows are added |
| Backend | Supabase PostgreSQL, RLS policies, and a staff-provisioning Edge Function | The backend must be deployed and tested in the buyer’s Supabase project |
| Deployment | Firebase Hosting configuration is included | The historical Firebase site is an older build and must be redeployed after cleanup |

The database schema contains additional fields and statuses beyond the current screens. The source of truth for runtime permissions is the RLS policy set in `supabase/migrations/20251206000000_complete_system_reset.sql`; frontend visibility is only a usability layer and must not be treated as the security boundary.

## Technology stack

The project uses React 18, TypeScript, Vite 5, Tailwind CSS 3, Supabase JS, and Lucide React. Firebase Hosting serves the Vite `dist/` output with a single-page-application fallback. Staff account creation uses `supabase/functions/create-staff/index.ts`, which requires the Supabase Edge Function runtime and a server-side service-role secret.

## Local setup

Use Node.js 18 or newer and npm. Install dependencies with `npm ci`, then create a local `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env`, service-role keys, passwords, patient data, or real clinic credentials. The frontend intentionally does not contain a fallback project URL or anon key. If the variables are missing, the application will show a configuration/connection error instead of silently connecting to an embedded backend.

For a new Supabase project, review the migration before applying it. The current migration creates the existing tables, indexes, RLS policies, and sample services. It intentionally does not create a default administrator or store a default password. Provision the first administrator through the Supabase Dashboard or a separately secured provisioning process, then create the corresponding `profiles` row with the `admin` role.

Start the local app with:

```bash
npm run dev
```

The default local URL is `http://localhost:5173`.

## Verification commands

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

`npm run lint` uses the pinned TypeScript/ESLint toolchain in the lockfile. Run all three checks before handoff. The build output is created in `dist/`.

## Supabase Edge Function deployment

The staff-creation function must be deployed separately from the frontend. Configure the function with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ALLOWED_ORIGINS`. `ALLOWED_ORIGINS` should contain the exact HTTPS origin(s) that host the application, separated by commas; local development may use `http://localhost:5173,http://localhost:4173`.

The service-role key must remain in Supabase server-side secrets and must never be placed in Vite variables, source files, documentation, or Firebase Hosting configuration. The function restricts staff creation to authenticated administrators and supports only the three implemented roles: `admin`, `doctor`, and `receptionist`.

## Deployment

The repository includes Firebase Hosting configuration for the historical site at [dentalcare-1.web.app](https://dentalcare-1.web.app/). That live site was reachable during the audit but displayed an older build with a demo-credential panel and an outdated footer. Rebuild and redeploy it only after setting the correct Supabase environment variables and deploying the Edge Function. After deployment, verify the login page, session handling, each role’s navigation, patient creation, appointment booking, payment recording, medical-record creation, and sign-out.

## Privacy and operational expectations

This application handles sensitive clinical and financial information. Before using it with real patients, the owner must configure an appropriate Supabase project, review RLS policies with a qualified security professional, enable backups and monitoring, establish retention and access procedures, and satisfy applicable privacy and healthcare requirements. The sample services and any future demo records must be fictional.

## Repository map

| Path | Purpose |
|---|---|
| `src/App.tsx` | Authenticated application shell and role-safe tab rendering |
| `src/contexts/AuthContext.tsx` | Supabase session and profile lifecycle |
| `src/components/` | Feature screens for admin, shared, and doctor workflows |
| `src/lib/supabase.ts` | Supabase client, configuration validation, and shared types |
| `supabase/migrations/` | Database schema, indexes, grants, and RLS policies |
| `supabase/functions/create-staff/` | Server-side administrator-only staff provisioning |
| `firebase.json` | Firebase Hosting configuration |
| `SETUP_GUIDE.md` | Detailed environment and deployment handoff |
| `TESTING_GUIDE.md` | Manual verification checklist |
| `AUDIT_REPORT.md` | Latest repository and deployment audit |

## License and ownership

No open-source license is currently declared. Before listing the project for sale, define the license or transfer terms, identify the included assets, and state clearly whether the buyer receives the Firebase project, Supabase project, Edge Function deployment, domain, and any demo data.
