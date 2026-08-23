# DentalCare Sale Asset Inventory

## Included in the repository package

| Category | Included asset | Buyer use |
|---|---|---|
| Application | `src/` | React, TypeScript, Supabase client, authentication, layout, and feature screens |
| Database | `supabase/migrations/20251206000000_complete_system_reset.sql` | Fresh-install schema, indexes, integrity triggers, grants, and RLS policies |
| Server-side backend | `supabase/functions/create-staff/index.ts` | Administrator-only staff provisioning through Supabase Auth |
| Demo accounts | `supabase/demo/DEMO_ACCOUNTS.md` and `supabase/demo/provision_demo_profiles.sql` | Synthetic account setup without stored passwords |
| Demo data | `supabase/demo/seed_demo_data.sql` | Fictional patients, appointments, payments, and medical history |
| Hosting | `firebase.json` and `.firebaserc` | Firebase Hosting output and SPA routing/security-header configuration |
| Developer setup | `README.md`, `SETUP_GUIDE.md`, `DEPLOYMENT_RUNBOOK.md` | Installation and redeployment instructions |
| QA | `TESTING_GUIDE.md` and `SALE_PACKAGE_CHECKLIST.md` | Manual workflow, role, responsive, and pre-listing verification |
| Audit/security | `AUDIT_REPORT.md`, `FIXES_APPLIED.md`, `HISTORY_REMEDIATION.md` | Findings, remediation history, and historical-exposure guidance |
| Listing/handoff | `LISTING_COPY.md` and `BUYER_HANDOFF.md` | Honest sales copy and ownership-transfer procedure |

## Buyer-owned items not included automatically

The buyer must provide or explicitly receive transfer of the Firebase project, Supabase project, Auth users, service-role secret, deployment accounts, domains, backups, monitoring, privacy/legal policies, and any post-sale support. None of these should be inferred from repository access alone.

## Explicit exclusions

The package does not include real patient data, real clinic credentials, a service-role key, a default password, an accountant role, a complete EHR, compliance certification, legal privacy documentation, a guarantee of production readiness, or a guarantee of revenue/customers.

## Archive

The clean repository archive was generated from commit `27dd116` as `/home/ubuntu/dentalcare-sale-package.zip`. It contains the source tree and sale-preparation materials but excludes Git history, `node_modules`, local environment files, and build artifacts.
