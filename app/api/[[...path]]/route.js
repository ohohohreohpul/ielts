import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// MongoDB connection - with race condition protection
let client
let db
let connectPromise = null

async function connectToMongo() {
  // If already connected and db exists, return it
  if (db) return db
  
  // If connection is in progress, wait for it
  if (connectPromise) {
    await connectPromise
    return db
  }
  
  // Start new connection
  connectPromise = (async () => {
    try {
      if (!client) {
        client = new MongoClient(process.env.MONGO_URL)
      }
      await client.connect()
      db = client.db(process.env.DB_NAME)
    } catch (err) {
      // Reset on error so next request retries
      client = null
      db = null
      connectPromise = null
      throw err
    }
    connectPromise = null
  })()
  
  await connectPromise
  return db
}

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

// Helper function to build Gemini prompts for different exam types
function buildExamPrompt(examType, section, count) {
  // ===== SECTION-SPECIFIC PROMPTS (works for ALL exam types) =====
  
  // GRAMMAR section - dedicated grammar questions
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
    "explanation": "คำตอบที่ถูกคือ 'goes' เพราะประธาน 'She' เป็นเอกพจน์บุรุษที่ 3 ในรูป Present Simple Tense เราต้องเติม -s/-es ที่ท้ายกริยา เช่น He goes, She works, It rains"
  },
  {
    "id": "q2",
    "type": "multiple-choice",
    "sentence": "I have been waiting here ____ two hours.",
    "question": "Choose the correct preposition:",
    "options": [
      {"id": "a", "text": "since", "correct": false},
      {"id": "b", "text": "for", "correct": true},
      {"id": "c", "text": "during", "correct": false},
      {"id": "d", "text": "while", "correct": false}
    ],
    "explanation": "ใช้ 'for' กับช่วงเวลา (duration) เช่น for two hours, for three days ส่วน 'since' ใช้กับจุดเวลา เช่น since Monday, since 2020"
  }
]

Rules:
- "type" MUST be "multiple-choice"
- "explanation" MUST be in THAI language (ภาษาไทย) with clear examples
- Cover various grammar topics
- Generate exactly ${count} grammar questions. Return ONLY the JSON array.`
  }

  // LISTENING prompts - for any exam type
  if (section === 'listening') {
    return `Generate ${count} ${examType} Listening questions. Return ONLY a valid JSON array.

IMPORTANT: 
- Each question MUST have "type": "listening"
- MUST have "audioText" field containing the English text to be spoken
- MUST have "explanation" field IN THAI LANGUAGE (ภาษาไทย) explaining why the answer is correct

Format for listening questions:
[
  {
    "id": "q1",
    "type": "listening",
    "audioText": "Good morning everyone. Today I'd like to discuss our quarterly sales figures. As you can see, we exceeded our targets by 15 percent this quarter.",
    "question": "What is the main topic of the announcement?",
    "options": [
      {"id": "a", "text": "A new product launch", "correct": false},
      {"id": "b", "text": "Quarterly sales performance", "correct": true},
      {"id": "c", "text": "Employee promotions", "correct": false},
      {"id": "d", "text": "Office renovations", "correct": false}
    ],
    "explanation": "ผู้พูดกล่าวว่า 'quarterly sales figures' และ 'exceeded our targets by 15 percent' ซึ่งหมายถึงผลประกอบการยอดขายรายไตรมาส คำสำคัญคือ sales figures = ตัวเลขยอดขาย"
  },
  {
    "id": "q2",
    "type": "listening",
    "audioText": "A: Excuse me, could you tell me how to get to the train station? B: Sure, go straight for two blocks, then turn left. You'll see it on your right.",
    "question": "What does the person ask for?",
    "options": [
      {"id": "a", "text": "Directions to the train station", "correct": true},
      {"id": "b", "text": "The time of the next train", "correct": false},
      {"id": "c", "text": "A ticket price", "correct": false}
    ],
    "explanation": "คนที่ A ถามว่า 'how to get to the train station' แปลว่า 'ไปสถานีรถไฟอย่างไร' ซึ่งเป็นการถามทาง (directions)"
  }
]

