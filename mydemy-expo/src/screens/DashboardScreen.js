import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS, API_BASE } from '../config/theme'

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const userData = await AsyncStorage.getItem('user')
      if (!token) { navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] }); return }
      if (userData) setUser(JSON.parse(userData))
      const res = await fetch(`${API_BASE}/auth/session`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Session expired')
      const data = await res.json()
      setUser(data.user)
      await AsyncStorage.setItem('user', JSON.stringify(data.user))
    } catch {
      await AsyncStorage.removeItem('token')
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )

  const streak = 7
  const hearts = 5
  const xp = 350

  const quickActions = [
    { exam: 'toeic', section: 'reading', label: 'TOEIC Reading', icon: 'book', color: COLORS.primary },
    { exam: 'toeic', section: 'listening', label: 'TOEIC Listening', icon: 'headset', color: COLORS.black },
    { exam: 'ielts', section: 'reading', label: 'IELTS Reading', icon: 'document-text', color: COLORS.primary },
    { exam: 'ielts', section: 'writing', label: 'IELTS Writing', icon: 'create', color: COLORS.black },
    { exam: 'ielts', section: 'speaking', label: 'IELTS Speaking', icon: 'mic', color: COLORS.primary },
    { exam: 'ielts', section: 'listening', label: 'IELTS Listening', icon: 'ear', color: COLORS.black },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>สวัสดี! 👋</Text>
            <Text style={styles.userName}>{user?.name || 'นักเรียน'}</Text>
          </View>
          <View style={styles.logoSmall}>
            <Text style={styles.logoSmallLetter}>M</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={22} color="#FF6500" />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <Ionicons name="heart" size={22} color={COLORS.black} />
            <Text style={styles.statValue}>{hearts}</Text>
            <Text style={styles.statLabel}>หัวใจ</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={22} color="#FF6500" />
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        {/* Daily Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalTop}>
            <Text style={styles.goalTitle}>🎯 เป้าหมายวันนี้</Text>
            <Text style={styles.goalPercent}>60%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.goalSub}>ทำไปแล้ว 3 จาก 5 ข้อ</Text>
        </View>

        {/* Quick Start */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>เริ่มฝึกเลย</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Practice')}>
            <Text style={styles.sectionMore}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}
              onPress={() => navigation.navigate('Lesson', { exam: item.exam, section: item.section })}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.actionLabel} numberOfLines={1}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.lightGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Plus Banner */}
        <TouchableOpacity style={styles.plusBanner} activeOpacity={0.85}>
          <View>
            <Text style={styles.plusTitle}>Mydemy Plus 👑</Text>
            <Text style={styles.plusSub}>หัวใจไม่จำกัด + AI Scoring</Text>
          </View>
          <View style={styles.plusBtn}>
            <Text style={styles.plusBtnText}>อัพเกรด</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.superLight },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, marginBottom: 24 },
  greeting: { fontSize: 14, color: COLORS.mediumGray, fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', color: COLORS.black, marginTop: 2 },
  logoSmall: {
    width: 48, height: 48, backgroundColor: COLORS.primary,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  logoSmallLetter: { fontSize: 26, fontWeight: '900', color: COLORS.white },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statCardCenter: { borderTopWidth: 3, borderTopColor: COLORS.primary },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.black },
  statLabel: { fontSize: 11, color: COLORS.mediumGray, fontWeight: '600' },

  goalCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  goalTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  goalPercent: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  progressBg: { height: 10, backgroundColor: COLORS.lightGray, borderRadius: 5, marginBottom: 8 },
  progressFill: { height: 10, backgroundColor: COLORS.primary, borderRadius: 5 },
  goalSub: { fontSize: 13, color: COLORS.mediumGray, fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.black },
  sectionMore: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },

  actionsGrid: { gap: 10, marginBottom: 24 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.black },

  plusBanner: {
    backgroundColor: COLORS.black, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  plusTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginBottom: 3 },
  plusSub: { fontSize: 13, color: '#AAAAAA', fontWeight: '500' },
  plusBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  plusBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
})
