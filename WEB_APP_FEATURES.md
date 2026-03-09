# Carrot School - Full-Stack Web Application

This is now a **complete full-stack web application** with Supabase backend integration.

## 🌐 Web App Features

### Backend Infrastructure
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Custom email/password + OAuth support (Google)
- **API Routes**: RESTful API built with Next.js API routes
- **Session Management**: Server-side session handling with JWT-like tokens
- **Real-time Data**: Persistent storage for all user data

### Database Schema
The app uses Supabase with the following tables:

1. **users** - User accounts with authentication
   - Email/password authentication
   - OAuth providers (Google)
   - Premium status tracking
   - Gamification (hearts, streak, XP)

2. **admin_config** - Admin configuration (API keys)
   - Gemini AI API key
   - Stripe payment keys
   - OAuth credentials

3. **user_sessions** - Session management
   - Token-based authentication
   - Expiration tracking

4. **exams** - Generated exam questions
   - AI-generated questions
   - User-specific exams

5. **lessons** - AI-generated lesson content
   - Structured learning materials
   - Section-based organization

6. **progress** - User learning progress
   - Lesson completion tracking
   - Score history

7. **exam_history** - Exam attempt records
   - Detailed question history
   - Performance analytics

8. **payment_transactions** - Payment tracking
   - Stripe integration
   - Premium subscription management

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/session` - Current session validation
- `POST /api/auth/google-callback` - OAuth callback

#### AI Question Generation
- `POST /api/ai/generate-questions` - Generate exam questions using LLM
  - Supports: TOEIC, IELTS, TOEFL, CU-TEP, TU-GET, O-NET, กพ.
  - Sections: Reading, Listening, Writing, Speaking, Grammar
  - AI-powered with explanations in Thai

- `POST /api/ai/score-answer` - AI scoring for Writing/Speaking
  - Band scores (0-9 for IELTS)
  - Detailed feedback
  - Strengths & improvements

#### User & Progress
- `POST /api/user` - Create/update user profile
- `GET /api/user/:userId` - Get user by ID
- `POST /api/progress` - Save lesson progress
- `GET /api/progress/:userId` - Get user progress
- `POST /api/exam-history` - Save exam attempt
- `GET /api/exam-history` - Get exam history

#### Lessons
- `GET /api/lessons/:exam/:section/:lesson` - Get/generate lesson content
  - Auto-generates content using AI if not exists
  - Caches in database for performance

#### Payments
- `POST /api/payments/checkout` - Create Stripe checkout
- `GET /api/payments/status/:sessionId` - Check payment status
- `POST /api/webhook/stripe` - Stripe webhook handler

#### Admin
- `GET /api/admin/config` - Get admin configuration
- `POST /api/admin/config` - Save admin configuration
- `GET /api/admin/keys` - Check API key status
- `POST /api/admin/keys` - Save API keys

### Key Features

#### 1. AI-Powered Question Generation
- Uses Gemini 2.5 Flash or GPT-4.1 (via Emergent AI)
- Generates authentic exam questions
- Thai language explanations
- Multiple question types:
  - Multiple choice
  - Reading comprehension
  - Listening comprehension
  - True/False/Not Given
  - Sentence completion
  - Short answer
  - Writing tasks (Task 1 & 2)
  - Speaking prompts

#### 2. AI Scoring System
- Automated scoring for Writing tasks
- Automated scoring for Speaking (with transcription)
- Band score (0-9 scale)
- Detailed feedback
- Strengths and improvement areas

#### 3. Gamification System
- Hearts system (5 hearts, lose 1 per wrong answer)
- Streak counter (daily login tracking)
- XP points system
- Progress tracking
- Completion badges

#### 4. Premium Subscription
- Stripe payment integration
- Two plans:
  - Monthly: ฿199/month
  - Yearly: ฿1,490/year (33% savings)
- Features:
  - Unlimited hearts
  - Access to all exam types
  - AI scoring for Writing/Speaking
  - All premium lessons

#### 5. Exam Types Supported
Free:
- TOEIC (Reading, Listening)
- Grammar Practice

Premium:
- IELTS (Reading, Listening, Writing, Speaking)
- TOEFL (Reading, Listening, Writing, Speaking)
- CU-TEP (Reading, Listening)
- TU-GET (Reading)
- O-NET (Reading)
- กพ. (Reading)

#### 6. Progressive Web App (PWA)
- Installable on mobile/desktop
- Offline capabilities
- App-like experience
- Push notifications ready

#### 7. Mobile-First Design
- Optimized for touch interactions
- Responsive layouts
- Bottom navigation
- Smooth animations (Framer Motion)
- iOS safe area support

### Technical Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Framer Motion (animations)
- Shadcn/UI components
- Lucide React (icons)

**Backend:**
- Supabase (PostgreSQL)
- Next.js API Routes
- Stripe (payments)
- Row Level Security (RLS)

**AI Integration:**
- Google Gemini 2.5 Flash
- Emergent AI (GPT-4.1)
- Text-to-Speech ready

**Authentication:**
- Custom email/password
- OAuth (Google)
- Session-based tokens
- Secure password hashing (SHA-256)

### Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Admin-only operations protected
   - Secure by default

2. **Session Management**
   - Token expiration (30 days)
   - Server-side validation
   - Secure token storage

3. **Password Security**
   - SHA-256 hashing
   - No plain-text storage

4. **API Security**
   - CORS configured
   - Environment variable protection
   - Service role key for admin operations

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://frlmnzyxeyshqnfnrdyh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMERGENT_LLM_KEY=(optional - for AI features)
STRIPE_API_KEY=(optional - for payments)
```

### Admin Panel
Access at `/admin` to configure:
- Gemini API Key
- Stripe API Key
- Google OAuth credentials
- Facebook OAuth credentials

### Data Flow

1. **User Registration/Login**
   - User signs up via email/password or OAuth
   - Session created in database
   - Token stored in localStorage
   - User redirected to dashboard

2. **Practice Flow**
   - User selects exam type and section
   - AI generates questions via API
   - Questions displayed with interactive UI
   - Answers validated and scored
   - Progress saved to database

3. **Premium Upgrade**
   - User selects plan on /pricing
   - Stripe checkout session created
   - Payment processed
   - Webhook updates user premium status
   - Instant access to premium features

4. **Lesson Learning**
   - User navigates to lesson
   - AI generates lesson content (if not cached)
   - Content saved to database
   - User reads structured lesson
   - Completion tracked

### Performance Optimizations

- Static generation for public pages
- Dynamic rendering for user pages
- Database query optimization with indexes
- Lesson content caching
- Image optimization (Next.js)
- Code splitting
- Lazy loading

### Deployment Ready

The app is production-ready and can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting

Database is already deployed on Supabase.

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

4. **Configure Admin Settings:**
   - Visit `/admin`
   - Add your Gemini API key for AI features
   - Add Stripe key for payments (optional)

---

This is now a **fully functional web application** with backend, database, authentication, payments, and AI integration!