Rules:
- "type" MUST be "listening"
- "audioText" MUST contain 20-80 words of dialogue or announcement in English
- "explanation" MUST be in THAI language with key vocabulary translations
- Include a mix of: announcements, conversations, monologues
- Make difficulty appropriate for ${examType} level
- Generate exactly ${count} questions. Return ONLY the JSON array.`
  }

  // WRITING prompts - for any exam type
  if (section === 'writing') {
    if (examType === 'IELTS') {
      return `Generate ${count} IELTS Writing task prompts. Return ONLY a valid JSON array.

IMPORTANT: Alternate between Task 1 and Task 2. Use DIFFERENT topics for each.

For Task 1: Include "chartData" field with numerical data for a chart. Choose ONE chart type: "bar", "line", or "pie".

Task 1 format:
{
  "id": "q1",
  "type": "writing",
  "task": "Task 1",
  "prompt": "The bar chart below shows the percentage of households with internet access in five countries between 2010 and 2020. Summarise the information by selecting and reporting the main features.",
  "chartData": {
    "chartType": "bar",
    "title": "Household Internet Access (%)",
    "xAxisLabel": "Country",
    "yAxisLabel": "Percentage (%)",
    "categories": ["USA", "UK", "Japan", "Brazil", "India"],
    "datasets": [
      {"label": "2010", "data": [75, 82, 78, 41, 7]},
      {"label": "2020", "data": [90, 94, 93, 71, 43]}
    ]
  },
  "wordLimit": 150,
  "rubric": "Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy"
}

Task 2 format:
{
  "id": "q2",
  "type": "writing",
  "task": "Task 2",
  "prompt": "Some people believe that technology has made our lives more complicated. Discuss both views and give your opinion.",
  "wordLimit": 250,
  "rubric": "Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy"
}

Generate exactly ${count} writing tasks. Return ONLY the JSON array.`
    }

    // Generic writing for other exams (TOEFL, CU-TEP, etc.)
    return `Generate ${count} ${examType} Writing prompts. Return ONLY a valid JSON array.

Format:
[
  {
    "id": "q1",
    "type": "writing",
    "task": "Essay Writing",
    "prompt": "Do you agree or disagree with the following statement? Technology has made communication between people easier than ever before. Use specific reasons and examples to support your opinion.",
    "wordLimit": 200,
    "rubric": "Content, Organization, Grammar, Vocabulary"
  },
  {
    "id": "q2",
    "type": "writing",
    "task": "Summary Writing",
    "prompt": "Read the following passage and write a summary in your own words: [Include a 100-150 word passage about education, environment, or technology]",
    "wordLimit": 100,
    "rubric": "Comprehension, Paraphrasing, Conciseness"
  }
]

- "type" MUST be "writing"
- Include essay, summary, or opinion writing tasks
- Make difficulty appropriate for ${examType} level
- Generate exactly ${count} writing prompts. Return ONLY the JSON array.`
  }

  // SPEAKING prompts - for any exam type
  if (section === 'speaking') {
    return `Generate ${count} ${examType} Speaking questions. Return ONLY a valid JSON array.

Format:
[
  {
    "id": "q1",
    "type": "speaking",
    "part": "Part 1",
    "question": "Tell me about your hometown. What do you like most about living there?",
    "preparationTime": 0,
    "speakingTime": 30,
    "rubric": "Fluency, Vocabulary, Grammar, Pronunciation"
  },
  {
    "id": "q2",
    "type": "speaking",
    "part": "Part 2",
    "question": "Describe a memorable trip you have taken. You should say: where you went, who you went with, what you did there, and explain why it was memorable.",
    "preparationTime": 60,
    "speakingTime": 120,
    "rubric": "Fluency, Vocabulary, Grammar, Pronunciation"
  },
  {
    "id": "q3",
    "type": "speaking",
    "part": "Part 3",
    "question": "What are the advantages and disadvantages of traveling abroad?",
    "preparationTime": 0,
    "speakingTime": 60,
    "rubric": "Fluency, Vocabulary, Grammar, Pronunciation"
  }
]

- "type" MUST be "speaking"
- Include a mix of: personal questions, descriptive tasks, opinion/discussion questions
- Make difficulty appropriate for ${examType} level
- Generate exactly ${count} speaking questions. Return ONLY the JSON array.`
  }

  // READING prompts - for any exam type
  if (section === 'reading') {
    if (examType === 'IELTS') {
      return `Generate ${count} IELTS Academic Reading questions. Return ONLY a valid JSON array.

