import { createClient } from '@supabase/supabase-js';

// Environment Variable Loading Instructions
const ENV_SETUP_INSTRUCTIONS = `
# 🛠️ Supabase Configuration Troubleshooting

1. **Create .env File**
   Ensure you have a file named \`.env\` in your project root (same level as package.json).

2. **Add Environment Variables**
   The file should contain:
   \`\`\`
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   \`\`\`

3. **Required Prefix**
   Variables MUST start with \`VITE_\` to be exposed to the browser.

4. **🔄 RESTART DEV SERVER**
   Vite does NOT automatically load new .env variables. You must stop (Ctrl+C) and restart:
   \`npm run dev\`

5. **Verify**
   Check the browser console for "✅ Supabase environment variables loaded successfully".
`;

// 1. Enhance Environment Variable Validation
function validateEnvironment() {
  const missing = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    console.group('❌ SUPABASE CONFIGURATION ERROR');
    console.error(`Missing Environment Variables: ${missing.join(', ')}`);
    console.warn('⚠️ Application checks failed. Please follow these steps:');
    console.info(ENV_SETUP_INSTRUCTIONS);
    console.groupEnd();
    return false;
  }

  console.log('✅ Supabase environment variables loaded successfully');
  return true;
}

const isValid = validateEnvironment();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mvwvnxoweiiwshfzjdcc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12d3ZueG93ZWlpd3NoZnpqZGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTM0NzUsImV4cCI6MjA4MDA4OTQ3NX0._LGQDyUnVRj7BzJqjdffMdE2woTugA4lQTNJ7OHEVZY';

// 5. Enhance Console Logging with Detailed Diagnostics
if (isValid) {
  console.groupCollapsed('🔌 Supabase Connection Diagnostics');
  console.log('Environment: ', import.meta.env.MODE);
  console.log('Initialization Time:', new Date().toISOString());
  console.log('URL:', supabaseUrl ? new URL(supabaseUrl).hostname : 'Missing');
  console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 10)}` : 'Missing');
  console.groupEnd();
} else {
  console.warn('💡 Quick Fix: Restart the dev server (npm run dev) if you just added the .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Add Connection Health Check Function & 3. Create Connection Status State
export interface SupabaseConnectionStatus {
  isConnected: boolean;
  error: string | null;
}

export const CONNECTION_STATUS_CHECKING = 'CHECKING';
export const CONNECTION_STATUS_CONNECTED = 'CONNECTED';
export const CONNECTION_STATUS_FAILED = 'FAILED';

let currentConnectionStatus: SupabaseConnectionStatus = { isConnected: false, error: null };

export const getConnectionStatus = () => currentConnectionStatus;

export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  try {
    console.log('🔄 Testing Supabase connection...');
    const start = performance.now();

    // Use a simple health check that doesn't depend on RLS
    // Attempt to call getSession - this works for all users
    const { error } = await supabase.auth.getSession();

    const duration = performance.now() - start;

    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      currentConnectionStatus = { isConnected: false, error: error.message };
      return currentConnectionStatus;
    }

    console.log(`✅ Supabase connection successful (${Math.round(duration)}ms)`);
    currentConnectionStatus = { isConnected: true, error: null };
    return currentConnectionStatus;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    console.error('❌ Supabase network status: Disconnected', message);
    currentConnectionStatus = { isConnected: false, error: message };
    return currentConnectionStatus;
  }
}

export type UserRole = 'admin' | 'doctor' | 'receptionist';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  date_of_birth?: string;
  address?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Profile;
  service?: Service;
}

export interface Payment {
  id: string;
  appointment_id?: string;
  patient_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'insurance';
  paid_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  appointment?: Appointment;
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  appointment_id?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string;
  notes?: string;
  recorded_by?: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Profile;
}
