import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, Animated, Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, API_BASE } from '../config/theme'

export default function LessonScreen({ route, navigation }) {
  const { exam, section } = route.params
  const [stage, setStage] = useState('loading') // loading | question | feedback | complete
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [hearts, setHearts] = useState(5)
  const [score, setScore] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [aiScore, setAiScore] = useState(null)
  const [scoring, setScoring] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)
  const progressAnim = useRef(new Animated.Value(0)).current

  const q = questions[idx]
  const progress = questions.length > 0 ? ((idx) / questions.length) : 0

  const TIPS = {
    reading: ['อ่านคำถามก่อนอ่านบทความ', 'ใช้เทคนิค Skimming เพื่อจับใจความ', 'ระวังคำ paraphrase ในตัวเลือก', 'ตอบทุกข้อ ไม่ต้องเดาโทษ'],
    listening: ['อ่านตัวเลือกก่อนฟัง', 'จดคำสำคัญขณะฟัง', 'ระวังกับดัก "ได้ยินแต่ไม่ถูก"', 'ฝึกฟัง accent หลายแบบ'],
    writing: ['วางแผนโครงร่าง 5 นาที', 'ใช้ linking words เชื่อมย่อหน้า', 'ตรวจ grammar ก่อนส่ง', 'เขียนให้ครบจำนวนคำ'],
    speaking: ['พูดช้าๆ ชัดๆ ดีกว่าเร็วสับสน', 'ขยายคำตอบด้วยตัวอย่าง', 'อย่ากลัวผิด ให้กล้าพูด', 'ใช้ fillers เช่น "Well, actually..."'],
  }

  useEffect(() => {
    loadQuestions()
    const t = setInterval(() => setTipIdx(p => (p + 1) % 4), 2500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start()
  }, [idx])

  const loadQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: exam === 'toeic' ? 'TOEIC' : 'IELTS',
          section,
          count: 5,
        }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      if (!data.questions?.length) throw new Error('No questions')
      setQuestions(data.questions)
      setStage('question')
    } catch (e) {
      Alert.alert('ผิดพลาด', 'โหลดคำถามไม่ได้ กรุณาลองใหม่', [
        { text: 'ย้อนกลับ', onPress: () => navigation.goBack() }
      ])
    }
  }

  const checkAnswer = async () => {
    if (!q) return
    const type = q.type

    if (['multiple-choice', 'reading', 'listening'].includes(type)) {
      const opt = q.options?.find(o => o.id === selected)
      const correct = !!opt?.correct
      setIsCorrect(correct)
      if (!correct && hearts > 0) setHearts(h => h - 1)
      setStage('feedback')

    } else if (['fill-in-blank', 'completion', 'short-answer'].includes(type)) {
      const userAns = textAnswer.trim().toLowerCase()
      const correctAns = (q.correctAnswer || '').toLowerCase()
      const correct = userAns === correctAns || correctAns.includes(userAns) || userAns.includes(correctAns)
      setIsCorrect(correct)
      if (!correct && hearts > 0) setHearts(h => h - 1)
      setStage('feedback')

    } else if (type === 'true-false-notgiven') {
      const correct = selected?.toUpperCase() === q.correctAnswer?.toUpperCase()
      setIsCorrect(correct)
      if (!correct && hearts > 0) setHearts(h => h - 1)
      setStage('feedback')

    } else if (type === 'writing') {
      if (textAnswer.split(/\s+/).filter(w => w).length < 30) {
        Alert.alert('แจ้งเตือน', 'กรุณาเขียนอย่างน้อย 30 คำ')
        return
      }
      setScoring(true)
      try {
        const res = await fetch(`${API_BASE}/ai/score-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'writing', question: q.prompt, answer: textAnswer }),
        })
        const d = await res.json()
        setAiScore(d)
        setIsCorrect(d.score >= 6)
      } catch { setIsCorrect(true) }
      finally { setScoring(false); setStage('feedback') }
    }
  }

  const nextQuestion = () => {
    if (isCorrect) setScore(s => s + 1)
    if (idx + 1 >= questions.length) {
      setStage('complete')
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setTextAnswer('')
      setAiScore(null)
      setStage('question')
    }
  }

  const canCheck = () => {
    if (!q) return false
    const type = q.type
    if (['multiple-choice', 'reading', 'listening'].includes(type)) return !!selected
    if (type === 'true-false-notgiven') return !!selected
    if (['fill-in-blank', 'completion', 'short-answer'].includes(type)) return textAnswer.trim().length > 0
    if (type === 'writing') return textAnswer.split(/\s+/).filter(w => w).length >= 30
    return false
  }

  // ─── LOADING ───
  if (stage === 'loading') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <View style={styles.loadingIcon}>
            <Ionicons name="sparkles" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.loadingTitle}>AI กำลังสร้างคำถาม</Text>
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginVertical: 20 }} />
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>{(TIPS[section] || TIPS.reading)[tipIdx]}</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // ─── COMPLETE ───
  if (stage === 'complete') {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <SafeAreaView style={styles.completeContainer}>
        <Text style={styles.completeTrophy}>🏆</Text>
        <Text style={styles.completeTitle}>เสร็จแล้ว!</Text>
        <Text style={styles.completeScore}>{score}/{questions.length} ข้อถูก</Text>
        <View style={styles.completeCircle}>
          <Text style={styles.completeCircleText}>{pct}%</Text>
        </View>
        <Text style={styles.completeXP}>+{score * 10} XP ได้รับแล้ว</Text>
        <View style={styles.completeButtons}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => { setIdx(0); setScore(0); setHearts(5); loadQuestions() }} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>ฝึกอีกครั้ง</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.btnSecondaryText}>กลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ─── QUESTION / FEEDBACK ───
  if (!q) return null

  const type = q.type

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.mediumGray} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <Animated.View
            style={[styles.progressFill, {
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
            }]}
          />
        </View>
        <View style={styles.heartsRow}>
          {[...Array(5)].map((_, i) => (
            <Ionicons key={i} name="heart" size={18} color={i < hearts ? COLORS.primary : COLORS.lightGray} />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Passage */}
        {q.passage && (
          <View style={styles.passageCard}>
            <Text style={styles.passageText}>{q.passage}</Text>
          </View>
        )}

        {/* Question */}
        {type !== 'true-false-notgiven' && (
          <Text style={styles.questionText}>{q.question || q.prompt || q.sentence}</Text>
        )}

        {/* Multiple Choice / Reading / Listening */}
        {['multiple-choice', 'reading', 'listening'].includes(type) && q.options && (
          <View style={styles.optionsWrap}>
            {q.options.map((opt, i) => {
              let bg = COLORS.white, border = COLORS.lightGray, textColor = COLORS.black
              if (stage === 'question' && selected === opt.id) { bg = '#FFF3EB'; border = COLORS.primary; textColor = COLORS.primary }
              if (stage === 'feedback') {
                if (opt.correct) { bg = '#F0FFF4'; border = COLORS.success; textColor = COLORS.success }
                else if (selected === opt.id && !opt.correct) { bg = '#FFF5F5'; border = COLORS.error; textColor = COLORS.error }
              }
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => stage === 'question' && setSelected(opt.id)}
                  activeOpacity={stage === 'question' ? 0.75 : 1}
                  disabled={stage === 'feedback'}
                >
                  <View style={[styles.optionLetter, { borderColor: border }]}>
                    <Text style={[styles.optionLetterText, { color: textColor }]}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt.text}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* True/False/Not Given */}
        {type === 'true-false-notgiven' && (
          <View>
            <View style={styles.statementCard}>
              <Text style={styles.statementLabel}>ข้อความ:</Text>
              <Text style={styles.statementText}>{q.statement}</Text>
            </View>
            <View style={styles.optionsWrap}>
              {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => {
                let bg = COLORS.white, border = COLORS.lightGray, textColor = COLORS.black
                if (stage === 'question' && selected === opt) { bg = '#FFF3EB'; border = COLORS.primary; textColor = COLORS.primary }
                if (stage === 'feedback') {
                  if (opt === q.correctAnswer) { bg = '#F0FFF4'; border = COLORS.success; textColor = COLORS.success }
                  else if (selected === opt) { bg = '#FFF5F5'; border = COLORS.error; textColor = COLORS.error }
                }
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionCard, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => stage === 'question' && setSelected(opt)}
                    activeOpacity={stage === 'question' ? 0.75 : 1}
                    disabled={stage === 'feedback'}
                  >
                    <Text style={[styles.tfText, { color: textColor }]}>{opt}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Fill in blank / Short answer */}
        {['fill-in-blank', 'completion', 'short-answer'].includes(type) && (
          <View>
            {q.sentence && (
              <View style={styles.sentenceCard}>
                <Text style={styles.sentenceText}>{q.sentence}</Text>
              </View>
            )}
            <TextInput
              style={[styles.textInput, stage === 'feedback' && { opacity: 0.7 }]}
              placeholder="พิมพ์คำตอบที่นี่..."
              placeholderTextColor={COLORS.lightGray}
              value={textAnswer}
              onChangeText={setTextAnswer}
              editable={stage === 'question'}
              autoCapitalize="none"
            />
            {stage === 'feedback' && (
              <View style={[styles.answerReveal, { borderColor: isCorrect ? COLORS.success : COLORS.error }]}>
                <Text style={[styles.answerRevealLabel, { color: isCorrect ? COLORS.success : COLORS.error }]}>
                  {isCorrect ? '✓ ถูกต้อง!' : `✗ คำตอบที่ถูก: ${q.correctAnswer}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Writing */}
        {type === 'writing' && (
          <View>
            <View style={styles.writingPrompt}>
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
              <Text style={styles.writingPromptText}>{q.prompt}</Text>
            </View>
            <TextInput
              style={[styles.writingInput, stage === 'feedback' && { opacity: 0.7 }]}
              multiline
              placeholder="เขียนคำตอบของคุณที่นี่... (อย่างน้อย 30 คำ)"
              placeholderTextColor={COLORS.lightGray}
              value={textAnswer}
              onChangeText={setTextAnswer}
              editable={stage === 'question'}
              textAlignVertical="top"
            />
            <Text style={styles.wordCount}>
              {textAnswer.split(/\s+/).filter(w => w).length} คำ
            </Text>
            {stage === 'feedback' && aiScore && (
              <View style={styles.aiScoreCard}>
                <View style={styles.aiScoreHeader}>
                  <Text style={styles.aiScoreLabel}>คะแนน AI</Text>
                  <Text style={styles.aiScoreValue}>{aiScore.score}/9</Text>
                </View>
                <Text style={styles.aiScoreFeedback}>{aiScore.feedback}</Text>
              </View>
            )}
          </View>
        )}

        {/* Feedback Banner */}
        {stage === 'feedback' && !aiScore && type !== 'writing' && (
          <View style={[styles.feedbackBanner, { backgroundColor: isCorrect ? '#F0FFF4' : '#FFF5F5', borderColor: isCorrect ? COLORS.success : COLORS.error }]}>
            <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={28} color={isCorrect ? COLORS.success : COLORS.error} />
            <View>
              <Text style={[styles.feedbackTitle, { color: isCorrect ? COLORS.success : COLORS.error }]}>
                {isCorrect ? 'ยอดเยี่ยม! 🎉' : 'เรียนรู้ต่อไป! 💪'}
              </Text>
              {q.explanation && <Text style={styles.feedbackExpl}>{q.explanation}</Text>}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        {stage === 'question' ? (
          <TouchableOpacity
            style={[styles.btnPrimary, !canCheck() && styles.btnDisabled]}
            onPress={checkAnswer}
            disabled={!canCheck() || scoring}
            activeOpacity={0.85}
          >
            {scoring
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.btnPrimaryText}>ตรวจคำตอบ</Text>
            }
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnNext} onPress={nextQuestion} activeOpacity={0.85}>
            <Text style={styles.btnNextText}>
              {idx + 1 >= questions.length ? 'ดูผลลัพธ์' : 'ต่อไป'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingBox: { width: '100%', alignItems: 'center' },
  loadingIcon: { width: 88, height: 88, backgroundColor: COLORS.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  loadingTitle: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginBottom: 4 },
  tipCard: { flexDirection: 'row', gap: 12, backgroundColor: '#FFF3EB', borderRadius: 16, padding: 16, marginTop: 8, width: '100%' },
  tipEmoji: { fontSize: 22 },
  tipText: { flex: 1, fontSize: 14, color: COLORS.darkGray, fontWeight: '500', lineHeight: 20 },

  completeContainer: { flex: 1, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', padding: 32 },
  completeTrophy: { fontSize: 80, marginBottom: 16 },
  completeTitle: { fontSize: 32, fontWeight: '900', color: COLORS.black, marginBottom: 8 },
  completeScore: { fontSize: 18, color: COLORS.mediumGray, fontWeight: '600', marginBottom: 24 },
  completeCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  completeCircleText: { fontSize: 32, fontWeight: '900', color: COLORS.primary },
  completeXP: { fontSize: 16, color: COLORS.mediumGray, fontWeight: '600', marginBottom: 36 },
  completeButtons: { width: '100%', gap: 12 },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  progressWrap: { flex: 1, height: 10, backgroundColor: COLORS.lightGray, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: COLORS.primary, borderRadius: 5 },
  heartsRow: { flexDirection: 'row', gap: 3 },

  scroll: { padding: 20 },

  passageCard: { backgroundColor: COLORS.superLight, borderRadius: 16, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  passageText: { fontSize: 14, color: COLORS.darkGray, lineHeight: 22 },

  questionText: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 20, lineHeight: 26 },

  optionsWrap: { gap: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 2 },
  optionLetter: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  optionLetterText: { fontSize: 15, fontWeight: '800' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 21 },
  tfText: { fontSize: 17, fontWeight: '700', textAlign: 'center', width: '100%', paddingVertical: 4 },

  statementCard: { backgroundColor: '#FFF3EB', borderRadius: 14, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  statementLabel: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  statementText: { fontSize: 15, color: COLORS.darkGray, lineHeight: 22 },

  sentenceCard: { backgroundColor: COLORS.superLight, borderRadius: 14, padding: 14, marginBottom: 14 },
  sentenceText: { fontSize: 15, color: COLORS.darkGray, lineHeight: 22 },
  textInput: { borderWidth: 2, borderColor: COLORS.lightGray, borderRadius: 14, padding: 16, fontSize: 16, color: COLORS.black, backgroundColor: COLORS.superLight, fontWeight: '500', marginBottom: 8 },
  answerReveal: { borderWidth: 2, borderRadius: 12, padding: 12 },
  answerRevealLabel: { fontSize: 15, fontWeight: '700' },

  writingPrompt: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF3EB', borderRadius: 14, padding: 14, marginBottom: 14 },
  writingPromptText: { flex: 1, fontSize: 14, color: COLORS.darkGray, lineHeight: 20 },
  writingInput: { borderWidth: 2, borderColor: COLORS.lightGray, borderRadius: 14, padding: 16, fontSize: 15, color: COLORS.black, backgroundColor: COLORS.superLight, minHeight: 160, marginBottom: 6 },
  wordCount: { fontSize: 12, color: COLORS.mediumGray, textAlign: 'right', marginBottom: 12, fontWeight: '500' },
  aiScoreCard: { backgroundColor: '#FFF3EB', borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  aiScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  aiScoreLabel: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  aiScoreValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  aiScoreFeedback: { fontSize: 13, color: COLORS.darkGray, lineHeight: 19 },

  feedbackBanner: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderWidth: 2, borderRadius: 16, padding: 16, marginTop: 20 },
  feedbackTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  feedbackExpl: { fontSize: 13, color: COLORS.mediumGray, lineHeight: 18 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  btnPrimary: { backgroundColor: COLORS.primary, borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  btnDisabled: { opacity: 0.4 },
  btnPrimaryText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  btnNext: { backgroundColor: COLORS.black, borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnNextText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  btnSecondary: { borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.lightGray },
  btnSecondaryText: { color: COLORS.black, fontSize: 17, fontWeight: '600' },
})