IMPORTANT: Each question MUST include an "explanation" field IN THAI LANGUAGE (ภาษาไทย) explaining why the answer is correct.

Mix these types:

1. TRUE/FALSE/NOT GIVEN:
{
  "id": "q1",
  "type": "true-false-notgiven",
  "passage": "150-200 word academic passage about science, history, or society",
  "statement": "The study found that climate change affects migration patterns.",
  "correctAnswer": "TRUE",
  "explanation": "ในย่อหน้าที่ 2 ระบุว่า 'climate change has significantly impacted bird migration' ซึ่งตรงกับข้อความที่ให้มา จึงตอบ TRUE"
}

2. Multiple Choice:
{
  "id": "q2",
  "type": "reading",
  "passage": "Academic text",
  "question": "According to the passage, what is the main cause?",
  "options": [
    {"id": "a", "text": "option A", "correct": true},
    {"id": "b", "text": "option B", "correct": false},
    {"id": "c", "text": "option C", "correct": false},
    {"id": "d", "text": "option D", "correct": false}
  ],
  "explanation": "คำตอบคือ A เพราะในบทความกล่าวว่า '...' คำสำคัญ: cause = สาเหตุ"
}

3. Completion:
{
  "id": "q3",
  "type": "completion",
  "passage": "Context passage",
  "sentence": "The research was conducted in ____.",
  "correctAnswer": "Southeast Asia",
  "question": "Complete with NO MORE THAN TWO WORDS",
  "wordLimit": 2,
  "explanation": "บทความระบุชัดเจนว่า 'The study took place in Southeast Asia' ดังนั้นคำตอบคือ Southeast Asia"
}

Mix all types. Each must have Thai explanation. Generate exactly ${count} questions. Return ONLY the JSON array.`
    }

    // Generic reading for other exams
    return `Generate ${count} ${examType} Reading questions. Return ONLY a valid JSON array.

IMPORTANT: Each question MUST include an "explanation" field IN THAI LANGUAGE (ภาษาไทย) explaining why the answer is correct with examples.

Format:
[
  {
    "id": "q1",
    "type": "reading",
    "passage": "A 100-150 word passage about business, science, or daily life appropriate for ${examType} level.",
    "question": "What is the main idea of this passage?",
    "options": [
      {"id": "a", "text": "option A", "correct": false},
      {"id": "b", "text": "option B", "correct": true},
      {"id": "c", "text": "option C", "correct": false},
      {"id": "d", "text": "option D", "correct": false}
    ],
    "explanation": "ใจความหลักอยู่ในย่อหน้าแรก คำว่า main idea หมายถึงใจความสำคัญของเรื่อง"
  },
  {
    "id": "q2",
    "type": "multiple-choice",
    "sentence": "The company ____ to expand its operations next year.",
    "question": "Choose the best answer:",
    "options": [
      {"id": "a", "text": "plan", "correct": false},
      {"id": "b", "text": "plans", "correct": true},
      {"id": "c", "text": "planning", "correct": false},
      {"id": "d", "text": "planned", "correct": false}
    ],
    "explanation": "ประธาน 'company' เป็นเอกพจน์ ต้องใช้ 'plans' (เติม -s) ในรูป Present Simple"
  }
]

- Each question MUST have a Thai "explanation" field
- Include a mix of: passage comprehension, vocabulary, grammar in context
- Make difficulty appropriate for ${examType} level
- Generate exactly ${count} reading questions. Return ONLY the JSON array.`
  }

  // ===== GRAMMAR (no sections, just grammar questions) =====
  if (examType === 'Grammar' || examType === 'grammar') {
    return `Generate ${count} English Grammar practice questions. Return ONLY a valid JSON array.

Mix different grammar topics: tenses, prepositions, articles, vocabulary, conditionals, reported speech.

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
    ]
  }
]

Generate exactly ${count} different grammar questions. Return ONLY the JSON array.`
  }

  // ===== FALLBACK: Default reading/multiple-choice =====
  return `Generate ${count} ${examType} English exam questions. Return ONLY a valid JSON array.

