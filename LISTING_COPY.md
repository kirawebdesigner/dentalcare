# DentalCare — SideProjectors Listing Copy

## Listing title

**DentalCare — Full-Stack Dental Clinic Management System | React + TypeScript + Supabase**

## Price

**$999 negotiable**

## Short description

DentalCare is a functional React + TypeScript + Supabase clinic-management foundation for developers, freelancers, agencies, or small clinic-software teams. It includes a Supabase-backed authentication flow, role-based workspaces for administrators, doctors, and receptionists, patient management, appointment scheduling, services, payments, dashboards, doctor medical records, RLS-backed database migrations, an administrator-only staff-provisioning Edge Function, Firebase Hosting configuration, and buyer handoff documentation.

The current live demo is available at [dentalcare-1.web.app](https://dentalcare-1.web.app/). It has been rebuilt and redeployed, the authenticated footer is current for 2026, and the accidental placeholder service was removed. The live database is intentionally empty: no real patients, appointments, payments, or medical records are included.

## Why this is valuable

This is a practical starting point for a buyer who wants an established full-stack foundation instead of a blank repository. The main navigation, role boundaries, data model, deployment configuration, and core clinic workflows are already in place. The repository has also been audited and documented for handoff, including setup, testing, deployment, migration, security-history remediation, and buyer ownership-transfer guidance.

## Included in the sale

| Asset | Details |
|---|---|
| Source repository | React, TypeScript, Vite, Tailwind CSS, Supabase client, and application components |
| Database foundation | Supabase PostgreSQL migration, indexes, RLS policies, integrity triggers, and seeded service catalog |
| Authentication | Supabase email/password session flow with role-aware navigation |
| Staff provisioning | Administrator-only `create-staff` Supabase Edge Function source |
| Deployment configuration | Firebase Hosting configuration with SPA rewrites and security headers |
| Documentation | README, setup, testing, deployment, buyer handoff, audit, remediation, checklist, and asset-inventory documents |
| Product screenshots | Clean live screenshots in [`sale-assets/screenshots/`](sale-assets/screenshots/) covering public login and Admin, Doctor, and Receptionist workflows |
| Demo support | Synthetic role/account guidance and buyer-owned demo seeding materials; no live passwords are published |

## Demonstrated workflows

The live verification pass covered the Admin dashboard, staff roster, service catalog, empty patient and appointment views, Doctor schedule, Doctor medical records, Receptionist patients, Receptionist appointments, and Receptionist payments. The protected Admin-to-create-staff workflow was also tested with a disposable synthetic account, which was deleted after verification.

## Best fit

DentalCare is best suited to a developer, freelancer, agency, or small clinic-software team that wants to customize and extend an existing foundation. It is a side project and implementation base, not a turnkey regulated healthcare SaaS product.

## Important limitations

The package does not claim HIPAA or GDPR certification, legal privacy documentation, clinical production readiness, real customers, real revenue, or compliance approval. Known product-scope limits include incomplete CRUD coverage in some modules, no accountant role, no complete staff disable/reset-password lifecycle, no reporting or audit-log subsystem, limited medical-record editing, and no formal privacy or compliance program.

A buyer must deploy the system and Supabase backend in a buyer-owned environment, rotate credentials, review the migration and RLS policies, configure Edge Function secrets and allowed origins, and complete their own legal, privacy, security, and clinical-readiness review before using real data.

## Transfer terms

The sale should define whether the price includes the GitHub repository, Firebase project, Supabase project, domain, live demo environment, deployment assistance, customization hours, and post-sale support. Credentials and ownership transfers should be handled privately and securely; passwords and service-role keys must never appear in the public listing.

## Suggested call to action

**Interested in a functional dental-clinic management foundation with the code, backend schema, Edge Function, deployment configuration, documentation, and screenshots already organized? Message me for the repository and buyer handoff package.**
