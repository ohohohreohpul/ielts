import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS } from '../config/theme'

export default function ProgressScreen({ navigation }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => { if (u) try { setUser(JSON.parse(u)) } catch {} })
  }, [])

  const weekDays = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
  const weekData = [3, 5, 2, 0, 4, 6, 1]
  const maxVal = Math.max(...weekData)

  const skills = [
    { icon: 'book', label: 'Reading', sub: 'การอ่าน', pct: 72, xp: 180, color: COLORS.primary },
    { icon: 'headset', label: 'Listening', sub: 'การฟัง', pct: 58, xp: 145, color: COLORS.black },
    { icon: 'create', label: 'Writing', sub: 'การเขียน', pct: 45, xp: 112, color: COLORS.primary },
    { icon: 'mic', label: 'Speaking', sub: 'การพูด', pct: 30, xp: 75, color: COLORS.black },
  ]

  const history = [
    { exam: 'TOEIC Reading', date: 'วันนี้', score: 85, correct: 4, total: 5, xp: 50 },
    { exam: 'IELTS Listening', date: 'เมื่อวาน', score: 70, correct: 3, total: 5, xp: 40 },
    { exam: 'TOEIC Reading', date: '2 วันก่อน', score: 90, correct: 5, total: 5, xp: 55 },
    { exam: 'IELTS Writing', date: '3 วันก่อน', score: 75, correct: 2, total: 3, xp: 45 },
  ]

  const scoreColor = (s) => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ความก้าวหน้า</Text>
        <Text style={styles.headerSub}>ติดตามพัฒนาการของคุณ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'flame', val: '7', label: 'วัน Streak' },
            { icon: 'star', val: '350', label: 'XP รวม' },
            { icon: 'trophy', val: '12', label: 'บทเรียน' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, i === 1 && styles.statCardHighlight]}>
              <Ionicons name={s.icon} size={20} color={i === 1 ? COLORS.white : COLORS.primary} />
              <Text style={[styles.statVal, i === 1 && { color: COLORS.white }]}>{s.val}</Text>
              <Text style={[styles.statLabel, i === 1 && { color: 'rgba(255,255,255,0.8)' }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>กิจกรรมสัปดาห์นี้</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>+21 ข้อ</Text>
            </View>
          </View>
          <View style={styles.chart}>
            {weekDays.map((day, i) => {
              const barH = maxVal > 0 && weekData[i] > 0 ? Math.max((weekData[i] / maxVal) * 72, 10) : 4
              const isToday = i === 6
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrap}>
                    <View style={[styles.bar, { height: barH, backgroundColor: isToday ? COLORS.primary : weekData[i] > 0 ? '#FFCBA4' : COLORS.lightGray }]} />
                  </View>
                  <Text style={[styles.dayLabel, isToday && { color: COLORS.primary, fontWeight: '700' }]}>{day}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Skills */}
        <Text style={styles.sectionTitle}>ทักษะแต่ละด้าน</Text>
        <View style={styles.skillsWrap}>
          {skills.map((sk, i) => (
            <View key={i} style={styles.skillCard}>
              <View style={[styles.skillIcon, { backgroundColor: sk.color + '15' }]}>
                <Ionicons name={sk.icon} size={20} color={sk.color} />
              </View>
              <View style={styles.skillInfo}>
                <View style={styles.skillTop}>
                  <View>
                    <Text style={styles.skillLabel}>{sk.label}</Text>
                    <Text style={styles.skillSub}>{sk.sub}</Text>
                  </View>
                  <Text style={[styles.skillPct, { color: sk.color }]}>{sk.pct}%</Text>
                </View>
                <View style={styles.skillBarBg}>
                  <View style={[styles.skillBarFill, { width: `${sk.pct}%`, backgroundColor: sk.color }]} />
                </View>
                <Text style={styles.skillXP}>{sk.xp} XP</Text>
              </View>
            </View>
          ))}
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>ประวัติการฝึก</Text>
        <View style={styles.historyWrap}>
          {history.map((item, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={[styles.historyDot, { backgroundColor: scoreColor(item.score) }]} />
              <View style={styles.historyInfo}>
                <Text style={styles.historyExam}>{item.exam}</Text>
                <Text style={styles.historyDate}>{item.date} • {item.correct}/{item.total} ข้อถูก</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyScore, { color: scoreColor(item.score) }]}>{item.score}%</Text>
                <Text style={styles.historyXP}>+{item.xp} XP</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
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

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statCardHighlight: { backgroundColor: COLORS.primary },
  statVal: { fontSize: 20, fontWeight: '900', color: COLORS.black },
  statLabel: { fontSize: 9, color: COLORS.mediumGray, fontWeight: '600', textAlign: 'center' },

  card: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  pill: { backgroundColor: '#FFF3EB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barWrap: { height: 72, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '100%', borderRadius: 6 },
  dayLabel: { fontSize: 11, color: COLORS.mediumGray, fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 12, marginTop: 4 },

  skillsWrap: { gap: 10, marginBottom: 24 },
  skillCard: {
    flexDirection: 'row', gap: 14, backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  skillIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  skillInfo: { flex: 1 },
  skillTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  skillLabel: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  skillSub: { fontSize: 11, color: COLORS.mediumGray },
  skillPct: { fontSize: 16, fontWeight: '900' },
  skillBarBg: { height: 6, backgroundColor: COLORS.lightGray, borderRadius: 3, marginBottom: 4 },
  skillBarFill: { height: 6, borderRadius: 3 },
  skillXP: { fontSize: 11, color: COLORS.mediumGray, fontWeight: '500' },

  historyWrap: { gap: 10 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.white,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  historyDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  historyInfo: { flex: 1 },
  historyExam: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  historyDate: { fontSize: 12, color: COLORS.mediumGray, marginTop: 1 },
  historyRight: { alignItems: 'flex-end' },
  historyScore: { fontSize: 18, fontWeight: '900' },
  historyXP: { fontSize: 11, color: COLORS.mediumGray, fontWeight: '500' },
})