Format:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "sentence": "The manager ____ the report before the deadline.",
    "question": "Choose the best answer:",
    "options": [
      {"id": "a", "text": "submits", "correct": false},
      {"id": "b", "text": "submitted", "correct": true},
      {"id": "c", "text": "submitting", "correct": false},
      {"id": "d", "text": "submit", "correct": false}
    ]
  },
  {
    "id": "q2",
    "type": "reading",
    "passage": "A 50-100 word passage",
    "question": "What is the main idea?",
    "options": [
      {"id": "a", "text": "option A", "correct": false},
      {"id": "b", "text": "option B", "correct": true},
      {"id": "c", "text": "option C", "correct": false},
      {"id": "d", "text": "option D", "correct": false}
    ]
  }
]

Make difficulty appropriate for ${examType} level. Generate exactly ${count} questions. Return ONLY the JSON array.`
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Mock AI-generated questions
const generateMockQuestions = (examType = 'TOEIC', count = 10) => {
  const questionTypes = ['multiple-choice', 'reorder', 'reading']
  const questions = []

  for (let i = 0; i < count; i++) {
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]
    
    if (type === 'multiple-choice') {
      questions.push({
        id: `q${i + 1}`,
        type: 'multiple-choice',
        question: `${examType} Question ${i + 1}`,
        text: 'The company ____ a new product next month.',
        options: [
          { id: 'a', text: 'launch', correct: false },
          { id: 'b', text: 'will launch', correct: true },
          { id: 'c', text: 'launching', correct: false },
          { id: 'd', text: 'launched', correct: false }
        ]
      })
    } else if (type === 'reorder') {
      questions.push({
        id: `q${i + 1}`,
        type: 'reorder',
        question: 'Arrange the words to form a correct sentence:',
        words: [
          { id: 'w1', text: 'carefully', order: 3 },
          { id: 'w2', text: 'The', order: 1 },
          { id: 'w3', text: 'document', order: 2 },
          { id: 'w4', text: 'review', order: 4 }
        ],
        correctOrder: ['w2', 'w3', 'w1', 'w4']
      })
    } else {
      questions.push({
        id: `q${i + 1}`,
        type: 'reading',
        passage: 'The annual conference will be held in Singapore this year. Participants from over 30 countries are expected to attend.',
        question: 'Where will the conference be held?',
        options: [
          { id: 'a', text: 'Thailand', correct: false },
          { id: 'b', text: 'Singapore', correct: true },
          { id: 'c', text: 'Malaysia', correct: false },
          { id: 'd', text: 'Indonesia', correct: false }
        ]
      })
    }
  }

  return questions
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint
    if ((route === '/root' || route === '/') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Carrot School API",
        version: "1.0.0",
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

      // Check if user exists
      const existingUser = await db.collection('users').findOne({ email })
      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        ))
      }

      // Create new user
      const userId = uuidv4()
      const user = {
        id: userId,
        name,
        email,
        password: hashPassword(password),
        streak: 0,
        hearts: 5,
        totalXP: 0,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }

      await db.collection('users').insertOne(user)

      // Create token
      const token = createToken(userId)
      await db.collection('sessions').insertOne({
        id: uuidv4(),
        userId,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })

      // Return user (without password)
      const { password: _, _id, ...userResponse } = user
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

      // Find user
      const user = await db.collection('users').findOne({ email })
      if (!user || user.password !== hashPassword(password)) {
        return handleCORS(NextResponse.json(
          { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
          { status: 401 }
        ))
      }

      // Update last login
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { lastLoginAt: new Date() } }
      )

      // Create token
      const token = createToken(user.id)
      await db.collection('sessions').insertOne({
        id: uuidv4(),
        userId: user.id,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })

      // Return user (without password)
      const { password: _, _id, ...userResponse } = user
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
        await db.collection('sessions').deleteMany({ token })
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

      const session = await db.collection('sessions').findOne({
        token,
        expiresAt: { $gt: new Date() }
      })

      if (!session) {
        return handleCORS(NextResponse.json(
          { error: "Invalid or expired session" },
          { status: 401 }
        ))
      }

      const user = await db.collection('users').findOne({ id: session.userId })
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        ))
      }

      const { password: _, _id, ...userResponse } = user
      return handleCORS(NextResponse.json({ user: userResponse }))
    }

    // Generate AI Mock Exam (simulated with delay)
    if (route === '/generate-exam' && method === 'POST') {
      const body = await request.json()
      const { examType = 'TOEIC', questionCount = 10 } = body

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const questions = generateMockQuestions(examType, questionCount)
      
      const exam = {
        id: uuidv4(),
        examType,
        questions,
        createdAt: new Date(),
        totalQuestions: questions.length
      }

      // Save to database
      await db.collection('exams').insertOne(exam)

      const { _id, ...examData } = exam
      return handleCORS(NextResponse.json(examData))
    }

    // Get all lessons
    if (route === '/lessons' && method === 'GET') {
      const lessons = await db.collection('exams')
        .find({})
        .limit(50)
        .toArray()

      const cleanedLessons = lessons.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedLessons))
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

      const progress = {
        id: uuidv4(),
        userId,
        lessonId,
        score,
        completedAt: completedAt || new Date(),
        createdAt: new Date()
      }

      await db.collection('progress').insertOne(progress)
      
      const { _id, ...progressData } = progress
      return handleCORS(NextResponse.json(progressData))
    }

    // Get user progress
    if (route.startsWith('/progress/') && method === 'GET') {
      const userId = route.split('/').pop()
      
      const userProgress = await db.collection('progress')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()

      const cleanedProgress = userProgress.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedProgress))
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

      const user = {
        id: userId,
        name,
        goal,
        streak,
        hearts,
        updatedAt: new Date()
      }

      await db.collection('users').updateOne(
        { id: userId },
        { $set: user },
        { upsert: true }
      )

      return handleCORS(NextResponse.json(user))
    }

    // Get user by ID
    if (route.startsWith('/user/') && method === 'GET') {
      const userId = route.split('/').pop()
      
      const user = await db.collection('users').findOne({ id: userId })
      
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        ))
      }

      const { _id, ...userData } = user
      return handleCORS(NextResponse.json(userData))
    }

    // Admin: Get API Keys status
    if (route === '/admin/keys' && method === 'GET') {
      const config = await db.collection('config').findOne({ type: 'api_keys' })
      
      return handleCORS(NextResponse.json({
        gemini: !!config?.geminiKey,
        googleTTS: !!config?.googleTTSKey,
        elevenLabs: !!config?.elevenLabsKey,
        openAI: !!config?.openAIKey
      }))
    }

    // Admin: Save API Keys
    if (route === '/admin/keys' && method === 'POST') {
      const body = await request.json()
      const { geminiKey, googleTTSKey, elevenLabsKey, openAIKey } = body

      const updateData = {
        type: 'api_keys',
        updatedAt: new Date()
      }

      if (geminiKey) updateData.geminiKey = geminiKey
      if (googleTTSKey) updateData.googleTTSKey = googleTTSKey
      if (elevenLabsKey) updateData.elevenLabsKey = elevenLabsKey
      if (openAIKey) updateData.openAIKey = openAIKey

      await db.collection('config').updateOne(
        { type: 'api_keys' },
        { $set: updateData },
        { upsert: true }
      )

      return handleCORS(NextResponse.json({ 
        success: true,
        message: 'API keys saved successfully'
      }))
    }

    // Generate AI questions using LLM (Emergent proxy or admin-configured key)
    if (route === '/ai/generate-questions' && method === 'POST') {
      const body = await request.json()
      const { examType, section, count = 5 } = body

      // Debug logging
      console.log('=== AI Generate Questions ===')
      console.log('examType:', examType)
      console.log('section:', section)
      console.log('count:', count)

      // Get API key: use admin-configured key first, fallback to Emergent key
      const config = await db.collection('config').findOne({ type: 'api_keys' })
      const apiKey = config?.geminiKey || process.env.EMERGENT_LLM_KEY

      if (!apiKey) {
        return handleCORS(NextResponse.json(
          { error: "API key not configured." },
          { status: 400 }
        ))
      }

      try {
        const prompt = buildExamPrompt(examType, section, count)
        
        // Use Emergent LLM proxy (OpenAI-compatible) or direct Gemini based on key type
        const isEmergentKey = apiKey.startsWith('sk-emergent-')
        let generatedText

        if (isEmergentKey) {
          // Use Emergent proxy with OpenAI format
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
            const errorData = await aiResponse.json()
            throw new Error(errorData.error?.message || 'AI API request failed')
          }

          const aiData = await aiResponse.json()
          generatedText = aiData.choices[0].message.content
        } else {
          // Use direct Gemini API
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
            const errorData = await geminiResponse.json()
            throw new Error(errorData.error?.message || 'Gemini API request failed')
          }

          const geminiData = await geminiResponse.json()
          generatedText = geminiData.candidates[0].content.parts[0].text
        }
        
        // Extract JSON from response - robust extraction
        let questions
        try {
          // Try code block extraction first
          const codeBlockMatch = generatedText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
          if (codeBlockMatch) {
            questions = JSON.parse(codeBlockMatch[1].trim())
          } else {
            // Find the outermost JSON array or object
            const arrStart = generatedText.indexOf('[')
            const objStart = generatedText.indexOf('{')
            
            if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
              // Find matching bracket
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
          console.error('JSON parse error, raw text:', generatedText.substring(0, 500))
          throw new Error('Failed to parse AI response as JSON: ' + parseErr.message)
        }

        // Ensure it's an array of question objects
        let questionsArray
        if (Array.isArray(questions)) {
          questionsArray = questions
        } else if (questions && typeof questions === 'object') {
          // Check if it's a single question object (has 'id' or 'type' or 'question' or 'prompt')
          if (questions.id || questions.type || questions.question || questions.prompt) {
            questionsArray = [questions]
          } else if (questions.questions && Array.isArray(questions.questions)) {
            questionsArray = questions.questions
          } else if (questions.data && Array.isArray(questions.data)) {
            questionsArray = questions.data
          } else {
            // Last resort: try Object.values but only if they are objects
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

        return handleCORS(NextResponse.json({
          examType,
          section,
          questions: questionsArray
        }))

      } catch (error) {
        console.error('AI generation error:', error)
        return handleCORS(NextResponse.json(
          { error: "Failed to generate questions: " + error.message },
          { status: 500 }
        ))
      }
    }

    // AI Scoring for Writing and Speaking
    if (route === '/ai/score-answer' && method === 'POST') {
      const body = await request.json()
      const { type, question, answer, rubric } = body

      // Get API key: use admin-configured key first, fallback to Emergent key
      const config = await db.collection('config').findOne({ type: 'api_keys' })
      const apiKey = config?.geminiKey || process.env.EMERGENT_LLM_KEY

      if (!apiKey) {
        return handleCORS(NextResponse.json(
          { error: "API key not configured." },
          { status: 400 }
        ))
      }

      try {
        let scoringPrompt = ''
        
        if (type === 'writing') {
          scoringPrompt = `You are an IELTS Writing examiner. Score this response on a scale of 0-9 (IELTS band score).

