import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS } from '../config/theme'

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => {
      if (u) try { setUser(JSON.parse(u)) } catch {}
    })
  }, [])

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'ต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('token')
          await AsyncStorage.removeItem('user')
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
        }
      }
    ])
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const badges = [
    { emoji: '🔥', label: 'Streak 7', ok: true },
    { emoji: '⭐', label: 'XP 100', ok: true },
    { emoji: '📚', label: 'TOEIC', ok: true },
    { emoji: '🎯', label: 'Perfect', ok: false },
    { emoji: '💎', label: 'IELTS', ok: false },
    { emoji: '🚀', label: 'Speed', ok: false },
    { emoji: '👑', label: 'Master', ok: false },
    { emoji: '🌟', label: 'Legend', ok: false },
  ]

  const menu = [
    { icon: 'notifications-outline', label: 'การแจ้งเตือน', sub: 'เปิดการแจ้งเตือนรายวัน' },
    { icon: 'diamond-outline', label: 'Mydemy Plus', sub: 'หัวใจไม่จำกัด + AI Scoring', orange: true },
    { icon: 'shield-outline', label: 'ความเป็นส่วนตัว', sub: 'จัดการข้อมูลของคุณ' },
    { icon: 'help-circle-outline', label: 'ช่วยเหลือ', sub: 'คำถามที่พบบ่อย' },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar Header */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'นักเรียน'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.freePill}>
            <Ionicons name="sparkles" size={14} color={COLORS.primary} />
            <Text style={styles.freePillText}>Free Plan</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'flame', val: '7', label: 'วัน Streak', color: COLORS.primary },
            { icon: 'star', val: '350', label: 'XP รวม', color: COLORS.primary },
            { icon: 'book', val: '12', label: 'บทเรียน', color: COLORS.black },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, i === 1 && styles.statCardHighlight]}>
              <Ionicons name={s.icon} size={22} color={i === 1 ? COLORS.white : s.color} />
              <Text style={[styles.statVal, i === 1 && { color: COLORS.white }]}>{s.val}</Text>
              <Text style={[styles.statLabel, i === 1 && { color: 'rgba(255,255,255,0.8)' }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>🏅 เหรียญรางวัล</Text>
        <View style={styles.badgesGrid}>
          {badges.map((b, i) => (
            <View key={i} style={[styles.badgeCard, !b.ok && styles.badgeLocked]}>
              <Text style={[styles.badgeEmoji, !b.ok && { opacity: 0.25 }]}>{b.emoji}</Text>
              <Text style={[styles.badgeLabel, !b.ok && { opacity: 0.4 }]}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <Text style={styles.sectionTitle}>⚙️ ตั้งค่า</Text>
        <View style={styles.menuCard}>
          {menu.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < menu.length - 1 && styles.menuRowBorder, item.orange && styles.menuRowOrange]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, item.orange && styles.menuIconBoxOrange]}>
                <Ionicons name={item.icon} size={20} color={item.orange ? COLORS.white : COLORS.darkGray} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, item.orange && { color: COLORS.primary }]}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.superLight },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', paddingTop: 28, paddingBottom: 24 },
  avatar: {
    width: 88, height: 88, borderRadius: 28, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: COLORS.white },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginBottom: 3 },
  userEmail: { fontSize: 14, color: COLORS.mediumGray, fontWeight: '500', marginBottom: 10 },
  freePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF3EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  freePillText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statCardHighlight: { backgroundColor: COLORS.primary },
  statVal: { fontSize: 20, fontWeight: '900', color: COLORS.black },
  statLabel: { fontSize: 10, color: COLORS.mediumGray, fontWeight: '600', textAlign: 'center' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 12 },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  badgeCard: {
    width: '22%', backgroundColor: COLORS.white, borderRadius: 14,
    padding: 10, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  badgeLocked: { backgroundColor: COLORS.superLight },
  badgeEmoji: { fontSize: 26 },
  badgeLabel: { fontSize: 9, color: COLORS.mediumGray, fontWeight: '600', textAlign: 'center' },

  menuCard: {
    backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.superLight },
  menuRowOrange: { backgroundColor: '#FFF9F5' },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.superLight, alignItems: 'center', justifyContent: 'center' },
  menuIconBoxOrange: { backgroundColor: COLORS.primary },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  menuSub: { fontSize: 12, color: COLORS.mediumGray, marginTop: 1 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: '#FEE2E2', borderRadius: 16, height: 52, backgroundColor: '#FFF5F5',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
})
