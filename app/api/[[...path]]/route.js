import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

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

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
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
          '/user'
        ]
      }))
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
