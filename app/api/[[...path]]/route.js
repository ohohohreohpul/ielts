import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
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
    return `Generate ${count} English Grammar practice questions for ${examType} exam format. Return ONLY a valid JSON array.

CRITICAL REQUIREMENTS:
- Each question MUST have EXACTLY 4 OPTIONS (A, B, C, D)
- MUST have "type": "multiple-choice"
- MUST include "explanation" field IN THAI LANGUAGE explaining the answer
- Questions should match ${examType} difficulty and style

Grammar Topics to Cover:
- Verb tenses (present, past, future, perfect)
- Prepositions (in, on, at, by, for, with)
- Articles (a, an, the)
- Subject-verb agreement
- Conditionals (if clauses)
- Reported speech
- Modal verbs
- Relative clauses
- Passive voice
- Conjunctions

JSON Format:
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
    "explanation": "คำตอบที่ถูกคือ 'goes' เพราะประธาน 'She' เป็นเอกพจน์บุรุษที่ 3 ในรูป Present Simple Tense เราต้องเติม -s/-es ที่ท้ายกริยา ตัวอย่างเพิ่มเติม: He works, She studies"
  }
]

STRICT RULES:
- MUST have exactly 4 options per question
- ONE option must be correct, THREE must be incorrect but plausible
- Explanation MUST be in Thai language with examples
- Return ONLY the JSON array, no other text`
  }

  if (section === 'listening') {
    const formatGuide = examType === 'TOEIC'
      ? `TOEIC LISTENING FORMAT:
- Part 1 (Photos): 4 statements describing an image
- Part 2 (Question-Response): Question + 3 response options
- Part 3 (Conversations): Dialogue + 3 questions with 4 options each
- Part 4 (Talks): Monologue + 3 questions with 4 options each`
      : `IELTS LISTENING FORMAT:
- Section 1: Conversation (booking, arrangements) - form/note completion or multiple choice (4 options)
- Section 2: Monologue (facilities, services) - multiple choice (4 options), matching, map labeling
- Section 3: Academic conversation - multiple choice (4 options) or matching
- Section 4: Academic lecture - completion, multiple choice (4 options)`

    const optionCount = examType === 'TOEIC' ?
      'TOEIC: Part 1 has 4 options, Part 2 has 3 options, Part 3&4 have 4 options each' :
      'IELTS: Most questions have 4 options (A, B, C, D)'

    return `Generate ${count} ${examType} Listening questions following official ${examType} format. Return ONLY a valid JSON array.

${formatGuide}

CRITICAL REQUIREMENTS:
- Follow ${examType} exam format exactly
- ${optionCount}
- MUST have "type": "listening"
- MUST have "audioText" field (50-150 words of natural English dialogue/monologue)
- MUST have "explanation" field IN THAI LANGUAGE
- Questions should test: main idea, specific details, inference, speaker purpose

JSON Format:
[
  {
    "id": "q1",
    "type": "listening",
    "part": "${examType === 'TOEIC' ? 'Part 3' : 'Section 2'}",
    "audioText": "Good morning everyone. I'm pleased to announce that our quarterly sales have exceeded expectations. We've seen a 15% increase compared to last quarter, primarily driven by our new product line launched in March.",
    "question": "What is the main topic of the announcement?",
    "options": [
      {"id": "a", "text": "Product launch", "correct": false},
      {"id": "b", "text": "Quarterly sales results", "correct": true},
      {"id": "c", "text": "Employee promotions", "correct": false},
      {"id": "d", "text": "Company expansion", "correct": false}
    ],
    "explanation": "ผู้พูดเริ่มต้นด้วยการพูดถึง 'quarterly sales' และกล่าวว่ายอดขายเกินความคาดหมาย (exceeded expectations) คำสำคัญ: quarterly sales, 15% increase"
  }
]

STRICT RULES:
- Audio text must be realistic workplace/academic English
- Questions must be clear and test listening comprehension
- Include workplace topics: meetings, announcements, phone calls, presentations
- Explanation in Thai with key vocabulary highlighted
- Return ONLY the JSON array`
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
      return `Generate ${count} IELTS Reading questions following official IELTS format. Return ONLY a valid JSON array.

IELTS READING QUESTION TYPES:
1. Multiple Choice (4 options: A, B, C, D)
2. True/False/Not Given (3 options only)
3. Yes/No/Not Given (3 options only)
4. Matching Headings
5. Sentence Completion
6. Summary Completion

CRITICAL REQUIREMENTS:
- MULTIPLE CHOICE questions MUST have EXACTLY 4 OPTIONS (A, B, C, D)
- TRUE/FALSE/NOT GIVEN questions have exactly 3 options
- Each question needs a 150-250 word passage (academic or general training text)
- MUST include "explanation" IN THAI LANGUAGE
- Passage topics: science, history, society, environment, technology, education

JSON Format Examples:

MULTIPLE CHOICE (4 options):
{
  "id": "q1",
  "type": "reading",
  "questionType": "multiple-choice",
  "passage": "Climate change is one of the most pressing issues facing humanity today. Scientists worldwide agree that global temperatures have risen by approximately 1.1 degrees Celsius since pre-industrial times. This warming is primarily caused by human activities, particularly the burning of fossil fuels which releases greenhouse gases into the atmosphere. The consequences include rising sea levels, extreme weather events, and disruptions to ecosystems.",
  "question": "According to the passage, what is the primary cause of global temperature rise?",
  "options": [
    {"id": "a", "text": "Natural climate cycles", "correct": false},
    {"id": "b", "text": "Burning of fossil fuels", "correct": true},
    {"id": "c", "text": "Rising sea levels", "correct": false},
    {"id": "d", "text": "Extreme weather events", "correct": false}
  ],
  "explanation": "บทความระบุชัดเจนว่า 'primarily caused by human activities, particularly the burning of fossil fuels' คำตอบที่ถูกคือ B เพราะการเผาเชื้อเพลิงฟอสซิลเป็นสาเหตุหลัก"
}

TRUE/FALSE/NOT GIVEN (3 options):
{
  "id": "q2",
  "type": "reading",
  "questionType": "true-false-notgiven",
  "passage": "The Great Wall of China stretches over 13,000 miles and was built over many centuries. Construction began in the 7th century BC and continued until the 17th century AD. While many believe it can be seen from space, this is actually a myth.",
  "statement": "The Great Wall of China is visible from space.",
  "options": [
    {"id": "true", "text": "True", "correct": false},
    {"id": "false", "text": "False", "correct": true},
    {"id": "notgiven", "text": "Not Given", "correct": false}
  ],
  "explanation": "บทความระบุชัดเจนว่า 'this is actually a myth' (นี่เป็นเรื่องเท็จ) ดังนั้นคำตอบคือ False"
}

STRICT RULES:
- Multiple Choice = 4 options (A, B, C, D)
- True/False/Not Given = 3 options only
- Academic vocabulary and complex sentence structures
- Explanation must reference specific text from passage
- Return ONLY the JSON array`
    }

    return `Generate ${count} ${examType} Reading questions following official ${examType} format. Return ONLY a valid JSON array.

TOEIC READING FORMAT:
- Part 5: Incomplete Sentences (grammar/vocabulary) - 4 options
- Part 6: Text Completion (emails, letters) - 4 options
- Part 7: Reading Comprehension (passages) - 4 options

CRITICAL REQUIREMENTS:
- ALL questions MUST have EXACTLY 4 OPTIONS (A, B, C, D)
- Include realistic business contexts: emails, memos, articles, advertisements
- MUST include "explanation" IN THAI LANGUAGE
- Passage length: 100-200 words
- Test: main idea, details, vocabulary, inference

JSON Format:
[
  {
    "id": "q1",
    "type": "reading",
    "passage": "TO: All Staff\nFROM: Human Resources\nDATE: March 15\nSUBJECT: Annual Performance Reviews\n\nPlease be reminded that annual performance reviews will take place during the week of April 3-7. Each employee should schedule a 30-minute meeting with their direct supervisor. Review forms must be completed by March 29 and submitted to HR.",
    "question": "When should employees submit their review forms?",
    "options": [
      {"id": "a", "text": "March 15", "correct": false},
      {"id": "b", "text": "March 29", "correct": true},
      {"id": "c", "text": "April 3", "correct": false},
      {"id": "d", "text": "April 7", "correct": false}
    ],
    "explanation": "ในข้อความระบุว่า 'Review forms must be completed by March 29' (แบบฟอร์มต้องส่งภายในวันที่ 29 มีนาคม) คำว่า 'by' หมายถึงไม่เกินวันนั้น"
  }
]

STRICT RULES:
- MUST have exactly 4 options per question
- Use realistic workplace/business documents
- Questions test reading comprehension skills
- Explanation in Thai with grammar notes if applicable
- Return ONLY the JSON array`
  }

  return `Generate ${count} ${examType} English exam questions. Return ONLY a valid JSON array.

CRITICAL REQUIREMENTS:
- ALL questions MUST have EXACTLY 4 OPTIONS (A, B, C, D)
- MUST include "explanation" field IN THAI LANGUAGE
- Follow ${examType} exam format and difficulty
- Questions should be realistic and practical

JSON Format:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "sentence": "The manager ____ the report before the deadline.",
    "question": "Choose the best answer:",
    "options": [
      {"id": "a", "text": "submit", "correct": false},
      {"id": "b", "text": "submitted", "correct": true},
      {"id": "c", "text": "submitting", "correct": false},
      {"id": "d", "text": "will submit", "correct": false}
    ],
    "explanation": "คำตอบที่ถูกคือ 'submitted' เพราะมีการใช้ Past Simple Tense บอกเล่าเหตุการณ์ที่เกิดขึ้นและสิ้นสุดแล้วในอดีต (ก่อนถึง deadline)"
  }
]

STRICT RULES:
- MUST have exactly 4 options (A, B, C, D) per question
- Each option must be plausible but only one correct
- Explanation in Thai with clear reasoning
- Return ONLY the JSON array`
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
        passage: 'The annual conference will be held in Singapore this year.',
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
async function handleRoute(request, context) {
  const params = await context.params
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if ((route === '/root' || route === '/') && method === 'GET') {
      return handleCORS(NextResponse.json({
        message: "kedikedi API",
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
        openAI: !!config.openAIKey,
        openRouter: !!config.openRouterKey,
        llmProvider: config.llmProvider || 'gemini',
        openRouterModel: config.openRouterModel || 'meta-llama/llama-4-maverick:free'
      }))
    }

    // Admin: Save API Keys
    if (route === '/admin/keys' && method === 'POST') {
      const body = await request.json()
      const { geminiKey, googleTTSKey, elevenLabsKey, openAIKey, openRouterKey, openRouterModel, llmProvider } = body

      if (geminiKey) await setAdminConfig('geminiKey', geminiKey)
      if (googleTTSKey) await setAdminConfig('googleTTSKey', googleTTSKey)
      if (elevenLabsKey) await setAdminConfig('elevenLabsKey', elevenLabsKey)
      if (openAIKey) await setAdminConfig('openAIKey', openAIKey)
      if (openRouterKey) await setAdminConfig('openRouterKey', openRouterKey)
      if (openRouterModel) await setAdminConfig('openRouterModel', openRouterModel)
      if (llmProvider) await setAdminConfig('llmProvider', llmProvider)

      return handleCORS(NextResponse.json({
        success: true,
        message: 'API keys saved successfully'
      }))
    }

    // Serve questions from static JSON banks
    if (route === '/ai/generate-questions' && method === 'POST') {
      const body = await request.json()
      const { examType, section, count = 15 } = body

      // Map examType + section to a JSON file
      const et = (examType || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const sec = (section || '').toLowerCase()

      const fileMap = {
        'ielts-reading': 'ielts-reading.json',
        'ielts-listening': 'ielts-listening.json',
        'ielts-writing': 'ielts-writing.json',
        'ielts-speaking': 'ielts-speaking.json',
        'toeic-reading': 'toeic-reading.json',
        'toeic-listening': 'toeic-listening.json',
        'toefl-reading': 'toefl-reading.json',
        'toefl-listening': 'toefl-listening.json',
        'toefl-writing': 'toefl-writing.json',
        'toefl-speaking': 'toefl-speaking.json',
        'cutep-reading': 'cutep-reading.json',
        'cutep-listening': 'cutep-listening.json',
        'cutep-structure': 'cutep-reading.json',
        'cutep-vocabulary': 'cutep-reading.json',
        'tuget-reading': 'tuget-reading.json',
        'tuget-grammar': 'tuget-reading.json',
        'tuget-vocabulary': 'tuget-reading.json',
        'onet-reading': 'onet-reading.json',
        'onet-grammar': 'onet-reading.json',
        'onet-vocabulary': 'onet-reading.json',
        'grammar-grammar': 'grammar.json',
        'grammar-reading': 'grammar.json',
        'korpor-reading': 'ocsc-reading.json',
        'korpor-grammar': 'ocsc-reading.json',
        'ocsc-reading': 'ocsc-reading.json',
      }

      const key = `${et}-${sec}`
      let fileName = fileMap[key]

      // Fallback: try matching by exam type only
      if (!fileName) {
        const fallbacks = {
          'ielts': 'ielts-reading.json',
          'toeic': 'toeic-reading.json',
          'toefl': 'toefl-reading.json',
          'cutep': 'cutep-reading.json',
          'tuget': 'tuget-reading.json',
          'onet': 'onet-reading.json',
          'grammar': 'grammar.json',
          'korpor': 'ocsc-reading.json',
          'ocsc': 'ocsc-reading.json',
        }
        for (const [k, v] of Object.entries(fallbacks)) {
          if (et.includes(k)) { fileName = v; break }
        }
      }

      if (!fileName) {
        return handleCORS(NextResponse.json(
          { error: `No question bank found for examType="${examType}" section="${section}"` },
          { status: 404 }
        ))
      }

      try {
        const filePath = path.join(process.cwd(), 'data', 'questions', fileName)
        const allQuestions = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

        // Shuffle and return up to `count` questions
        const shuffled = allQuestions.sort(() => Math.random() - 0.5)
        const questions = shuffled.slice(0, Math.min(count, shuffled.length))

        return handleCORS(NextResponse.json({ examType, section, questions }))

      } catch (error) {
        console.error('Static question bank error:', error)
        return handleCORS(NextResponse.json(
          { error: 'Failed to load question bank: ' + error.message },
          { status: 500 }
        ))
      }

    }

    // AI Scoring for Writing and Speaking
    if (route === '/ai/score-answer' && method === 'POST') {
      const body = await request.json()
      const { type, question, answer, rubric } = body

      const llmProvider = await getAdminConfig('llmProvider') || 'gemini'
      const geminiKey = await getAdminConfig('geminiKey')
      const openAIKey = await getAdminConfig('openAIKey')
      const openRouterKey = await getAdminConfig('openRouterKey')
      const openRouterModel = await getAdminConfig('openRouterModel') || 'meta-llama/llama-4-maverick:free'
      const emergentKey = process.env.EMERGENT_LLM_KEY

      let apiKey = null
      let useProvider = llmProvider

      if (llmProvider === 'openrouter' && openRouterKey) {
        apiKey = openRouterKey
        useProvider = 'openrouter'
      } else if (llmProvider === 'openai' && openAIKey) {
        apiKey = openAIKey
        useProvider = 'openai'
      } else if (llmProvider === 'gemini' && geminiKey) {
        apiKey = geminiKey
        useProvider = 'gemini'
      } else if (openRouterKey) {
        apiKey = openRouterKey
        useProvider = 'openrouter'
      } else if (openAIKey) {
        apiKey = openAIKey
        useProvider = 'openai'
      } else if (geminiKey) {
        apiKey = geminiKey
        useProvider = 'gemini'
      } else if (emergentKey) {
        apiKey = emergentKey
        useProvider = emergentKey.startsWith('sk-emergent-') ? 'emergent' : 'openai'
      }

      if (!apiKey) {
        return handleCORS(NextResponse.json(
          { error: "API key not configured. Please configure Gemini, OpenAI, or OpenRouter API key in Admin Console." },
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

        let generatedText

        if (useProvider === 'openrouter') {
          const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://mydemy-ai-exams-w77mqdkq.sites.blink.new',
              'X-Title': 'Mydemy AI Exam App'
            },
            body: JSON.stringify({
              model: openRouterModel,
              messages: [{ role: 'user', content: scoringPrompt }],
              temperature: 0.7,
              max_tokens: 2048,
            })
          })

          if (!aiResponse.ok) throw new Error('OpenRouter scoring failed')
          const aiData = await aiResponse.json()
          generatedText = aiData.choices[0].message.content
        } else if (useProvider === 'openai' || useProvider === 'emergent') {
          const apiUrl = useProvider === 'emergent'
            ? 'https://integrations.emergentagent.com/llm/chat/completions'
            : 'https://api.openai.com/v1/chat/completions'

          const aiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: useProvider === 'emergent' ? 'gpt-4.1' : 'gpt-4o-mini',
              messages: [{ role: 'user', content: scoringPrompt }],
              temperature: 0.7,
              max_tokens: 2048,
            })
          })

          if (!aiResponse.ok) throw new Error('OpenAI scoring failed')
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
        openAIKey: config.openAIKey ? '***configured***' : '',
        openRouterKey: config.openRouterKey ? '***configured***' : '',
        openRouterModel: config.openRouterModel || 'meta-llama/llama-4-maverick:free',
        llmProvider: config.llmProvider || 'gemini',
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
      const { geminiKey, openAIKey, openRouterKey, openRouterModel, llmProvider, stripeKey, googleClientId, googleClientSecret, facebookAppId, facebookAppSecret } = body

      try {
        if (geminiKey && !geminiKey.includes('***')) {
          await setAdminConfig('geminiKey', geminiKey)
        }
        if (openAIKey && !openAIKey.includes('***')) {
          await setAdminConfig('openAIKey', openAIKey)
        }
        if (openRouterKey && !openRouterKey.includes('***')) {
          await setAdminConfig('openRouterKey', openRouterKey)
        }
        if (openRouterModel) {
          await setAdminConfig('openRouterModel', openRouterModel)
        }
        if (llmProvider) {
          await setAdminConfig('llmProvider', llmProvider)
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
                description: `kedikedi ${planData.name} Subscription`,
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

        const llmProvider = await getAdminConfig('llmProvider') || 'gemini'
        const geminiKey = await getAdminConfig('geminiKey')
        const openAIKey = await getAdminConfig('openAIKey')
        const emergentKey = process.env.EMERGENT_LLM_KEY

        let apiKey = null
        let useProvider = llmProvider

        if (llmProvider === 'openai' && openAIKey) {
          apiKey = openAIKey
          useProvider = 'openai'
        } else if (llmProvider === 'gemini' && geminiKey) {
          apiKey = geminiKey
          useProvider = 'gemini'
        } else if (openAIKey) {
          apiKey = openAIKey
          useProvider = 'openai'
        } else if (geminiKey) {
          apiKey = geminiKey
          useProvider = 'gemini'
        } else if (emergentKey) {
          apiKey = emergentKey
          useProvider = emergentKey.startsWith('sk-emergent-') ? 'emergent' : 'openai'
        }

        if (!apiKey) {
          return handleCORS(NextResponse.json(
            { error: 'AI not configured. Please configure Gemini or OpenAI API key in Admin Console.' },
            { status: 500 }
          ))
        }

        const lessonPrompt = buildLessonPrompt(examId, sectionId, lessonId)

        try {
          let generatedText

          if (useProvider === 'openai' || useProvider === 'emergent') {
            const apiUrl = useProvider === 'emergent'
              ? 'https://integrations.emergentagent.com/llm/chat/completions'
              : 'https://api.openai.com/v1/chat/completions'

            const aiResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: useProvider === 'emergent' ? 'gpt-4.1' : 'gpt-4o-mini',
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
              throw new Error(errorData.error?.message || 'OpenAI API request failed')
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
