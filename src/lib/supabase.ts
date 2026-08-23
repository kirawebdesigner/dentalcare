import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Keep the client constructible so the app can render a useful configuration error.
// No real project URL or credential is embedded in the bundle.
export const supabase = createClient(
  supabaseUrl || 'https://missing-supabase-config.invalid',
  supabaseAnonKey || 'missing-supabase-anon-key',
);

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
  if (!isSupabaseConfigured) {
    currentConnectionStatus = {
      isConnected: false,
      error: 'Supabase environment variables are not configured.',
    };
    return currentConnectionStatus;
  }

  try {
    const { error } = await supabase.auth.getSession();

    if (error) {
      currentConnectionStatus = { isConnected: false, error: 'Supabase connection failed.' };
      return currentConnectionStatus;
    }

    currentConnectionStatus = { isConnected: true, error: null };
    return currentConnectionStatus;
  } catch {
    currentConnectionStatus = { isConnected: false, error: 'Supabase connection failed.' };
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
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
  allergies?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number;
  status: AppointmentStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Profile;
  service?: Service;
}

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'insurance' | 'other';

export interface Payment {
  id: string;
  appointment_id?: string;
  patient_id: string;
  amount: number;
  discount?: number;
  tax?: number;
  total?: number;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  paid_at?: string;
  notes?: string;
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
  visit_date?: string;
  chief_complaint?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string;
  tooth_numbers?: string;
  x_ray_notes?: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  notes?: string;
  recorded_by?: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Profile;
}