Question/Task: ${question}

Student's Answer:
${answer}

Evaluation Criteria: ${rubric || 'Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy'}

Provide a JSON response with ONLY this structure, no extra text:
{
  "score": 7.5,
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve 1", "area to improve 2"]
}`
        } else if (type === 'speaking') {
          scoringPrompt = `You are an IELTS Speaking examiner. Score this spoken response on a scale of 0-9 (IELTS band score).

Question: ${question}

Transcription of Student's Speech:
${answer}

Evaluation Criteria: ${rubric || 'Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation'}

Provide a JSON response with ONLY this structure, no extra text:
{
  "score": 7.0,
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve 1", "area to improve 2"]
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
        
        // Extract JSON
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

      const record = {
        id: uuidv4(),
        userId,
        examType,
        section,
        questions: questions || [],
        totalQuestions: totalQuestions || 0,
        correctCount: correctCount || 0,
        score: score || 0,
        completedAt: new Date(),
        createdAt: new Date()
      }

      await db.collection('exam_history').insertOne(record)
      const { _id, ...recordData } = record
      return handleCORS(NextResponse.json(recordData))
    }

    // Get Exam History (with filters)
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

      const filter = { userId }
      if (examType) filter.examType = examType
      if (section) filter.section = section

      const history = await db.collection('exam_history')
        .find(filter)
        .sort({ completedAt: -1 })
        .limit(50)
        .toArray()

      const cleanedHistory = history.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedHistory))
    }

    // Route not found
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

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
