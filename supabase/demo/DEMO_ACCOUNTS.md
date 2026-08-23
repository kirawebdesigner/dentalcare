# DentalCare Demo Accounts

This guide describes how to create fictional accounts for a buyer demonstration. It intentionally contains no passwords. Create accounts only in a dedicated demo Supabase project, never in a production clinic project.

## Recommended synthetic identities

| Role | Suggested email | Display name |
|---|---|---|
| Administrator | `demo.admin@example.test` | Demo Administrator |
| Doctor | `demo.doctor@example.test` | Dr. Jordan Rivera |
| Receptionist | `demo.reception@example.test` | Taylor Morgan |

The `.test` domain is reserved for examples. If the buyer’s Supabase Auth configuration does not accept it, use another fictional domain that is controlled by the buyer and does not belong to a real person.

## Provisioning process

Create the three users through the Supabase Dashboard or an approved server-side provisioning process. Use unique buyer-controlled passwords, confirm the accounts according to the demo project’s Auth settings, and do not write those passwords into this repository or the listing.

After the Auth users exist, run `provision_demo_profiles.sql` in the demo project’s SQL Editor. It creates or updates the matching `profiles` rows with the supported roles. Then run `seed_demo_data.sql` to load fictional patients, appointments, payments, and one medical-history record.

## Safety rules

Use synthetic records only. Remove demo accounts and data before transferring a project unless the buyer explicitly wants them included. Never reuse these identities for a real clinic, never publish passwords, and never place a service-role key in frontend environment variables.
