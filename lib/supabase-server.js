import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceKey) {
  throw new Error('Missing Supabase service role key')
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function getAdminConfig(key) {
  const { data, error } = await supabaseServer
    .from('admin_config')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching admin config:', error)
    return null
  }

  return data?.value || null
}

export async function setAdminConfig(key, value) {
  const { error } = await supabaseServer
    .from('admin_config')
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) {
    console.error('Error setting admin config:', error)
    throw new Error('Failed to save configuration')
  }

  return true
}

export async function getAllAdminConfig() {
  const { data, error } = await supabaseServer
    .from('admin_config')
    .select('key, value')

  if (error) {
    console.error('Error fetching all admin config:', error)
    return {}
  }

  const config = {}
  data?.forEach(item => {
    config[item.key] = item.value
  })

  return config
}

export async function createOrUpdateUser(userData) {
  const { email, name, picture, auth_provider, auth_provider_id } = userData

  const { data: existingUser } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    const { data, error } = await supabaseServer
      .from('users')
      .update({
        name,
        picture,
        auth_provider,
        auth_provider_id,
        last_login: new Date().toISOString()
      })
      .eq('id', existingUser.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    const { data, error } = await supabaseServer
      .from('users')
      .insert({
        email,
        name,
        picture,
        auth_provider,
        auth_provider_id,
        subscription_status: 'free',
        last_login: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function createUserSession(userId, token, expiresAt) {
  const { data, error } = await supabaseServer
    .from('user_sessions')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserBySession(token) {
  const { data: session, error: sessionError } = await supabaseServer
    .from('user_sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (sessionError || !session) return null

  if (new Date(session.expires_at) < new Date()) {
    return null
  }

  const { data: user, error: userError } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', session.user_id)
    .maybeSingle()

  if (userError || !user) return null

  return user
}
