import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  supabaseServer,
  getAdminConfig,
  setAdminConfig,
  getAllAdminConfig,
  createOrUpdateUser,
  createUserSession,
  getUserBySession,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteSession,
  createExam,
  getExams,
  createLesson,
  getLessonByPath,
  saveProgress,
  getUserProgress,
  saveExamHistory,
  getExamHistory,
  createPaymentTransaction,
  getPaymentTransactionBySessionId,
  updatePaymentTransaction
} from '@/lib/supabase-server'

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Helper function to create JWT-like token
function createToken(userId) {
  return crypto.randomBytes(32).toString('hex')
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Helper function to build lesson prompts for AI content generation
function buildLessonPrompt(examId, sectionId, lessonId) {
  const lessonTitles = {
    'ielts-reading-question-types': 'ประเภทคำถาม IELTS Reading ทั้งหมด',
    'ielts-reading-skimming-scanning': 'เทคนิค Skimming และ Scanning',
    'ielts-reading-true-false-ng': 'ทริคทำ True/False/Not Given',
    'ielts-reading-matching-headings': 'วิธีทำ Matching Headings',
    'ielts-reading-sentence-completion': 'เทคนิค Sentence Completion',
    'ielts-reading-time-management': 'การบริหารเวลา IELTS Reading',
    'ielts-listening-question-types': 'ประเภทคำถาม IELTS Listening',
    'ielts-listening-note-taking': 'เทคนิค Note Taking',
    'ielts-listening-prediction': 'การ Predict คำตอบ',
    'ielts-listening-spelling-tips': 'Spelling Tips และ Common Mistakes',
    'ielts-listening-map-diagram': 'ทำข้อ Map และ Diagram',
    'ielts-writing-task1-overview': 'Task 1: Overview และ Structure',
    'ielts-writing-task1-graphs': 'Task 1: การบรรยาย Graphs',
    'ielts-writing-task2-structure': 'Task 2: Essay Structure',
    'ielts-writing-task2-opinion': 'Task 2: Opinion Essay',
    'ielts-writing-vocabulary': 'Vocabulary for High Score',
    'ielts-writing-common-mistakes': 'Common Mistakes to Avoid',
    'ielts-speaking-part1-tips': 'Part 1: Introduction Tips',
    'ielts-speaking-part2-structure': 'Part 2: Cue Card Strategy',
    'ielts-speaking-part3-discussion': 'Part 3: Discussion Skills',
    'ielts-speaking-fluency-tips': 'เพิ่ม Fluency และ Coherence',
    'ielts-speaking-vocabulary-range': 'Vocabulary Range Tips',
    'toeic-listening-part1-photos': 'Part 1: Photographs',
    'toeic-listening-part2-qa': 'Part 2: Question-Response',
    'toeic-listening-part3-conversations': 'Part 3: Conversations',
    'toeic-listening-part4-talks': 'Part 4: Talks',
    'toeic-listening-listening-tricks': 'Listening Tricks และ Traps',
    'toeic-reading-part5-incomplete': 'Part 5: Incomplete Sentences',
    'toeic-reading-part6-text-completion': 'Part 6: Text Completion',
    'toeic-reading-part7-single': 'Part 7: Single Passages',
    'toeic-reading-part7-multiple': 'Part 7: Multiple Passages',
    'toeic-reading-time-management': 'Time Management Strategy'
  }

  const key = `${examId}-${sectionId}-${lessonId}`
  const title = lessonTitles[key] || `${examId.toUpperCase()} ${sectionId} - ${lessonId}`

  return `สร้างเนื้อหาบทเรียนเตรียมสอบ ${examId.toUpperCase()} สำหรับหัวข้อ: "${title}"

เขียนเป็นภาษาไทย ให้เข้าใจง่าย มีตัวอย่างชัดเจน

ส่งกลับเป็น JSON format ดังนี้:
{
  "title": "${title}",
  "sections": [
    {
      "type": "heading",
      "emoji": "📚",
      "text": "หัวข้อหลัก"
    },
    {
      "type": "paragraph",
      "text": "เนื้อหาอธิบาย..."
    },
    {
      "type": "tip",
      "text": "ทริคสำคัญ..."
    },
    {
      "type": "example",
      "text": "ตัวอย่าง..."
    },
    {
      "type": "list",
      "items": ["ข้อ 1", "ข้อ 2", "ข้อ 3"]
    },
    {
      "type": "warning",
      "text": "ข้อควรระวัง..."
    }
  ]
}

กฎ:
- เนื้อหาต้องละเอียด 800-1500 คำ
- มีอย่างน้อย 4-6 sections
- ใช้ emoji ที่เหมาะสม
- มี tips และ examples ที่เป็นประโยชน์
- เขียนเป็นภาษาไทยทั้งหมด (ยกเว้นศัพท์เฉพาะ)
- ส่งกลับเป็น JSON เท่านั้น`
}

// Helper function to build Gemini prompts for different exam types
function buildExamPrompt(examType, section, count) {
  if (section === 'grammar') {
    return `Generate ${count} English Grammar practice questions. Return ONLY a valid JSON array.

IMPORTANT:
- Each question MUST have "type": "multiple-choice"
- MUST include "explanation" field IN THAI LANGUAGE (ภาษาไทย) explaining WHY the answer is correct
- Explanation should be easy to understand with examples

Mix different grammar topics: tenses, prepositions, articles, vocabulary, conditionals, reported speech, subject-verb agreement.

Format:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "sentence": "She ____ to the office every morning by bus.",
    "question": "Choose the correct answer:",
    "options": [
      {"id": "a", "text": "go", "correct": false},
      {"id": "b", "text": "goes", "correct": true},
      {"id": "c", "text": "going", "correct": false},
      {"id": "d", "text": "gone", "correct": false}
    ],
    "explanation": "คำตอบที่ถูกคือ 'goes' เพราะประธาน 'She' เป็นเอกพจน์บุรุษที่ 3 ในรูป Present Simple Tense เราต้องเติม -s/-es ที่ท้ายกริยา"
  }
]

Rules:
- "type" MUST be "multiple-choice"
- "explanation" MUST be in THAI language
- Cover various grammar topics
- Generate exactly ${count} grammar questions. Return ONLY the JSON array.`
  }

  if (section === 'listening') {
    return `Generate ${count} ${examType} Listening questions. Return ONLY a valid JSON array.

IMPORTANT:
- Each question MUST have "type": "listening"
- MUST have "audioText" field containing the English text to be spoken
- MUST have "explanation" field IN THAI LANGUAGE

Format for listening questions:
[
  {
    "id": "q1",
    "type": "listening",
    "audioText": "Good morning everyone. Today I'd like to discuss our quarterly sales figures.",
    "question": "What is the main topic?",
    "options": [
      {"id": "a", "text": "Product launch", "correct": false},
      {"id": "b", "text": "Quarterly sales", "correct": true},
      {"id": "c", "text": "Employee promotions", "correct": false}
    ],
    "explanation": "ผู้พูดกล่าวว่า 'quarterly sales figures' คำสำคัญคือ sales figures = ตัวเลขยอดขาย"
  }
]

Generate exactly ${count} questions. Return ONLY the JSON array.`
  }

  if (section === 'writing') {
    if (examType === 'IELTS') {
      return `Generate ${count} IELTS Writing task prompts. Return ONLY a valid JSON array.

IMPORTANT: Alternate between Task 1 and Task 2.

Task 1 format:
{
  "id": "q1",
  "type": "writing",
  "task": "Task 1",
  "prompt": "The bar chart below shows...",
  "chartData": {
    "chartType": "bar",
    "title": "Household Internet Access (%)",
    "categories": ["USA", "UK", "Japan"],
    "datasets": [
      {"label": "2010", "data": [75, 82, 78]},
      {"label": "2020", "data": [90, 94, 93]}
    ]
  },
  "wordLimit": 150,
  "rubric": "Task Achievement, Coherence & Cohesion"
}

Task 2 format:
{
  "id": "q2",
  "type": "writing",
  "task": "Task 2",
  "prompt": "Some people believe that technology has made our lives more complicated. Discuss.",
  "wordLimit": 250,
  "rubric": "Task Response, Coherence & Cohesion"
}

Generate exactly ${count} writing tasks. Return ONLY the JSON array.`
    }

    return `Generate ${count} ${examType} Writing prompts. Return ONLY a valid JSON array.

Format:
[
  {
    "id": "q1",
    "type": "writing",
    "task": "Essay Writing",
    "prompt": "Do you agree or disagree...",
    "wordLimit": 200,
    "rubric": "Content, Organization, Grammar"
  }
]

Generate exactly ${count} writing prompts. Return ONLY the JSON array.`
  }

  if (section === 'speaking') {
    return `Generate ${count} ${examType} Speaking questions. Return ONLY a valid JSON array.

Format:
[
  {
    "id": "q1",
    "type": "speaking",
    "part": "Part 1",
    "question": "Tell me about your hometown.",
    "preparationTime": 0,
    "speakingTime": 30,
    "rubric": "Fluency, Vocabulary, Grammar"
  }
]

Generate exactly ${count} speaking questions. Return ONLY the JSON array.`
  }

  if (section === 'reading') {
    if (examType === 'IELTS') {
      return `Generate ${count} IELTS Reading questions. Return ONLY a valid JSON array.

IMPORTANT: Each question MUST include "explanation" IN THAI LANGUAGE.

Mix these types:
1. TRUE/FALSE/NOT GIVEN
2. Multiple Choice
3. Completion

Each must have Thai explanation. Generate exactly ${count} questions. Return ONLY the JSON array.`
    }

    return `Generate ${count} ${examType} Reading questions. Return ONLY a valid JSON array.

IMPORTANT: Each question MUST include "explanation" IN THAI LANGUAGE.

Format:
[
  {
    "id": "q1",
    "type": "reading",
    "passage": "A 100-150 word passage...",
    "question": "What is the main idea?",
    "options": [
      {"id": "a", "text": "option A", "correct": false},
      {"id": "b", "text": "option B", "correct": true}
    ],
    "explanation": "ใจความหลักอยู่ในย่อหน้าแรก"
  }
]

Generate exactly ${count} reading questions. Return ONLY the JSON array.`
  }

  return `Generate ${count} ${examType} English exam questions. Return ONLY a valid JSON array.

Format:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "sentence": "The manager ____ the report.",
    "question": "Choose the best answer:",
    "options": [
      {"id": "a", "text": "submits", "correct": false},
      {"id": "b", "text": "submitted", "correct": true}
    ]
  }
]

Generate exactly ${count} questions. Return ONLY the JSON array.`
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Mock AI-generated questions with better variety
const generateMockQuestions = (examType = 'TOEIC', count = 10, section = 'reading') => {
  const questions = []

  const readingPassages = [
    'The annual conference will be held in Singapore this year. Over 500 delegates from around the world are expected to attend.',
    'Our company has been recognized as one of the best places to work for the third consecutive year.',
    'The new product launch has exceeded expectations, with sales reaching $1 million in the first week.'
  ]

  const grammarSentences = [
    { text: 'The company ____ a new product next month.', answer: 'will launch', options: ['launch', 'will launch', 'launching', 'launched'] },
    { text: 'She ____ to the office every day.', answer: 'goes', options: ['go', 'goes', 'going', 'gone'] },
    { text: 'They ____ the meeting yesterday.', answer: 'attended', options: ['attend', 'attends', 'attending', 'attended'] }
  ]

  for (let i = 0; i < count; i++) {
    if (section === 'reading') {
      const passage = readingPassages[i % readingPassages.length]
      questions.push({
        id: `q${i + 1}`,
        type: 'reading',
        passage: passage,
        question: 'What is the main topic of this passage?',
        options: [
          { id: 'a', text: 'Company performance', correct: i % 2 === 0 },
          { id: 'b', text: 'Conference details', correct: i % 2 === 1 },
          { id: 'c', text: 'Product information', correct: false },
          { id: 'd', text: 'Employee benefits', correct: false }
        ],
        explanation: 'The passage discusses specific information about the topic mentioned.'
      })
    } else if (section === 'listening') {
      questions.push({
        id: `q${i + 1}`,
        type: 'listening',
        audioText: 'Good morning. This is an announcement about today\'s schedule.',
        question: 'What is this audio about?',
        options: [
          { id: 'a', text: 'Daily schedule', correct: true },
          { id: 'b', text: 'Weather forecast', correct: false },
          { id: 'c', text: 'Traffic report', correct: false },
          { id: 'd', text: 'News update', correct: false }
        ],
        explanation: 'The speaker mentions the daily schedule.'
      })
    } else {
      const sentence = grammarSentences[i % grammarSentences.length]
      questions.push({
        id: `q${i + 1}`,
        type: 'multiple-choice',
        question: 'Choose the correct form:',
        sentence: sentence.text,
        options: sentence.options.map((opt, idx) => ({
          id: String.fromCharCode(97 + idx),
          text: opt,
          correct: opt === sentence.answer
        })),
        explanation: `The correct answer is "${sentence.answer}" because of the grammatical context.`
      })
    }
  }

  return questions
}

// Route handler function
async function handleRoute(request, context) {
  const params = await context.params
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if ((route === '/root' || route === '/') && method === 'GET') {
      return handleCORS(NextResponse.json({
        message: "Carrot School API",
        version: "2.0.0",
        database: "Supabase",
        endpoints: [
          '/generate-exam',
          '/lessons',
          '/progress',
          '/user',
          '/auth/signup',
          '/auth/login'
        ]
      }))
    }

    // Auth: Signup
    if (route === '/auth/signup' && method === 'POST') {
      const body = await request.json()
      const { name, email, password } = body

      if (!name || !email || !password) {
        return handleCORS(NextResponse.json(
          { error: "Name, email and password are required" },
          { status: 400 }
        ))
      }

      const existingUser = await getUserByEmail(email)
      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        ))
      }

      if (!supabaseServer) {
        return handleCORS(NextResponse.json(
          { error: "Database not configured" },
          { status: 500 }
        ))
      }

      const user = await supabaseServer
        .from('users')
        .insert({
          name,
          username: name,
          email,
          password: hashPassword(password),
          streak: 0,
          hearts: 5,
          total_xp: 0,
          auth_provider: 'email',
          last_login: new Date().toISOString()
        })
        .select()
        .single()

      if (user.error) {
        return handleCORS(NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        ))
      }

      const token = createToken(user.data.id)
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await createUserSession(user.data.id, token, expiresAt)

      const { password: _, ...userResponse } = user.data
      return handleCORS(NextResponse.json({
        user: userResponse,
        token
      }))
    }

    // Auth: Login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { email, password } = body

      if (!email || !password) {
        return handleCORS(NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        ))
      }

      const user = await getUserByEmail(email)
      if (!user || user.password !== hashPassword(password)) {
        return handleCORS(NextResponse.json(
          { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
          { status: 401 }
        ))
      }

      await updateUser(user.id, { last_login: new Date().toISOString() })

      const token = createToken(user.id)
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await createUserSession(user.id, token, expiresAt)

      const { password: _, ...userResponse } = user
      return handleCORS(NextResponse.json({
        user: userResponse,
        token
      }))
    }

    // Auth: Logout
    if (route === '/auth/logout' && method === 'POST') {
      const authHeader = request.headers.get('Authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (token) {
        await deleteSession(token)
      }

      return handleCORS(NextResponse.json({ success: true }))
    }

    // Auth: Get Session
    if (route === '/auth/session' && method === 'GET') {
      const authHeader = request.headers.get('Authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (!token) {
        return handleCORS(NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        ))
      }

      const user = await getUserBySession(token)

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "Invalid or expired session" },
          { status: 401 }
        ))
      }

      const { password: _, ...userResponse } = user
      return handleCORS(NextResponse.json({ user: userResponse }))
    }

    // Generate AI Mock Exam
    if (route === '/generate-exam' && method === 'POST') {
      const body = await request.json()
      const { examType = 'TOEIC', questionCount = 10, userId } = body

      await new Promise(resolve => setTimeout(resolve, 2000))

      const questions = generateMockQuestions(examType, questionCount)

      const exam = await createExam({
        user_id: userId || null,
        exam_type: examType,
        questions: questions,
        total_questions: questions.length
      })

      return handleCORS(NextResponse.json(exam))
    }

    // Get all lessons
    if (route === '/lessons' && method === 'GET') {
      const lessons = await getExams(50)
      return handleCORS(NextResponse.json(lessons))
    }

    // Save user progress
    if (route === '/progress' && method === 'POST') {
      const body = await request.json()
      const { userId, lessonId, score, completedAt } = body

      if (!userId || !lessonId) {
        return handleCORS(NextResponse.json(
          { error: "userId and lessonId are required" },
          { status: 400 }
        ))
      }

      const progress = await saveProgress({
        user_id: userId,
        lesson_id: lessonId,
        score: score || 0,
        completed_at: completedAt || new Date().toISOString()
      })

      return handleCORS(NextResponse.json(progress))
    }

    // Get user progress
    if (route.startsWith('/progress/') && method === 'GET') {
      const userId = route.split('/').pop()
      const userProgress = await getUserProgress(userId, 100)
      return handleCORS(NextResponse.json(userProgress))
    }

    // Create/Update user
    if (route === '/user' && method === 'POST') {
      const body = await request.json()
      const { userId, name, goal, streak = 0, hearts = 5 } = body

      if (!userId) {
        return handleCORS(NextResponse.json(
          { error: "userId is required" },
          { status: 400 }
        ))
      }

      const user = await updateUser(userId, {
        name,
        goal,
        streak,
        hearts
      })

      return handleCORS(NextResponse.json(user))
    }

    // Get user by ID
    if (route.startsWith('/user/') && method === 'GET') {
      const userId = route.split('/').pop()
      const user = await getUserById(userId)

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        ))
      }

      const { password: _, ...userData } = user
      return handleCORS(NextResponse.json(userData))
    }

    // Admin: Get API Keys status
    if (route === '/admin/keys' && method === 'GET') {
      const config = await getAllAdminConfig()

      return handleCORS(NextResponse.json({
        gemini: !!config.geminiKey,
        googleTTS: !!config.googleTTSKey,
        elevenLabs: !!config.elevenLabsKey,
        openAI: !!config.openAIKey
      }))
    }

    // Admin: Save API Keys
    if (route === '/admin/keys' && method === 'POST') {
      const body = await request.json()
      const { geminiKey, googleTTSKey, elevenLabsKey, openAIKey } = body

      if (geminiKey) await setAdminConfig('geminiKey', geminiKey)
      if (googleTTSKey) await setAdminConfig('googleTTSKey', googleTTSKey)
      if (elevenLabsKey) await setAdminConfig('elevenLabsKey', elevenLabsKey)
      if (openAIKey) await setAdminConfig('openAIKey', openAIKey)

      return handleCORS(NextResponse.json({
        success: true,
        message: 'API keys saved successfully'
      }))
    }

    // Generate AI questions using LLM
    if (route === '/ai/generate-questions' && method === 'POST') {
      console.log('=== AI Generation Request Started ===')
      console.log('Route:', route)
      console.log('Method:', method)

      const body = await request.json()
      const { examType, section, count = 5 } = body
      console.log('Request body:', { examType, section, count })

      console.log('Attempting to fetch API key from database...')
      const dbApiKey = await getAdminConfig('geminiKey')
      console.log('Database API key:', dbApiKey ? `${dbApiKey.substring(0, 10)}... (length: ${dbApiKey.length})` : 'null')

      console.log('Checking environment variable...')
      const envApiKey = process.env.EMERGENT_LLM_KEY
      console.log('Environment API key:', envApiKey ? `${envApiKey.substring(0, 10)}... (length: ${envApiKey.length})` : 'null')

      const apiKey = dbApiKey || envApiKey
      console.log('Final API key selected:', apiKey ? `${apiKey.substring(0, 10)}... (length: ${apiKey.length})` : 'null')

      if (!apiKey) {
        console.error('AI generation error: No API key configured')
        return handleCORS(NextResponse.json(
          { error: "API key not configured. Please add your Gemini API key in the admin settings or set EMERGENT_LLM_KEY environment variable." },
          { status: 400 }
        ))
      }

      try {
        console.log(`Generating questions for ${examType} - ${section} (count: ${count})`)
        console.log(`Using API key: ${apiKey.substring(0, 10)}...`)

        const prompt = buildExamPrompt(examType, section, count)
        const isEmergentKey = apiKey.startsWith('sk-emergent-')
        let generatedText

        if (isEmergentKey) {
          console.log('Using Emergent AI API')
          const aiResponse = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4.1',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.9,
              max_tokens: 8192,
            })
          })

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text()
            console.error('Emergent AI API error:', aiResponse.status, errorText)
            let errorData
            try {
              errorData = JSON.parse(errorText)
            } catch (e) {
              throw new Error(`AI API request failed (${aiResponse.status}): ${errorText}`)
            }
            throw new Error(errorData.error?.message || `AI API request failed (${aiResponse.status})`)
          }

          const aiData = await aiResponse.json()
          generatedText = aiData.choices[0].message.content
        } else {
          console.log('Using Google Gemini API')
          // Use stable model instead of experimental
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`
          console.log('Gemini API URL:', geminiUrl.replace(apiKey, 'KEY_HIDDEN'))

          const geminiResponse = await fetch(
            geminiUrl,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 8192 }
              })
            }
          )

          if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('Gemini API error:', geminiResponse.status, errorText)
            let errorData
            try {
              errorData = JSON.parse(errorText)
            } catch (e) {
              throw new Error(`Gemini API request failed (${geminiResponse.status}): ${errorText}`)
            }
            throw new Error(errorData.error?.message || `Gemini API request failed (${geminiResponse.status})`)
          }

          const geminiData = await geminiResponse.json()
          console.log('Gemini API response received, candidates:', geminiData.candidates?.length)

          if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
            console.error('Invalid Gemini response structure:', JSON.stringify(geminiData))
            throw new Error('Invalid response from Gemini API - no candidates returned')
          }

          generatedText = geminiData.candidates[0].content.parts[0].text
        }

        let questions
        try {
          const codeBlockMatch = generatedText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
          if (codeBlockMatch) {
            questions = JSON.parse(codeBlockMatch[1].trim())
          } else {
            const arrStart = generatedText.indexOf('[')
            const objStart = generatedText.indexOf('{')

            if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
              let depth = 0, endIdx = -1
              for (let i = arrStart; i < generatedText.length; i++) {
                if (generatedText[i] === '[') depth++
                else if (generatedText[i] === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
              }
              if (endIdx !== -1) {
                questions = JSON.parse(generatedText.substring(arrStart, endIdx + 1))
              }
            } else if (objStart !== -1) {
              let depth = 0, endIdx = -1
              for (let i = objStart; i < generatedText.length; i++) {
                if (generatedText[i] === '{') depth++
                else if (generatedText[i] === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
              }
              if (endIdx !== -1) {
                questions = JSON.parse(generatedText.substring(objStart, endIdx + 1))
              }
            }

            if (!questions) {
              questions = JSON.parse(generatedText)
            }
          }
        } catch (parseErr) {
          console.error('JSON parse error:', parseErr.message)
          console.error('Generated text that failed to parse:', generatedText?.substring(0, 500))
          throw new Error('Failed to parse AI response as JSON: ' + parseErr.message)
        }

        let questionsArray
        if (Array.isArray(questions)) {
          questionsArray = questions
        } else if (questions && typeof questions === 'object') {
          if (questions.id || questions.type || questions.question || questions.prompt) {
            questionsArray = [questions]
          } else if (questions.questions && Array.isArray(questions.questions)) {
            questionsArray = questions.questions
          } else if (questions.data && Array.isArray(questions.data)) {
            questionsArray = questions.data
          } else {
            const vals = Object.values(questions)
            if (vals.length > 0 && typeof vals[0] === 'object' && vals[0] !== null) {
              questionsArray = vals
            } else {
              questionsArray = [questions]
            }
          }
        } else {
          questionsArray = []
        }

        console.log(`Successfully generated ${questionsArray.length} questions`)

        return handleCORS(NextResponse.json({
          examType,
          section,
          questions: questionsArray
        }))

      } catch (error) {
        console.error('AI generation error:', error)
        console.error('Error stack:', error.stack)

        // Fallback to mock questions if AI fails
        console.log('Falling back to mock questions due to AI error')
        const mockQuestions = generateMockQuestions(examType, count, section)

        return handleCORS(NextResponse.json({
          examType,
          section,
          questions: mockQuestions,
          fallback: true,
          error_message: error.message
        }))
      }
    }

    // AI Scoring for Writing and Speaking
    if (route === '/ai/score-answer' && method === 'POST') {
      const body = await request.json()
      const { type, question, answer, rubric } = body

      const apiKey = await getAdminConfig('geminiKey') || process.env.EMERGENT_LLM_KEY

      if (!apiKey) {
        return handleCORS(NextResponse.json(
          { error: "API key not configured." },
          { status: 400 }
        ))
      }

      try {
        let scoringPrompt = ''

        if (type === 'writing') {
          scoringPrompt = `You are an IELTS Writing examiner. Score this response on a scale of 0-9.

Question/Task: ${question}

Student's Answer:
${answer}

Evaluation Criteria: ${rubric || 'Task Response, Coherence & Cohesion'}

Provide a JSON response:
{
  "score": 7.5,
  "feedback": "Detailed feedback",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`
        } else if (type === 'speaking') {
          scoringPrompt = `You are an IELTS Speaking examiner. Score this response on a scale of 0-9.

Question: ${question}

Transcription:
${answer}

Evaluation Criteria: ${rubric || 'Fluency & Coherence'}

Provide a JSON response:
{
  "score": 7.0,
  "feedback": "Detailed feedback",
  "strengths": ["strength 1"],
  "improvements": ["improvement 1"]
}`
        }

        const isEmergentKey = apiKey.startsWith('sk-emergent-')
        let generatedText

        if (isEmergentKey) {
          const aiResponse = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4.1',
              messages: [{ role: 'user', content: scoringPrompt }],
              temperature: 0.7,
              max_tokens: 2048,
            })
          })

          if (!aiResponse.ok) throw new Error('AI scoring failed')
          const aiData = await aiResponse.json()
          generatedText = aiData.choices[0].message.content
        } else {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: scoringPrompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
              })
            }
          )

          if (!geminiResponse.ok) throw new Error('Gemini scoring failed')
          const geminiData = await geminiResponse.json()
          generatedText = geminiData.candidates[0].content.parts[0].text
        }

        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) ||
                         generatedText.match(/\{[\s\S]*\}/)

        let scoring
        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0]
          scoring = JSON.parse(jsonText)
        } else {
          scoring = JSON.parse(generatedText)
        }

        return handleCORS(NextResponse.json(scoring))

      } catch (error) {
        console.error('AI scoring error:', error)
        return handleCORS(NextResponse.json(
          { error: "Failed to score answer: " + error.message },
          { status: 500 }
        ))
      }
    }

    // Save Exam History
    if (route === '/exam-history' && method === 'POST') {
      const body = await request.json()
      const { userId, examType, section, questions, totalQuestions, correctCount, score } = body

      if (!userId || !examType || !section) {
        return handleCORS(NextResponse.json(
          { error: "userId, examType, and section are required" },
          { status: 400 }
        ))
      }

      const record = await saveExamHistory({
        user_id: userId,
        exam_type: examType,
        section,
        questions: questions || [],
        total_questions: totalQuestions || 0,
        correct_count: correctCount || 0,
        score: score || 0
      })

      return handleCORS(NextResponse.json(record))
    }

    // Get Exam History
    if (route.startsWith('/exam-history') && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      const examType = url.searchParams.get('examType')
      const section = url.searchParams.get('section')

      if (!userId) {
        return handleCORS(NextResponse.json(
          { error: "userId is required" },
          { status: 400 }
        ))
      }

      const history = await getExamHistory(userId, examType, section, 50)
      return handleCORS(NextResponse.json(history))
    }

    // Get Admin Config
    if (route === '/admin/config' && method === 'GET') {
      const config = await getAllAdminConfig()

      return handleCORS(NextResponse.json({
        geminiKey: config.geminiKey ? '***configured***' : '',
        stripeKey: config.stripeKey ? '***configured***' : '',
        googleClientId: config.googleClientId ? '***configured***' : '',
        googleClientSecret: config.googleClientSecret ? '***configured***' : '',
        facebookAppId: config.facebookAppId || '',
        facebookAppSecret: config.facebookAppSecret ? '***configured***' : '',
      }))
    }

    // Save Admin Config
    if (route === '/admin/config' && method === 'POST') {
      const body = await request.json()
      const { geminiKey, stripeKey, googleClientId, googleClientSecret, facebookAppId, facebookAppSecret } = body

      try {
        if (geminiKey && !geminiKey.includes('***')) {
          await setAdminConfig('geminiKey', geminiKey)
        }
        if (stripeKey && !stripeKey.includes('***')) {
          await setAdminConfig('stripeKey', stripeKey)
        }
        if (googleClientId && !googleClientId.includes('***')) {
          await setAdminConfig('googleClientId', googleClientId)
        }
        if (googleClientSecret && !googleClientSecret.includes('***')) {
          await setAdminConfig('googleClientSecret', googleClientSecret)
        }
        if (facebookAppId) {
          await setAdminConfig('facebookAppId', facebookAppId)
        }
        if (facebookAppSecret && !facebookAppSecret.includes('***')) {
          await setAdminConfig('facebookAppSecret', facebookAppSecret)
        }

        return handleCORS(NextResponse.json({ success: true }))
      } catch (error) {
        return handleCORS(NextResponse.json(
          { error: 'Failed to save configuration' },
          { status: 500 }
        ))
      }
    }

    // Check OAuth mode
    if (route === '/auth/google/mode' && method === 'GET') {
      const googleClientId = await getAdminConfig('googleClientId')

      return handleCORS(NextResponse.json({
        mode: googleClientId ? 'custom' : 'emergent',
        clientId: googleClientId || null
      }))
    }

    // Custom Google OAuth - Start flow
    if (route === '/auth/google/start' && method === 'POST') {
      const body = await request.json()
      const { redirectUrl } = body

      const googleClientId = await getAdminConfig('googleClientId')

      if (!googleClientId) {
        return handleCORS(NextResponse.json(
          { error: 'Google OAuth not configured' },
          { status: 400 }
        ))
      }

      const callbackUrl = `${redirectUrl.split('/login')[0]}/auth/callback`
      const state = crypto.randomBytes(32).toString('hex')

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(googleClientId)}&` +
        `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `state=${state}`

      return handleCORS(NextResponse.json({ authUrl }))
    }

    // Custom Google OAuth - Callback
    if (route === '/auth/google/custom-callback' && method === 'POST') {
      const body = await request.json()
      const { code, redirectUri } = body

      const googleClientId = await getAdminConfig('googleClientId')
      const googleClientSecret = await getAdminConfig('googleClientSecret')

      if (!googleClientId || !googleClientSecret) {
        return handleCORS(NextResponse.json(
          { error: 'Google OAuth not configured' },
          { status: 400 }
        ))
      }

      try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        })

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token')
        }

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info')
        }

        const userInfo = await userInfoResponse.json()

        const user = await createOrUpdateUser({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          auth_provider: 'google',
          auth_provider_id: userInfo.id
        })

        const sessionToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await createUserSession(user.id, sessionToken, expiresAt)

        return handleCORS(NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            subscription_status: user.subscription_status
          },
          session_token: sessionToken
        }))

      } catch (error) {
        console.error('Custom Google OAuth error:', error)
        return handleCORS(NextResponse.json(
          { error: 'Authentication failed: ' + error.message },
          { status: 401 }
        ))
      }
    }

    // Emergent Auth - Google OAuth Callback
    if (route === '/auth/google-callback' && method === 'POST') {
      const body = await request.json()
      const { sessionId } = body

      if (!sessionId) {
        return handleCORS(NextResponse.json(
          { error: 'session_id is required' },
          { status: 400 }
        ))
      }

      try {
        const authResponse = await fetch('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', {
          method: 'GET',
          headers: {
            'X-Session-ID': sessionId
          }
        })

        if (!authResponse.ok) {
          throw new Error('Failed to get session data')
        }

        const authData = await authResponse.json()

        if (!supabaseServer) {
          return handleCORS(NextResponse.json(
            { error: 'Database not configured' },
            { status: 500 }
          ))
        }

        let user = await getUserByEmail(authData.email)

        if (user) {
          await updateUser(user.id, {
            name: authData.name,
            picture: authData.picture,
            google_id: authData.id,
            last_login: new Date().toISOString()
          })
          user = await getUserByEmail(authData.email)
        } else {
          const newUser = await supabaseServer
            .from('users')
            .insert({
              email: authData.email,
              username: authData.name,
              name: authData.name,
              picture: authData.picture,
              google_id: authData.id,
              premium: false,
              auth_provider: 'google',
              last_login: new Date().toISOString()
            })
            .select()
            .single()

          user = newUser.data
        }

        const sessionToken = authData.session_token || crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await createUserSession(user.id, sessionToken, expiresAt)

        const { password: _, ...safeUser } = user
        return handleCORS(NextResponse.json({
          user: safeUser,
          session_token: sessionToken
        }))

      } catch (error) {
        console.error('Google auth error:', error)
        return handleCORS(NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        ))
      }
    }

    // Payment plans
    const PAYMENT_PLANS = {
      monthly: { amount: 19900, currency: 'thb', name: 'Premium Monthly' },
      yearly: { amount: 149000, currency: 'thb', name: 'Premium Yearly' }
    }

    // Create Checkout Session
    if (route === '/payments/checkout' && method === 'POST') {
      const body = await request.json()
      const { plan, userId, email, originUrl } = body

      if (!plan || !PAYMENT_PLANS[plan]) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid plan' },
          { status: 400 }
        ))
      }

      const planData = PAYMENT_PLANS[plan]
      const stripeApiKey = await getAdminConfig('stripeKey') || process.env.STRIPE_API_KEY

      if (!stripeApiKey) {
        return handleCORS(NextResponse.json(
          { error: 'Payment not configured' },
          { status: 500 }
        ))
      }

      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(stripeApiKey)

        const successUrl = `${originUrl}/pricing?session_id={CHECKOUT_SESSION_ID}`
        const cancelUrl = `${originUrl}/pricing`

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: planData.currency,
              product_data: {
                name: planData.name,
                description: `Carrot School ${planData.name} Subscription`,
              },
              unit_amount: planData.amount,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: email || undefined,
          metadata: {
            user_id: userId || '',
            email: email || '',
            plan: plan,
            plan_name: planData.name
          }
        })

        await createPaymentTransaction({
          session_id: session.id,
          user_id: userId,
          email: email,
          plan: plan,
          amount: planData.amount / 100,
          currency: planData.currency,
          status: 'pending',
          payment_status: 'initiated'
        })

        return handleCORS(NextResponse.json({
          url: session.url,
          session_id: session.id
        }))

      } catch (error) {
        console.error('Stripe checkout error:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to create checkout session: ' + error.message },
          { status: 500 }
        ))
      }
    }

    // Check Payment Status
    if (route.startsWith('/payments/status/') && method === 'GET') {
      const sessionId = route.split('/').pop()

      if (!sessionId) {
        return handleCORS(NextResponse.json(
          { error: 'session_id is required' },
          { status: 400 }
        ))
      }

      try {
        const stripeApiKey = await getAdminConfig('stripeKey') || process.env.STRIPE_API_KEY

        if (!stripeApiKey) {
          return handleCORS(NextResponse.json(
            { error: 'Payment not configured' },
            { status: 500 }
          ))
        }

        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(stripeApiKey)

        const session = await stripe.checkout.sessions.retrieve(sessionId)
        const transaction = await getPaymentTransactionBySessionId(sessionId)

        if (transaction && transaction.payment_status !== 'paid' && session.payment_status === 'paid') {
          await updatePaymentTransaction(sessionId, {
            status: session.status,
            payment_status: session.payment_status,
            updated_at: new Date().toISOString()
          })

          if (transaction.user_id) {
            await updateUser(transaction.user_id, {
              premium: true,
              premium_since: new Date().toISOString(),
              premium_plan: transaction.plan
            })
          } else if (transaction.email) {
            const user = await getUserByEmail(transaction.email)
            if (user) {
              await updateUser(user.id, {
                premium: true,
                premium_since: new Date().toISOString(),
                premium_plan: transaction.plan
              })
            }
          }
        }

        return handleCORS(NextResponse.json({
          status: session.status,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency
        }))

      } catch (error) {
        console.error('Payment status error:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to check payment status' },
          { status: 500 }
        ))
      }
    }

    // Stripe Webhook
    if (route === '/webhook/stripe' && method === 'POST') {
      try {
        const body = await request.text()
        const stripeApiKey = await getAdminConfig('stripeKey') || process.env.STRIPE_API_KEY

        if (!stripeApiKey) {
          return handleCORS(NextResponse.json(
            { error: 'Payment not configured' },
            { status: 500 }
          ))
        }

        const event = JSON.parse(body)

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object

          if (session.payment_status === 'paid') {
            const transaction = await getPaymentTransactionBySessionId(session.id)

            if (transaction && transaction.payment_status !== 'paid') {
              await updatePaymentTransaction(session.id, {
                status: 'completed',
                payment_status: 'paid',
                updated_at: new Date().toISOString()
              })

              const metadata = session.metadata || {}
              if (metadata.user_id) {
                await updateUser(metadata.user_id, {
                  premium: true,
                  premium_since: new Date().toISOString()
                })
              }
            }
          }
        }

        return handleCORS(NextResponse.json({ received: true }))

      } catch (error) {
        console.error('Webhook error:', error)
        return handleCORS(NextResponse.json(
          { error: 'Webhook processing failed' },
          { status: 400 }
        ))
      }
    }

    // Lesson metadata
    const LESSON_META = {
      ielts: {
        name: 'IELTS',
        sections: {
          reading: { name: 'Reading' },
          listening: { name: 'Listening' },
          writing: { name: 'Writing' },
          speaking: { name: 'Speaking' }
        }
      },
      toeic: {
        name: 'TOEIC',
        sections: {
          listening: { name: 'Listening' },
          reading: { name: 'Reading' }
        }
      }
    }

    // Get Lesson Content
    if (route.match(/^\/lessons\/[^\/]+\/[^\/]+\/[^\/]+$/) && method === 'GET') {
      const parts = route.split('/')
      const examId = parts[2]
      const sectionId = parts[3]
      const lessonId = parts[4]

      const examMeta = LESSON_META[examId]
      const sectionMeta = examMeta?.sections[sectionId]

      if (!examMeta || !sectionMeta) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid exam or section' },
          { status: 404 }
        ))
      }

      let lesson = await getLessonByPath(examId, sectionId, lessonId)

      if (!lesson) {
        console.log(`Generating lesson content for ${examId}/${sectionId}/${lessonId}`)

        const apiKey = process.env.EMERGENT_LLM_KEY
        if (!apiKey) {
          return handleCORS(NextResponse.json(
            { error: 'AI not configured' },
            { status: 500 }
          ))
        }

        const lessonPrompt = buildLessonPrompt(examId, sectionId, lessonId)

        try {
          const isEmergentKey = apiKey.startsWith('sk-emergent-')
          let generatedText

          if (isEmergentKey) {
            const aiResponse = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: 'gpt-4.1',
                messages: [
                  {
                    role: 'system',
                    content: 'You are an expert English exam preparation teacher. Generate educational content in Thai language. Return ONLY valid JSON.'
                  },
                  { role: 'user', content: lessonPrompt }
                ],
                temperature: 0.7,
                max_tokens: 8192
              })
            })

            if (!aiResponse.ok) {
              const errorData = await aiResponse.json()
              throw new Error(errorData.error?.message || 'AI API request failed')
            }

            const aiData = await aiResponse.json()
            generatedText = aiData.choices[0].message.content
          } else {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: lessonPrompt }] }],
                  generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                })
              }
            )

            if (!geminiResponse.ok) {
              throw new Error('Gemini API request failed')
            }

            const geminiData = await geminiResponse.json()
            generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          }

          let content = generatedText || ''
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const lessonContent = JSON.parse(content)

          lesson = await createLesson({
            exam_id: examId,
            section_id: sectionId,
            lesson_id: lessonId,
            exam_name: examMeta.name,
            section_name: sectionMeta.name,
            ...lessonContent
          })

        } catch (error) {
          console.error('Lesson generation error:', error)
          return handleCORS(NextResponse.json(
            { error: 'Failed to generate lesson content' },
            { status: 500 }
          ))
        }
      }

      return handleCORS(NextResponse.json(lesson))
    }

    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    ))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
