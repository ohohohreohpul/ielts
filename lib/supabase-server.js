import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

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

export async function getUserById(userId) {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function getUserByEmail(email) {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function updateUser(userId, updates) {
  const { data, error } = await supabaseServer
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }

  return data
}

export async function deleteSession(token) {
  const { error } = await supabaseServer
    .from('user_sessions')
    .delete()
    .eq('token', token)

  if (error) {
    console.error('Error deleting session:', error)
  }
}

export async function createExam(examData) {
  const { data, error } = await supabaseServer
    .from('exams')
    .insert(examData)
    .select()
    .single()

  if (error) {
    console.error('Error creating exam:', error)
    throw error
  }

  return data
}

export async function getExams(limit = 50) {
  const { data, error } = await supabaseServer
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching exams:', error)
    return []
  }

  return data
}

export async function createLesson(lessonData) {
  const { data, error } = await supabaseServer
    .from('lessons')
    .insert(lessonData)
    .select()
    .single()

  if (error) {
    console.error('Error creating lesson:', error)
    throw error
  }

  return data
}

export async function getLessonByPath(examId, sectionId, lessonId) {
  const { data, error } = await supabaseServer
    .from('lessons')
    .select('*')
    .eq('exam_id', examId)
    .eq('section_id', sectionId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching lesson:', error)
    return null
  }

  return data
}

export async function saveProgress(progressData) {
  const { data, error } = await supabaseServer
    .from('progress')
    .insert(progressData)
    .select()
    .single()

  if (error) {
    console.error('Error saving progress:', error)
    throw error
  }

  return data
}

export async function getUserProgress(userId, limit = 100) {
  const { data, error } = await supabaseServer
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching progress:', error)
    return []
  }

  return data
}

export async function saveExamHistory(historyData) {
  const { data, error } = await supabaseServer
    .from('exam_history')
    .insert(historyData)
    .select()
    .single()

  if (error) {
    console.error('Error saving exam history:', error)
    throw error
  }

  return data
}

export async function getExamHistory(userId, examType = null, section = null, limit = 50) {
  let query = supabaseServer
    .from('exam_history')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (examType) {
    query = query.eq('exam_type', examType)
  }

  if (section) {
    query = query.eq('section', section)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching exam history:', error)
    return []
  }

  return data
}

export async function createPaymentTransaction(transactionData) {
  const { data, error } = await supabaseServer
    .from('payment_transactions')
    .insert(transactionData)
    .select()
    .single()

  if (error) {
    console.error('Error creating payment transaction:', error)
    throw error
  }

  return data
}

export async function getPaymentTransactionBySessionId(sessionId) {
  const { data, error } = await supabaseServer
    .from('payment_transactions')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching payment transaction:', error)
    return null
  }

  return data
}

export async function updatePaymentTransaction(sessionId, updates) {
  const { data, error } = await supabaseServer
    .from('payment_transactions')
    .update(updates)
    .eq('session_id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating payment transaction:', error)
    throw error
  }

  return data
}
