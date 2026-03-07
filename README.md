# Mydemy - AI-Powered Mock Exams

🎓 A mobile-first web application for AI-powered Mock Exams (TOEIC, IELTS, CU-TEP) with Duolingo-style UX.

## ✨ Features

### 🎯 Onboarding Flow
- Goal selection with 3 exam types:
  - TOEIC 700+ (Business English proficiency)
  - IELTS 7.0+ (Academic excellence)
  - CU-TEP Advanced (University standard)
- Smooth animations with Framer Motion
- Beautiful gradient backgrounds

### 📚 Interactive Lesson Runner

**Question Types:**
1. **Multiple Choice** - Large, tappable cards with hover effects
2. **Sentence Reordering** - Drag-and-drop interface using @dnd-kit
3. **Reading Comprehension** - Split view with passage and questions

**Features:**
- Animated progress bar showing completion percentage
- Smooth Framer Motion transitions between questions
- Mobile-optimized touch interactions

### 🎮 Gamification Engine

**Hearts System:**
- Start with 5 hearts ❤️
- Lose 1 heart for each wrong answer
- "Refill with Premium" modal appears at 0 hearts

**Streak Counter:**
- Daily login/lesson tracker 🔥
- Fire icon animation
- Displayed in header

**Feedback System:**
- ✅ Green success drawer: "Excellent!" for correct answers
- ❌ Red error drawer: "Keep learning!" with correct answer shown
- Immediate feedback after answering

### 💎 Mydemy Plus (Paywall)

**Monthly Plan ($9.99/month):**
- Unlimited Hearts
- AI Speaking Score
- Personalized Lessons

**Yearly Plan ($79.99/year - Save 33%):**
- All Monthly features
- Priority Support
- Early Access to Features

### 🎨 Design System

**Colors:**
- Primary: Green gradient (from-green-500 to-green-600)
- Success: Green (green-50, green-500)
- Error: Red (red-50, red-500)
- Premium: Purple gradient (from-purple-500 to-purple-600)
- Background: Multi-gradient (from-blue-50 via-purple-50 to-pink-50)

**Components:**
- Shadcn/UI components
- Lucide React icons
- Framer Motion animations
- @dnd-kit for drag-and-drop

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **UI Components:** Shadcn/UI
- **Icons:** Lucide React
- **Drag & Drop:** @dnd-kit
- **Database:** MongoDB
- **State Management:** React Hooks (useState, useEffect)

## 📁 Project Structure

```
/app
├── app/
│   ├── page.js              # Main lesson runner component
│   ├── layout.js            # Root layout with metadata
│   ├── globals.css          # Global styles
│   └── api/[[...path]]/
│       └── route.js         # API routes
├── components/
│   └── ui/                  # Shadcn components
├── lib/
│   └── utils.js            # Utility functions
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Generate AI Mock Exam
```bash
POST /api/generate-exam
Content-Type: application/json

{
  "examType": "TOEIC",
  "questionCount": 10
}

Response: {
  "id": "uuid",
  "examType": "TOEIC",
  "questions": [...],
  "totalQuestions": 10,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get All Lessons
```bash
GET /api/lessons

Response: [{
  "id": "uuid",
  "examType": "TOEIC",
  "questions": [...],
  "totalQuestions": 10
}]
```

### Save User Progress
```bash
POST /api/progress
Content-Type: application/json

{
  "userId": "user123",
  "lessonId": "lesson-1",
  "score": 85,
  "completedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get User Progress
```bash
GET /api/progress/{userId}

Response: [{
  "id": "uuid",
  "userId": "user123",
  "lessonId": "lesson-1",
  "score": 85,
  "completedAt": "2024-01-01T00:00:00.000Z"
}]
```

### Create/Update User
```bash
POST /api/user
Content-Type: application/json

{
  "userId": "user123",
  "name": "John Doe",
  "goal": "toeic-700",
  "streak": 5,
  "hearts": 5
}
```

### Get User
```bash
GET /api/user/{userId}

Response: {
  "id": "user123",
  "name": "John Doe",
  "goal": "toeic-700",
  "streak": 5,
  "hearts": 5
}
```

## 📱 Mobile-First Design

- Optimized for portrait mobile view (375x812)
- Touch-friendly tap targets
- Smooth animations and transitions
- Responsive layouts with Tailwind
- Maximum scale prevented for better mobile experience

## 🎯 User Flow

1. **Onboarding** → Select goal (TOEIC/IELTS/CU-TEP)
2. **Start Lesson** → Begin with animated intro
3. **Answer Questions** → Multiple choice, reordering, or reading
4. **Get Feedback** → Immediate response with correct answer
5. **Track Progress** → Hearts, streak, and progress bar
6. **Complete Lesson** → Trophy animation and stats
7. **Upgrade (Optional)** → Mydemy Plus when hearts run out

## 🚦 Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open browser
http://localhost:3000
```

## 🔧 Environment Variables

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=mydemy_db
NEXT_PUBLIC_BASE_URL=https://exam-ai-debug.preview.emergentagent.com
CORS_ORIGINS=*
```

## 🎨 Key UI Components

### Onboarding Cards
- Animated entry with staggered delays
- Click to select with visual feedback
- Icon + title + description layout

### Question Cards
- Large tappable areas
- Color-coded feedback (blue=selected, green=correct, red=incorrect)
- Smooth hover states

### Progress Bar
- Animated width transitions
- Percentage-based completion
- Sticky header position

### Feedback Drawer
- Slides up from bottom
- Icon + message + action button
- Auto-advance on continue

### Paywall Modal
- Two pricing tiers (monthly/yearly)
- Feature comparison
- Call-to-action buttons

## 🔮 Future Enhancements

- [ ] Real AI integration (OpenAI GPT-4 for question generation)
- [ ] Speaking practice with voice recognition
- [ ] Social features (leaderboards, friend challenges)
- [ ] Spaced repetition algorithm
- [ ] Offline mode with PWA
- [ ] Dark mode support
- [ ] Multiple language support
- [ ] Payment integration (Stripe)
- [ ] Push notifications for streak reminders
- [ ] Detailed analytics dashboard

## 📊 Data Schema

See `data-schema.json` for complete question format specification.

## 🎬 Demo

The app demonstrates:
- ✅ Smooth onboarding flow
- ✅ Multiple question types
- ✅ Drag-and-drop reordering
- ✅ Immediate feedback system
- ✅ Hearts and streak tracking
- ✅ Lesson completion celebration
- ✅ Premium upgrade paywall

## 🛠️ Development Notes

- Uses Next.js App Router (not Pages Router)
- All animations use Framer Motion
- Drag-and-drop uses @dnd-kit (mobile-friendly)
- MongoDB for data persistence
- No external API calls in demo mode
- Mock AI generation with 2-second delay

## 📝 License

MIT License - Feel free to use for your own projects!

---

**Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion**
