# FED UP

> **AI for the tired, the lost, the real.**

![FED UP Logo](public/fedup-logo.png)

---

## ❓ What’s FED UP?

**FED UP** is an AI-powered emotional support platform for people who are mentally tired, emotionally drained, or just done pretending everything's okay. It listens, understands, and talks like someone who’s been there—no fake positivity, no productivity hacks, just real support.

---

## ✨ Features
- 🌐 Modern, glowing landing page
- 💬 AI chat demo (Gemini API)
- 🌍 3D Emoji Globe
- 📝 Waitlist form (Firebase-ready)
- 🌌 Animated starfield background
- 🦋 Glassmorphism, dark/light mode
- ⚡ Super smooth, emotionally resonant UI

---

## 🛠️ Tech Stack
- **Next.js 14** (App Router)
- **React 19**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **@google/genai** (Gemini API)
- **Firebase Firestore** (waitlist)
- **Three.js** (`@react-three/fiber`)

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/saswatakumardash/FedUp.git
   cd FedUp
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in your keys (see below).
4. **Run the dev server:**
   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables
Create a `.env.local` file in the root with:

```
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Firebase (for waitlist)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```