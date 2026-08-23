// Supabase Edge Function to create staff members
// Deploy this via Supabase Dashboard or CLI

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateStaffRequest {
    email: string
    password: string
    full_name: string
    role: 'admin' | 'doctor' | 'receptionist'
    phone?: string
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get the authorization header to verify the requesting user
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        // Create a Supabase client with the user's JWT to verify they're an admin
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        // Client for verifying the requesting user
        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        // Verify the user is authenticated and is an admin
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
        if (userError || !user) {
            throw new Error('Authentication required')
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabaseUser
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile || profile.role !== 'admin') {
            throw new Error('Only admins can create staff members')
        }

        // Parse the request body
        const { email, password, full_name, role, phone }: CreateStaffRequest = await req.json()

        // Validate inputs
        if (!email || !password || !full_name || !role) {
            throw new Error('Missing required fields: email, password, full_name, role')
        }

        if (!['admin', 'doctor', 'receptionist'].includes(role)) {
            throw new Error('Invalid role. Must be admin, doctor, or receptionist')
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters')
        }

        // Create admin client with service role key to create users
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Create the user using admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm the email
            user_metadata: { full_name }
        })

        if (createError) {
            throw new Error(`Failed to create user: ${createError.message}`)
        }

        if (!newUser.user) {
            throw new Error('User creation failed - no user returned')
        }

        // Create the profile record
        const { error: profileInsertError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: newUser.user.id,
                email,
                full_name,
                role,
                phone: phone || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (profileInsertError) {
            // If profile creation fails, delete the auth user to maintain consistency
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            throw new Error(`Failed to create profile: ${profileInsertError.message}`)
        }

        return new Response(
            JSON.stringify({
                success: true,
                user_id: newUser.user.id,
                message: 'Staff member created successfully'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
