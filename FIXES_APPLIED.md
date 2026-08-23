# DentalCare Remediation Log

This file records the focused cleanup applied during the August 2026 buyer-readiness audit. The existing architecture was preserved: the frontend remains React/Vite, data access remains Supabase, and staff provisioning remains the `create-staff` Edge Function.

## Completed cleanup

| Area | Remediation |
|---|---|
| Configuration | Removed embedded Supabase URL and anon-key fallbacks. Missing configuration now fails visibly instead of silently targeting an embedded project. |
| Authentication UI | Removed known demo credentials from the login page and changed login failures to bounded generic messages. |
| Session handling | Cleared stale profiles during session transitions and added an unsupported-role access state. |
| Staff provisioning | Hardened the Edge Function with method checks, input validation, restricted CORS, server-side secret checks, and sanitized client errors. |
| Database security | Removed self-service profile updates that could permit role changes, and tightened doctor visibility to assigned appointments, patients, and clinical records. |
| Database integrity | Added updated-at triggers, nonnegative payment-total validation, and payment/appointment patient consistency validation. |
| Dashboard | Switched metrics to the generated payment total, sorted mixed activity by timestamp, and removed hard-coded trend percentages. |
| Search | Replaced raw PostgREST `.or()` interpolation with separate parameterized filters and stale-result protection. |
| Quality gates | Upgraded the TypeScript-ESLint toolchain compatibility and removed explicit-`any` lint errors. |
| Metadata and motion | Fixed CSS import order, added reduced-motion handling, and added basic HTML metadata. |
| Documentation | Rewrote setup, testing, and README material to remove secrets, known passwords, stale migration claims, and unsupported accountant-role claims. |

## Known product limitations

The current UI remains a focused prototype rather than a full clinic ERP. Patient, staff, service, appointment, payment, and medical-history screens expose partial CRUD workflows. Staff edit/disable/reset-password, patient edit/delete, service edit/delete, payment refunds/partial payments, medical-history edit/delete, richer clinical fields, reporting, settings, notifications, audit logs, and an accountant role are not fully implemented.

The migration remains a fresh-install/reset script with destructive table drops. It should be reviewed and backed up before application to any existing Supabase project. The first administrator must be provisioned securely outside the migration.

## Deployment note

The historical Firebase deployment at `https://dentalcare-1.web.app/` was reachable during the audit but served an older build that still displayed demo credentials and a 2024 footer. It must be rebuilt and redeployed from the cleaned source after buyer-owned Supabase and Edge Function configuration is in place.

## Verification status

The repository typecheck, lint, and production build pass after remediation. Live authenticated workflows and database policy behavior still require verification in a buyer-owned Supabase project with synthetic accounts and data.
