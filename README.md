# Dental Clinic Management System

A comprehensive web-based platform for managing dental clinic operations, including patient records, appointments, services, payments, and medical history.

## Features

- 🔐 **Role-Based Authentication** - Secure login with admin, doctor, and receptionist roles
- 👥 **Staff Management** - Admins can create and manage staff members
- 🦷 **Patient Management** - Comprehensive patient records and information
- 📅 **Appointment Scheduling** - Schedule and manage appointments with doctors
- 💰 **Payment Tracking** - Record and track patient payments
- 📋 **Medical History** - Maintain detailed medical records and treatment history
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Technology Stack

- **Frontend**: React 18.3.1 with TypeScript 5.5
- **Styling**: Tailwind CSS 3.4.1
- **Build Tool**: Vite 5.4.2
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React 0.344
- **Client Library**: @supabase/supabase-js 2.57.4

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Git (for cloning the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dental-clinic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://mvwvnxoweiiwshfzjdcc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12d3ZueG93ZWlpd3NoZnpqZGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTM0NzUsImV4cCI6MjA4MDA4OTQ3NX0._LGQDyUnVRj7BzJqjdffMdE2woTugA4lQTNJ7OHEVZY
```

**Note**: Replace with your own Supabase credentials if using a different instance.

### 4. Set Up Database

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Run the comprehensive migration file: `supabase/migrations/20251206000000_complete_system_reset.sql`

This migration will:
- Create all necessary tables (profiles, patients, services, appointments, payments, medical_history)
- Set up Row-Level Security (RLS) policies
- Create helper functions
- Insert the default admin user

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Login Credentials

- **Email**: `admin@clinic.com`
- **Password**: `admin123`

**⚠️ Important**: Change the default password after first login in production environments.

## Project Structure

```
dental-clinic/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── shared/         # Shared components
│   │   └── Login.tsx       # Login component
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/                # Utility libraries
│   │   └── supabase.ts     # Supabase client configuration
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── supabase/
│   └── migrations/         # Database migrations
│       └── 20251206000000_complete_system_reset.sql
├── .env                    # Environment variables (create this)
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## User Roles

### Admin
- Full system access
- Create and manage staff members
- Manage services and pricing
- View all appointments and payments
- Access all patient records

### Doctor
- View assigned appointments
- Access patient medical history
- Update diagnosis and treatment records
- Record medications
- Update appointment status

### Receptionist
- Add and manage patients
- Schedule appointments
- Assign doctors to appointments
- Record payments
- View appointment schedules

## Security Features

- **Row-Level Security (RLS)**: All database tables have RLS enabled
- **Role-Based Access Control**: Policies enforce permissions based on user roles
- **Secure Authentication**: Password hashing via Supabase Auth
- **Session Management**: Automatic session handling and refresh

## Database Schema

The system uses the following main tables:

- **profiles** - User profiles with role-based access
- **patients** - Patient information and records
- **services** - Dental services with pricing
- **appointments** - Appointment scheduling and management
- **payments** - Payment tracking and processing
- **medical_history** - Patient medical records and treatment history

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## Documentation

- [FIXES_APPLIED.md](./FIXES_APPLIED.md) - Architecture and fixes documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Troubleshooting guide
- [PRD.md](./PRD.md) - Product Requirements Document (if available)

## Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Functional components with React Hooks

### Adding New Features

1. Create components in appropriate directories
2. Update database schema via migrations if needed
3. Update RLS policies for new tables/features
4. Test thoroughly with different user roles

## Deployment

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Environment Variables for Production

Ensure production environment variables are set:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review browser console for errors
3. Check Supabase Dashboard for database issues
4. Verify environment variables are set correctly

## Changelog

### Latest Updates
- ✅ Cleaned up codebase - removed old migrations
- ✅ Removed unused authentication edge functions
- ✅ Consolidated to single comprehensive migration
- ✅ Updated documentation for clean architecture

