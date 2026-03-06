import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
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
  const prompts = {
    'TOEIC': {
      'reading': `Generate ${count} TOEIC Reading questions in MIXED TYPES (Part 5, Part 7). Return ONLY valid JSON array:

Part 5 - Incomplete Sentences (grammar/vocabulary, 4 choices):
{
  "id": "q1",
  "type": "multiple-choice",
  "sentence": "The company ____ to expand its operations next year.",
  "question": "Choose the best option to complete the sentence:",
  "options": [
    {"id": "a", "text": "plan", "correct": false},
    {"id": "b", "text": "plans", "correct": true},
    {"id": "c", "text": "planning", "correct": false},
    {"id": "d", "text": "planned", "correct": false}
  ]
}

Part 7 - Reading Comprehension (business passages, 2-4 questions):
{
  "id": "q2",
  "type": "reading",
  "passage": "50-100 word business email, memo, or article",
  "question": "What is the main purpose of this message?",
  "options": [
    {"id": "a", "text": "option A", "correct": false},
    {"id": "b", "text": "option B", "correct": true},
    {"id": "c", "text": "option C", "correct": false},
    {"id": "d", "text": "option D", "correct": false}
  ]
}

Mix both types in the array.`,
      'listening': `Generate ${count} TOEIC Listening questions in MIXED TYPES. Return JSON:

Part 2 - Question-Response (3 response choices):
{
  "id": "q1",
  "type": "listening",
  "audioText": "When is the meeting scheduled?",
  "question": "Choose the best response:",
  "options": [
    {"id": "a", "text": "At 3 PM tomorrow.", "correct": true},
    {"id": "b", "text": "In the conference room.", "correct": false},
    {"id": "c", "text": "Yes, I'll attend.", "correct": false}
  ]
}

Part 3 - Conversations (short dialogue, 3 questions):
{
  "id": "q2",
  "type": "listening",
  "audioText": "A: Did you finish the report? B: Yes, I sent it this morning. A: Great, thanks!",
  "question": "What did the man do this morning?",
  "options": [
    {"id": "a", "text": "Wrote a report", "correct": false},
    {"id": "b", "text": "Sent a report", "correct": true},
    {"id": "c", "text": "Received a report", "correct": false},
    {"id": "d", "text": "Read a report", "correct": false}
  ]
}`
    },
    'IELTS': {
      'reading': `Generate ${count} IELTS Academic Reading questions with OFFICIAL TYPES. Return JSON array:

1. TRUE/FALSE/NOT GIVEN (most common):
{
  "id": "q1",
  "type": "true-false-notgiven",
  "passage": "150-250 word academic passage",
  "statement": "The study found that climate change affects migration patterns.",
  "correctAnswer": "TRUE"
}

2. Multiple Choice:
{
  "id": "q2",
  "type": "reading",
  "passage": "Academic text about science/history/society",
  "question": "According to the passage, what is the main cause?",
  "options": [
    {"id": "a", "text": "option A", "correct": true},
    {"id": "b", "text": "option B", "correct": false},
    {"id": "c", "text": "option C", "correct": false},
    {"id": "d", "text": "option D", "correct": false}
  ]
}

3. Sentence/Summary/Note Completion (NO MORE THAN TWO WORDS):
{
  "id": "q3",
  "type": "completion",
  "passage": "Context passage with specific information",
  "sentence": "The research was conducted in ____ and lasted three years.",
  "correctAnswer": "Southeast Asia",
  "question": "Complete with NO MORE THAN TWO WORDS from the passage",
  "wordLimit": 2
}

4. Short Answer Questions:
{
  "id": "q4",
  "type": "short-answer",
  "passage": "Passage with factual details",
  "question": "In what year was the theory proposed?",
  "correctAnswer": "1998",
  "wordLimit": 1
}

Mix all 4 types.`,
      'listening': `Generate ${count} IELTS Listening questions with OFFICIAL TYPES. Return JSON:

1. Multiple Choice:
{
  "id": "q1",
  "type": "listening",
  "audioText": "Conversation or monologue 40-60 words",
  "question": "What is the speaker's main point?",
  "options": [
    {"id": "a", "text": "option A", "correct": false},
    {"id": "b", "text": "option B", "correct": true},
    {"id": "c", "text": "option C", "correct": false}
  ]
}

2. Form/Note Completion (specific information):
{
  "id": "q2",
  "type": "completion",
  "audioText": "Conversation with specific details (names, dates, places)",
  "sentence": "The appointment is scheduled for ____.",
  "correctAnswer": "next Tuesday",
  "question": "Complete with NO MORE THAN TWO WORDS",
  "wordLimit": 2
}`,
      'writing': `Generate ${count} IELTS Writing prompts. Return JSON:

Task 1 (describe visual data):
{
  "id": "q1",
  "type": "writing",
  "task": "Task 1",
  "prompt": "The graph shows the percentage of internet users in five countries from 2010 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  "wordLimit": 150,
  "timeLimit": 20,
  "rubric": "Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy"
}

Task 2 (argumentative essay):
{
  "id": "q2",
  "type": "writing",
  "task": "Task 2",
  "prompt": "Some people believe that technology has made our lives more complicated. Others think it has made things easier. Discuss both views and give your own opinion.",
  "wordLimit": 250,
  "timeLimit": 40,
  "rubric": "Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy"
}`,
      'speaking': `Generate ${count} IELTS Speaking questions across 3 parts. Return JSON:

Part 1 (4-5 minutes, personal questions):
{
  "id": "q1",
  "type": "speaking",
  "part": "Part 1",
  "question": "Do you enjoy reading books? Why or why not?",
  "preparationTime": 0,
  "speakingTime": 20,
  "rubric": "Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation"
}

Part 2 (2-minute monologue with cue card):
{
  "id": "q2",
  "type": "speaking",
  "part": "Part 2",
  "question": "Describe a place you visited that left a strong impression on you. You should say: where it was, when you went there, what you did there, and explain why it was memorable.",
  "preparationTime": 60,
  "speakingTime": 120,
  "rubric": "Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation"
}

Part 3 (4-5 minutes, abstract discussion):
{
  "id": "q3",
  "type": "speaking",
  "part": "Part 3",
  "question": "How has tourism changed in your country over the past 20 years?",
  "preparationTime": 0,
  "speakingTime": 40,
  "rubric": "Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation"
}`
    }
  }

  return prompts[examType]?.[section] || `Generate ${count} exam questions for ${examType} ${section}`
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
        message: "Mydemy API",
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
        googleTTS: !!config?.googleTTSKey
      }))
    }

    // Admin: Save API Keys
    if (route === '/admin/keys' && method === 'POST') {
      const body = await request.json()
      const { geminiKey, googleTTSKey } = body

      const updateData = {
        type: 'api_keys',
        updatedAt: new Date()
      }

      if (geminiKey) updateData.geminiKey = geminiKey
      if (googleTTSKey) updateData.googleTTSKey = googleTTSKey

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

    // Generate AI questions using Gemini
    if (route === '/ai/generate-questions' && method === 'POST') {
      const body = await request.json()
      const { examType, section, count = 5 } = body

      // Get Gemini API key from config
      const config = await db.collection('config').findOne({ type: 'api_keys' })
      
      if (!config?.geminiKey) {
        return handleCORS(NextResponse.json(
          { error: "Gemini API key not configured. Please set it in the admin console." },
          { status: 400 }
        ))
      }

      try {
        // Call Gemini API
        const prompt = buildExamPrompt(examType, section, count)
        
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              }
            })
          }
        )

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.json()
          throw new Error(errorData.error?.message || 'Gemini API request failed')
        }

        const geminiData = await geminiResponse.json()
        const generatedText = geminiData.candidates[0].content.parts[0].text
        
        // Extract JSON from response
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                         generatedText.match(/\{[\s\S]*\}/) ||
                         generatedText.match(/\[[\s\S]*\]/)
        
        let questions
        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0]
          questions = JSON.parse(jsonText)
        } else {
          questions = JSON.parse(generatedText)
        }

        // Ensure it's an array
        const questionsArray = Array.isArray(questions) ? questions : questions.questions || []

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

      // Get Gemini API key from config
      const config = await db.collection('config').findOne({ type: 'api_keys' })
      
      if (!config?.geminiKey) {
        return handleCORS(NextResponse.json(
          { error: "Gemini API key not configured." },
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

Provide a JSON response with:
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

Provide a JSON response with:
{
  "score": 7.0,
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve 1", "area to improve 2"]
}`
        }

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: scoringPrompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              }
            })
          }
        )

        if (!geminiResponse.ok) {
          throw new Error('Gemini scoring failed')
        }

        const geminiData = await geminiResponse.json()
        const generatedText = geminiData.candidates[0].content.parts[0].text
        
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
