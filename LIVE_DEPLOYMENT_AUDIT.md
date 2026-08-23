# Live Deployment Audit

## URL reviewed

`https://dentalcare-1.web.app/`

## Observed state

The Firebase deployment is reachable over HTTPS and loads the DentalCare login screen. The deployed page title is `DentalCare - Practice Management`.

The live site is visibly behind the repository cleanup target: it still displays a `Demo Credentials` block with a known demo email and password, and its footer says `© 2024 DentalCare`, while the repository source has a 2025 footer in the authenticated shell. This confirms deployment drift or an older build is currently published.

The live page exposes the login form and secure-healthcare branding, but no authenticated workflows could be verified without valid credentials. No credentials were submitted and no production data was accessed.

## Deployment conclusion

Firebase Hosting is reusable as a deployment target, but the deployed site must be rebuilt and redeployed after the source and security fixes. A production verification pass should confirm that the demo credential block is gone, the live footer/version matches the repository, Supabase environment variables are set in the build environment, and the staff Edge Function is deployed with server-side secrets and restricted origins.

## HTTP smoke check

The deployment returned `HTTP/2 200`. The static HTML response did not yet include the remediation security headers, confirming that the cleaned Firebase configuration has not been deployed. Because the login UI is rendered by JavaScript, the static HTML did not expose the legacy demo-label text; the browser-rendered page did expose it as documented above.
