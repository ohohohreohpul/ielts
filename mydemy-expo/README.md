# Mydemy - Expo App 🍊

แอพ iOS/Android สำหรับฝึกสอบ TOEIC & IELTS ด้วย AI

---

## วิธีติดตั้งและรันบนโทรศัพท์ (5 ขั้นตอน)

### ขั้นตอนที่ 1: ติดตั้ง Node.js
ดาวน์โหลดจาก https://nodejs.org (แนะนำ LTS version)

### ขั้นตอนที่ 2: ติดตั้ง Expo Go บน iPhone
ไปที่ App Store → ค้นหา **"Expo Go"** → ติดตั้ง

### ขั้นตอนที่ 3: ดาวน์โหลดโค้ดนี้แล้ว `npm install`
```bash
# เข้าไปในโฟลเดอร์ mydemy-expo
cd mydemy-expo

# ติดตั้ง dependencies
npm install
```

### ขั้นตอนที่ 4: รัน Expo
```bash
npx expo start
```

### ขั้นตอนที่ 5: สแกน QR Code
- เปิดแอพ **Expo Go** บน iPhone
- สแกน QR Code ที่ขึ้นในหน้าจอคอมพิวเตอร์
- แอพจะโหลดบนโทรศัพท์ทันที! 🎉

---

## หน้าจอทั้งหมด
- 🟠 **Welcome** - หน้าต้อนรับ
- 🔑 **Login / Signup** - เข้าสู่ระบบ / สมัคร
- 🏠 **Dashboard** - หน้าหลัก + สถิติ
- 📚 **Practice** - เลือกข้อสอบ (TOEIC / IELTS)
- 🎯 **Lesson** - ทำข้อสอบด้วย AI
- 📊 **Progress** - ความก้าวหน้า
- 👤 **Profile** - โปรไฟล์และตั้งค่า

## API Backend
แอพเชื่อมต่อกับ Backend ที่:
```
https://exam-ai-debug.preview.emergentagent.com/api
```

---

## สำหรับ Apple App Store
เมื่อพร้อม submit ขึ้น App Store:
1. สมัคร Apple Developer Account ($99/ปี)
2. ติดตั้ง `eas-cli`: `npm install -g eas-cli`
3. `eas build --platform ios`
4. Submit ผ่าน App Store Connect
