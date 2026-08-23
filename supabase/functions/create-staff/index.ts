import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function getCorsHeaders(req: Request) {
  const requestOrigin = req.headers.get('origin');
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0] ?? 'null';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

interface CreateStaffRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'doctor' | 'receptionist';
  phone?: string | null;
}

function jsonResponse(req: Request, body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse(req, { success: false, error: 'Method not allowed.' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse(req, { success: false, error: 'Authentication required.' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Staff function is missing required Supabase secrets.');
      return jsonResponse(req, { success: false, error: 'Staff provisioning is not configured.' }, 500);
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, { success: false, error: 'Authentication required.' }, 401);
    }

    const { data: profile, error: profileError } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return jsonResponse(req, { success: false, error: 'Only administrators can create staff members.' }, 403);
    }

    let payload: Partial<CreateStaffRequest>;
    try {
      payload = await req.json();
    } catch {
      return jsonResponse(req, { success: false, error: 'Invalid request body.' }, 400);
    }

    const email = payload.email?.trim().toLowerCase();
    const fullName = payload.full_name?.trim();
    const password = payload.password ?? '';
    const role = payload.role;
    const phone = payload.phone?.trim() || null;

    if (!email || !fullName || !password || !role) {
      return jsonResponse(req, { success: false, error: 'Email, password, name, and role are required.' }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(req, { success: false, error: 'Enter a valid email address.' }, 400);
    }

    if (fullName.length > 120 || email.length > 254 || phone && phone.length > 40) {
      return jsonResponse(req, { success: false, error: 'One or more fields are too long.' }, 400);
    }

    if (password.length < 8) {
      return jsonResponse(req, { success: false, error: 'Password must be at least 8 characters.' }, 400);
    }

    if (!['admin', 'doctor', 'receptionist'].includes(role)) {
      return jsonResponse(req, { success: false, error: 'Invalid staff role.' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !newUser.user) {
      console.error('Unable to create staff auth user.');
      return jsonResponse(req, { success: false, error: 'Unable to create staff member.' }, 400);
    }

    const { error: profileInsertError } = await supabaseAdmin.from('profiles').insert({
      id: newUser.user.id,
      email,
      full_name: fullName,
      role,
      phone,
    });

    if (profileInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      console.error('Unable to create staff profile.');
      return jsonResponse(req, { success: false, error: 'Unable to create staff member.' }, 400);
    }

    return jsonResponse(req, {
      success: true,
      user_id: newUser.user.id,
      message: 'Staff member created successfully.',
    }, 200);
  } catch (error) {
    console.error('Unexpected staff provisioning error:', error instanceof Error ? error.message : 'unknown');
    return jsonResponse(req, { success: false, error: 'Unable to complete staff provisioning.' }, 500);
  }
});
