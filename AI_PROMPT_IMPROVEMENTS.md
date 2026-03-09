# AI Question Generation Improvements

## What Changed

Enhanced the AI prompt system to generate better quality exam questions that follow official exam formats (TOEIC, IELTS).

## Key Improvements

### 1. Standardized Answer Options

**Before:** Questions had 2-3 options (inconsistent)
**After:** All questions now have exactly 4 options (A, B, C, D) except for IELTS True/False/Not Given questions which correctly have 3 options

### 2. Exam-Specific Formats

#### TOEIC
- **Grammar Questions:** 4 options focusing on business English
- **Reading (Part 5-7):** 4 options with realistic workplace documents (emails, memos, reports)
- **Listening (Part 1-4):**
  - Part 1: 4 statements about photos
  - Part 2: 3 response options
  - Part 3-4: 4 options per question

#### IELTS
- **Reading:**
  - Multiple Choice: 4 options (A, B, C, D)
  - True/False/Not Given: 3 options
  - Academic passages (150-250 words)
- **Listening:**
  - Multiple Choice: 4 options
  - Follows 4-section format (conversation → monologue → academic discussion → lecture)
- **Writing:** Task 1 (150 words) and Task 2 (250 words)
- **Speaking:** Part-based questions with timing

### 3. Better Content Quality

#### Enhanced Prompts Include:
- **Specific grammar topics** to cover (tenses, prepositions, modals, etc.)
- **Realistic contexts** (workplace scenarios, academic topics)
- **Detailed instructions** for AI on question structure
- **Thai explanations** required for every answer
- **Quality control rules** (plausible distractors, clear correct answers)

#### Example Grammar Topics Now Covered:
- Verb tenses (present, past, future, perfect)
- Prepositions (in, on, at, by, for, with)
- Articles (a, an, the)
- Subject-verb agreement
- Conditionals (if clauses)
- Reported speech
- Modal verbs (can, could, should, must)
- Relative clauses (who, which, that)
- Passive voice
- Conjunctions

### 4. Thai Explanations

Every question now requires:
- **Clear explanation in Thai** about why the answer is correct
- **Reference to specific grammar rules** or text evidence
- **Examples** where helpful
- **Key vocabulary** highlighted

Example:
```json
{
  "explanation": "คำตอบที่ถูกคือ 'submitted' เพราะมีการใช้ Past Simple Tense บอกเล่าเหตุการณ์ที่เกิดขึ้นและสิ้นสุดแล้วในอดีต (ก่อนถึง deadline)"
}
```

### 5. Listening Question Improvements

**Audio Text Requirements:**
- 50-150 words of natural English
- Realistic workplace dialogues or academic monologues
- Clear context and purpose
- Tests multiple comprehension skills (main idea, details, inference)

**Topics Include:**
- Business meetings
- Phone conversations
- Announcements
- Presentations
- Instructions
- Academic lectures

### 6. Reading Passage Improvements

**TOEIC Reading:**
- Business documents (emails, memos, reports)
- Advertisements and notices
- Articles about workplace topics
- 100-200 words per passage

**IELTS Reading:**
- Academic passages (science, history, technology)
- General training texts (instructions, manuals)
- 150-250 words per passage
- Complex vocabulary and sentence structures

## How It Works

The `buildExamPrompt()` function now:

1. **Identifies the exam type** (TOEIC, IELTS) and section (grammar, reading, listening, writing, speaking)
2. **Loads the appropriate prompt template** with format-specific requirements
3. **Specifies exact JSON structure** the AI must follow
4. **Enforces strict rules** about option count, explanation language, and content quality
5. **Provides clear examples** in the prompt for the AI to follow

## Testing Your Questions

To verify the improvements:

1. Go to the Practice page
2. Select an exam type (TOEIC or IELTS)
3. Choose a section (Grammar, Reading, Listening)
4. Generate questions
5. Verify:
   - ✅ All multiple choice questions have 4 options
   - ✅ Explanations are in Thai
   - ✅ Questions follow official exam format
   - ✅ Distractors (wrong answers) are plausible
   - ✅ Content matches exam difficulty

## Model Compatibility

These enhanced prompts work with:
- ✅ OpenAI (GPT-4, GPT-4o-mini)
- ✅ Gemini (gemini-2.5-flash, gemini-pro)
- ✅ Emergent LLM

The detailed instructions help ensure consistent quality across different AI models.

## Future Enhancements

Potential improvements:
- [ ] Add difficulty levels (beginner, intermediate, advanced)
- [ ] Include official exam scoring rubrics
- [ ] Add more question types (matching, sentence completion)
- [ ] Generate question sets with balanced difficulty
- [ ] Add vocabulary level control
- [ ] Include official exam timing constraints
