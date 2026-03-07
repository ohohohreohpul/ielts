import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS, API_BASE } from '../config/theme'

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบ')
      return
    }
    if (password !== confirm) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน')
      return
    }
    if (password.length < 6) {
      Alert.alert('แจ้งเตือน', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ')
      await AsyncStorage.setItem('token', data.token)
      await AsyncStorage.setItem('user', JSON.stringify(data.user))
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    } catch (err) {
      Alert.alert('ผิดพลาด', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoSmall}>
              <Text style={styles.logoSmallLetter}>M</Text>
            </View>
            <Text style={styles.title}>สร้างบัญชีใหม่</Text>
            <Text style={styles.subtitle}>เริ่มต้นฝึกสอบวันนี้ฟรี!</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: 'ชื่อ', icon: 'person-outline', value: name, set: setName, placeholder: 'ชื่อของคุณ', type: 'default' },
              { label: 'อีเมล', icon: 'mail-outline', value: email, set: setEmail, placeholder: 'your@email.com', type: 'email-address' },
            ].map((field, i) => (
              <View key={i} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={field.icon} size={20} color={COLORS.mediumGray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.lightGray}
                    value={field.value}
                    onChangeText={field.set}
                    keyboardType={field.type}
                    autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                  />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>รหัสผ่าน</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.mediumGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  placeholderTextColor={COLORS.lightGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.mediumGray} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.mediumGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  placeholderTextColor={COLORS.lightGray}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPass}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.btnPrimaryText}>สร้างบัญชี</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                มีบัญชีแล้ว? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>เข้าสู่ระบบ</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  backBtn: { marginTop: 12, marginBottom: 8, width: 44, height: 44, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 36 },
  logoSmall: {
    width: 64, height: 64, backgroundColor: COLORS.primary,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  logoSmallLetter: { fontSize: 36, fontWeight: '900', color: COLORS.white },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.black, marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.mediumGray, fontWeight: '500' },
  form: { gap: 18 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.lightGray, borderRadius: 14,
    backgroundColor: COLORS.superLight, height: 56, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: COLORS.black, fontWeight: '500' },
  eyeBtn: { padding: 4 },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { fontSize: 15, color: COLORS.mediumGray, fontWeight: '500' },
})
