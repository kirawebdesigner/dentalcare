# DentalCare Pre-Listing Checklist

## Security

- [ ] Rotate or revoke any credential that appeared in old Git history.
- [ ] Decide whether to scrub and force-push public history after making a private backup.
- [ ] Confirm that the current tree, demo package, archive, and listing contain no passwords or service-role keys.
- [ ] Confirm that no real patient or clinic information is included.

## Demo environment

- [ ] Create a separate buyer/demo Supabase project.
- [ ] Create synthetic Admin, Doctor, and Receptionist Auth users with private passwords.
- [ ] Provision their profiles using `supabase/demo/provision_demo_profiles.sql`.
- [ ] Load fictional records using `supabase/demo/seed_demo_data.sql`.
- [ ] Verify all documented workflows and RLS boundaries.

## Deployment

- [ ] Configure buyer-owned frontend Supabase variables.
- [ ] Deploy `create-staff` with the service-role key stored only as a server-side secret.
- [ ] Set `ALLOWED_ORIGINS` to the exact deployed HTTPS origin.
- [ ] Run `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Deploy Firebase Hosting from the cleaned `dist/` output.
- [ ] Verify security headers, SPA refresh routing, current footer, and no credential disclosure.

## Listing

- [ ] Use the copy in `LISTING_COPY.md`.
- [ ] State that the asking price is `$999 negotiable`.
- [ ] List the included source, migration, Edge Function, Firebase configuration, docs, demo package, and handoff guide.
- [ ] Explicitly disclose missing accountant role, incomplete CRUD, missing compliance certification, and buyer-owned deployment requirements.
- [ ] Define ownership transfer and post-sale support terms.
