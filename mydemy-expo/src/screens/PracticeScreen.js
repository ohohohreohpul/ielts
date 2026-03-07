import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../config/theme'

const EXAMS = [
  {
    id: 'toeic',
    name: 'TOEIC',
    desc: 'Test of English for International Communication',
    sections: [
      { id: 'reading', label: 'Reading', icon: 'book', sublabel: 'Part 5-7: Grammar & Comprehension' },
      { id: 'listening', label: 'Listening', icon: 'headset', sublabel: 'Part 1-4: Photos & Conversations' },
    ]
  },
  {
    id: 'ielts',
    name: 'IELTS',
    desc: 'International English Language Testing System',
    sections: [
      { id: 'reading', label: 'Reading', icon: 'document-text', sublabel: 'Academic & General Training' },
      { id: 'listening', label: 'Listening', icon: 'ear', sublabel: 'Conversations & Monologues' },
      { id: 'writing', label: 'Writing', icon: 'create', sublabel: 'Task 1 & 2 Essays' },
      { id: 'speaking', label: 'Speaking', icon: 'mic', sublabel: 'Part 1-3 Interview' },
    ]
  }
]

export default function PracticeScreen({ navigation }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>เลือกข้อสอบ</Text>
        <Text style={styles.headerSub}>ฝึกทีละพาร์ท ค่อยๆ เก่งขึ้น</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {EXAMS.map((exam) => (
          <View key={exam.id} style={styles.examBlock}>
            {/* Exam Card */}
            <TouchableOpacity
              style={[styles.examCard, expanded === exam.id && styles.examCardActive]}
              onPress={() => setExpanded(expanded === exam.id ? null : exam.id)}
              activeOpacity={0.8}
            >
              <View style={styles.examCardLeft}>
                <View style={[styles.examBadge, expanded === exam.id && styles.examBadgeActive]}>
                  <Text style={[styles.examBadgeText, expanded === exam.id && styles.examBadgeTextActive]}>
                    {exam.name}
                  </Text>
                </View>
                <Text style={styles.examDesc}>{exam.desc}</Text>
              </View>
              <Ionicons
                name={expanded === exam.id ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={expanded === exam.id ? COLORS.primary : COLORS.mediumGray}
              />
            </TouchableOpacity>

            {/* Sections */}
            {expanded === exam.id && (
              <View style={styles.sections}>
                {exam.sections.map((sec) => (
                  <TouchableOpacity
                    key={sec.id}
                    style={styles.sectionCard}
                    onPress={() => navigation.navigate('Lesson', { exam: exam.id, section: sec.id })}
                    activeOpacity={0.75}
                  >
                    <View style={styles.sectionIconWrap}>
                      <Ionicons name={sec.icon} size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.sectionInfo}>
                      <Text style={styles.sectionLabel}>{sec.label}</Text>
                      <Text style={styles.sectionSublabel}>{sec.sublabel}</Text>
                    </View>
                    <View style={styles.startBtn}>
                      <Text style={styles.startBtnText}>เริ่ม</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Tips */}
        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>เคล็ดลับ</Text>
            <Text style={styles.tipDesc}>ฝึกทุกวันวันละ 10 นาที ดีกว่าฝึกนานๆ สัปดาห์ละครั้ง</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.superLight },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.black },
  headerSub: { fontSize: 14, color: COLORS.mediumGray, marginTop: 3, fontWeight: '500' },
  scroll: { padding: 20, paddingBottom: 100 },

  examBlock: { marginBottom: 16 },
  examCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  examCardActive: { borderColor: COLORS.primary },
  examCardLeft: { flex: 1, marginRight: 12 },
  examBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.lightGray,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 8,
  },
  examBadgeActive: { backgroundColor: COLORS.primary },
  examBadgeText: { fontSize: 16, fontWeight: '800', color: COLORS.mediumGray },
  examBadgeTextActive: { color: COLORS.white },
  examDesc: { fontSize: 13, color: COLORS.mediumGray, fontWeight: '500', lineHeight: 18 },

  sections: { marginTop: 8, gap: 8 },
  sectionCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginLeft: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionIconWrap: {
    width: 48, height: 48, backgroundColor: '#FFF3EB',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  sectionInfo: { flex: 1 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  sectionSublabel: { fontSize: 12, color: COLORS.mediumGray, marginTop: 2, fontWeight: '500' },
  startBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  startBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  tipBox: {
    flexDirection: 'row', gap: 14, backgroundColor: COLORS.white,
    borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  tipIcon: { fontSize: 24 },
  tipText: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
  tipDesc: { fontSize: 13, color: COLORS.mediumGray, lineHeight: 18 },
})
