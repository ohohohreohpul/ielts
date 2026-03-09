# Question Format Quick Reference

This guide shows what format each exam section generates.

## TOEIC Format

### Grammar (Part 5 Style)
- **Options:** 4 (A, B, C, D)
- **Format:** Incomplete sentences
- **Example:** "The company ____ a new product next month."
- **Topics:** Verb tenses, prepositions, articles, word forms

### Reading (Part 7 Style)
- **Options:** 4 (A, B, C, D)
- **Format:** Passage + comprehension questions
- **Passage Length:** 100-200 words
- **Content:** Business emails, memos, reports, advertisements
- **Tests:** Main idea, details, vocabulary, inference

### Listening
- **Part 1 (Photos):** 4 statements
- **Part 2 (Q&A):** 3 response options
- **Part 3 (Conversations):** 4 options per question
- **Part 4 (Talks):** 4 options per question
- **Audio Length:** 50-150 words
- **Context:** Workplace scenarios, announcements, meetings

---

## IELTS Format

### Grammar
- **Options:** 4 (A, B, C, D)
- **Format:** Similar to TOEIC but with more complex structures
- **Topics:** Advanced grammar, academic vocabulary

### Reading

#### Multiple Choice Questions
- **Options:** 4 (A, B, C, D)
- **Passage Length:** 150-250 words
- **Content:** Academic texts (science, history, society)
- **Difficulty:** Higher than TOEIC

#### True/False/Not Given
- **Options:** 3 (True, False, Not Given)
- **Format:** Statements about the passage
- **Tests:** Factual accuracy vs inference

### Listening
- **Options:** Usually 4 (A, B, C, D) for multiple choice
- **Sections:**
  - Section 1: Social conversation (2 people)
  - Section 2: Monologue (1 person)
  - Section 3: Academic discussion (2-4 people)
  - Section 4: Academic lecture (1 person)
- **Audio Length:** 50-150 words per excerpt

### Writing
- **Task 1:** Describe visual data (150 words)
  - Graphs, charts, diagrams, processes, maps
- **Task 2:** Essay response (250 words)
  - Opinion, discussion, problem-solution

### Speaking
- **Part 1:** Introduction (4-5 minutes)
- **Part 2:** Long turn with cue card (3-4 minutes)
- **Part 3:** Discussion (4-5 minutes)

---

## Answer Choice Guidelines

### 4-Option Questions (Most Common)
All incorrect options (distractors) should be:
- **Plausible:** Could seem correct at first glance
- **Wrong for a reason:** Grammar error, context mismatch, or factual inaccuracy
- **Balanced:** Similar length and style to correct answer

Example:
```
Question: "The manager ____ the meeting yesterday."

A) attend        ❌ Wrong tense/form
B) attended      ✅ Correct (past simple)
C) attending     ❌ Wrong form (needs auxiliary)
D) will attend   ❌ Wrong tense (future)
```

### 3-Option Questions (IELTS True/False/Not Given)
- **True:** Information directly stated in text
- **False:** Information contradicts the text
- **Not Given:** Information not mentioned or can't be inferred

---

## Explanation Format

All explanations should be in Thai and include:

1. **Correct answer identification**
   - "คำตอบที่ถูกคือ..."

2. **Reasoning**
   - Grammar rule explanation
   - Reference to text evidence
   - Key vocabulary

3. **Examples (when helpful)**
   - Similar sentence structures
   - Related vocabulary

### Example Explanation (Grammar):
```json
{
  "explanation": "คำตอบที่ถูกคือ 'attended' เพราะมีคำบอกเวลา 'yesterday' ซึ่งบ่งบอกว่าเป็น Past Simple Tense ต้องใช้กริยาช่อง 2 ตัวอย่าง: She visited, They worked, He studied"
}
```

### Example Explanation (Reading):
```json
{
  "explanation": "คำตอบคือ B จากประโยค 'quarterly sales have exceeded expectations' ในบทความ คำว่า 'exceeded' หมายถึง เกินกว่า ดังนั้นยอดขายเกินความคาดหมาย"
}
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This:
- Only 2-3 options (too easy)
- Options that are obviously wrong
- Missing Thai explanations
- Too short or vague explanations
- Unrealistic scenarios

### ✅ Do This:
- Always 4 options (or 3 for True/False/Not Given)
- Plausible distractors
- Detailed Thai explanations with examples
- Realistic business/academic contexts
- Follow official exam formats

---

## Testing Generated Questions

Before deployment, verify:

1. **Option Count:**
   - Multiple choice = 4 options ✓
   - True/False/Not Given = 3 options ✓

2. **Explanation Quality:**
   - Written in Thai ✓
   - Clear reasoning ✓
   - References text or grammar rule ✓
   - Includes examples ✓

3. **Content Quality:**
   - Realistic scenario ✓
   - Appropriate difficulty ✓
   - One clearly correct answer ✓
   - Plausible distractors ✓

4. **Format Compliance:**
   - Matches exam type (TOEIC/IELTS) ✓
   - Correct JSON structure ✓
   - All required fields present ✓
