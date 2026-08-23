# Dental Clinic Management System - Setup Guide

## Overview
This document contains all the setup instructions and SQL migrations needed to deploy the Dental Clinic Management System.

## Environment Configuration

### Update `.env` file with new Supabase credentials:

```env
VITE_SUPABASE_URL=https://mvwvnxoweiiwshfzjdcc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12d3ZueG93ZWlpd3NoZnpqZGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTM0NzUsImV4cCI6MjA4MDA4OTQ3NX0._LGQDyUnVRj7BzJqjdffMdE2woTugA4lQTNJ7OHEVZY
```

## Database Setup

Run the comprehensive migration `file:supabase/migrations/20251206000000_complete_system_reset.sql` which creates all tables, RLS policies, functions, and the admin user.

This migration includes:
- Tables: profiles, patients, services, appointments, payments, medical_history
- Indexes for performance optimization
- Row-Level Security (RLS) policies for all tables
- Helper functions (e.g., `create_staff_member()`)
- Bootstrap admin user with default credentials

## Default Admin Credentials

After setup, use these credentials to login:

- **Email:** admin@clinic.com
- **Password:** admin123

**Important:** Change the password immediately after your first login in production.

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ServiceManagement.tsx
│   │   │   └── StaffManagement.tsx
│   │   ├── doctor/
│   │   │   └── MedicalHistoryManagement.tsx
│   │   ├── shared/
│   │   │   ├── AppointmentManagement.tsx
│   │   │   ├── PatientManagement.tsx
│   │   │   └── PaymentManagement.tsx
│   │   ├── Layout.tsx
│   │   └── Login.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       └── 20251206000000_complete_system_reset.sql
├── PRD.md (Product Requirements Document)
├── SETUP_GUIDE.md (This file)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── .env
```

## Build & Development

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
This creates an optimized production build in the `dist/` directory.

### Type Checking
```bash
npm run typecheck
```
Validates TypeScript types without emitting JavaScript.

### Linting
```bash
npm run lint
```
Checks code quality with ESLint.

## Key Features

### Authentication
- Standard Supabase authentication with `signInWithPassword()`
- Role-based access control (Admin, Doctor, Receptionist)

### Staff Management (Admin Only)
- Create and manage doctor and receptionist accounts
- View all staff profiles
- Track staff member details

### Patient Management
- Add and manage patient records
- Track patient demographics and medical information
- Search and filter patients

### Appointment Scheduling
- Schedule appointments with date/time selection
- Assign doctors to appointments
- Track appointment status (Scheduled, Completed, Cancelled, No-Show)

### Payment Processing
- Record payments for appointments
- Support multiple payment methods (Cash, Card, Insurance)
- Track payment status and history

### Medical Records
- Doctors can create and update medical history
- Link medical records to appointments
- Document diagnosis, treatment, and medications

## Security Features

### Row-Level Security (RLS)
All database tables have RLS enabled with appropriate policies:
- Admins can access all data
- Doctors can only access their assigned appointments and medical records
- Receptionists can manage patients, appointments, and payments

### Data Protection
- Supabase Auth handles password hashing and authentication
- User role-based access control
- Email-verified users only

## Responsive Design

The application is fully responsive and optimized for:
- **Mobile** (320px and up): Compact layout with icon-only navigation
- **Tablet** (768px and up): Balanced layout with text labels
- **Desktop** (1024px and up): Full layout with all features visible

## Troubleshooting

### Login Issues
1. Verify Supabase credentials in `.env` are correct
2. Check admin user exists in database
3. Ensure password is exactly "admin123"

### Database Connection Errors
1. Verify internet connectivity
2. Check Supabase URL and API key in `.env`
3. Ensure Supabase project is active

### Build Errors
1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run typecheck` to identify TypeScript issues
3. Clear `node_modules` and reinstall if needed

## Performance Optimization

- Indexes on frequently queried columns
- Lazy loading of components
- CSS minification with Tailwind
- Code splitting with Vite
- RLS policies for database-level filtering

## Deployment Checklist

- [ ] Update `.env` with production Supabase credentials
- [ ] Run `npm run build` successfully
- [ ] Run `npm run typecheck` - no errors
- [ ] Test login with admin credentials
- [ ] Verify all features work correctly
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Change admin password in production
- [ ] Enable HTTPS (if not automatic)
- [ ] Set up monitoring and logging
- [ ] Configure backups

## Support & Documentation

For more detailed information, see:
- **PRD.md** - Product Requirements and feature documentation
- **src/components/** - Component-specific implementation details
- **supabase/migrations/** - Database schema and migrations

## Version Information

- React: 18.3.1
- TypeScript: 5.5.3
- Tailwind CSS: 3.4.1
- Vite: 5.4.2
- Supabase JS Client: 2.57.4

---

**Last Updated:** December 2025
**Status:** Production Ready
