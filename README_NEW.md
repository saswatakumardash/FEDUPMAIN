# FED UP - AI Emotional Support Companion

> **AI for the tired, the lost, the real. Your bestie or professional mentor, available 24/7.**

![FED UP Logo](public/fedup-logo.png)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saswatakumardash/FEDUPMAIN)
[![Live Demo](https://img.shields.io/badge/Live-Demo-purple)](https://fedupmain.vercel.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green)]()

---

## 🌟 What is FED UP?

**FED UP** is a revolutionary AI-powered emotional support platform that acts as your authentic digital companion. Unlike traditional therapy apps or productivity tools, FED UP focuses on **genuine friendship and professional mentorship** - providing real support for life's challenges without fake positivity or clinical detachment.

### Core Philosophy
- **Authentic Friendship**: Acts as your genuine bestie who truly cares
- **Professional Excellence**: Provides expert career and coding guidance  
- **Real Conversations**: Uses natural, conversational language
- **24/7 Availability**: Always there when you need support
- **No Fake Positivity**: Honest, real responses to real problems

---

## 🎯 Dual Chat Modes

FED UP features two distinct AI personalities to match your needs:

### 💜 **Bestie Mode** (Default)
- **Emotional Support**: Deep conversations about feelings, relationships, and life struggles
- **Casual Friendship**: Uses slang, emojis, and friendly language like "bestie", "wassup"  
- **Personal Growth**: Helps with self-confidence, decision-making, and personal challenges
- **Life Situations**: Support for breakups, stress, anxiety, loneliness, and major life changes
- **Authentic Care**: Remembers you're amazing even when you can't see it

**Example Conversation:**
```
You: "I'm feeling really overwhelmed with everything lately"
FED UP: "Hey bestie, that sounds super heavy. I can totally understand why you'd feel overwhelmed with everything on your plate right now 💙 What's been the hardest part for you lately?"
```

### 💼 **Professional Mode**
- **Career Guidance**: Resume tips, interview prep, job search strategies, salary negotiation
- **Coding Mentor**: Full-stack development, debugging, code reviews, architecture decisions
- **Technical Expertise**: JavaScript/TypeScript, Python, React, Next.js, databases, and more
- **Business Support**: Startup advice, market analysis, project planning, MVP development
- **Industry Insights**: Current tech trends, best practices, professional networking

**Example Conversation:**
```
You: "I need help optimizing my React component performance"
FED UP: "I'd be happy to help optimize your React performance! The key areas to focus on are unnecessary re-renders, heavy computations, and efficient state management. Here's a comprehensive approach:

```javascript
// Use React.memo for component optimization
const OptimizedComponent = React.memo(({ data, onUpdate }) => {
  // Use useCallback for stable function references
  const handleClick = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);
  
  return (
    <div>
      {data.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

Let me know what specific performance issues you're experiencing and I can provide more targeted solutions!"
```

---

## ✨ Key Features

### 🎙️ **Advanced Voice Integration**
- **Speech-to-Text**: Natural voice input with automatic message sending
- **Text-to-Speech**: AI responses spoken aloud with high-quality voices
- **Smart Voice Detection**: Automatically activates voice output for voice input
- **Multiple Voice Options**: Premium Microsoft voices (Eva, Hazel, Aria)
- **Emoji Support**: Converts emojis to speech-friendly text

### 🔐 **Secure Authentication**
- **Firebase Google OAuth**: Secure sign-in with Google accounts
- **Session Persistence**: Stay logged in across browser sessions
- **User Profile**: Personalized experience with name and photo
- **Privacy First**: Conversations stored locally, not used for AI training

### 💾 **Smart Data Management**
- **Local Storage**: Conversations saved in your browser
- **Cloud Sync**: User settings synchronized across devices
- **Message History**: Complete conversation persistence
- **Usage Tracking**: Monthly message limits with transparent counters

### 🌐 **Progressive Web App (PWA)**
- **Install as App**: Add to home screen on mobile/desktop
- **Offline Capability**: Basic functionality without internet
- **Push Notifications**: Reminders and check-ins (coming soon)
- **App-like Experience**: Full-screen, native feel

### 🎨 **Modern UI/UX**
- **Emotional Background**: Dynamic, mood-responsive animations
- **Glassmorphism**: Beautiful translucent design elements
- **Responsive Design**: Perfect on mobile, tablet, and desktop
- **Dark Theme**: Eye-friendly dark interface
- **Smooth Animations**: Framer Motion powered transitions

### 📊 **Usage Management**
- **Free Plan**: 150 messages/month for authenticated users
- **Smart Limits**: Different limits for voice vs text messages
- **Transparent Tracking**: Clear usage counters and reset dates

---

## 🛠️ Technical Architecture

### **Frontend Stack**
```
Next.js 15.2.4 (App Router)
├── React 19 (Latest)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
├── Framer Motion (Animations)
├── Shadcn/UI (Component Library)
├── Lucide React (Icons)
└── Three.js (3D Graphics)
```

### **Backend & AI**
```
API Routes (Next.js)
├── Google Gemini 2.0 Flash (Dual API Keys)
│   ├── Main API Key (Bestie Mode)
│   └── Demo API Key (Professional Mode)
├── Firebase Authentication
├── Firebase Firestore (User Data)
├── Web Speech API (Voice)
└── Web Search Integration
```

### **Key Dependencies**
- **AI**: `@google/genai` - Google Gemini API integration
- **Authentication**: `firebase` - User management and auth
- **Voice**: Native Web Speech API - Browser-based voice features
- **UI**: `@radix-ui/*` - Accessible component primitives
- **Animation**: `framer-motion` - Advanced animations
- **Styling**: `tailwindcss` - Utility-first CSS
- **3D Graphics**: `@react-three/fiber` - Three.js for React

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Firebase project (for authentication)
- Google Gemini API key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/saswatakumardash/FEDUPMAIN.git
   cd FEDUPMAIN
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your API keys to .env.local
   ```

4. **Configure Environment Variables**
   ```env
   # Google Gemini API Keys
   GEMINI_API_KEY=your_main_gemini_api_key
   GEMINI_DEMO_API_KEY=your_demo_gemini_api_key
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open in Browser**
   ```
   http://localhost:3000
   ```

---

## 📱 App Structure & Navigation

### **Landing Page (`/`)**
- **Hero Section**: App introduction with animated logo and description
- **About FED UP**: Detailed explanation of the platform's purpose
- **Key Differences**: Comparison with other AI tools and therapy apps
- **App Comparison**: Features showcase
- **Waitlist Form**: Email signup for early access

### **Main Chat Application (`/chat`)**
- **Authentication Required**: Google sign-in mandatory
- **Dual Mode Interface**: Switch between Bestie and Professional modes
- **Real-time Chat**: Instant AI responses with typing indicators
- **Voice Features**: Microphone input and audio output
- **Settings Panel**: Voice controls, mode switching, user preferences
- **Usage Tracking**: Message counters and limit displays

---

## 🎭 AI Personality System

### **Dual API Key Architecture**
FED UP uses **two separate Google Gemini API keys** to power its dual personality system:

```typescript
API Configuration:
├── GEMINI_API_KEY (Main) → Bestie Mode
│   ├── Emotional support responses
│   ├── Casual, friendly personality
│   ├── Personal growth guidance
│   └── /api/gemini endpoint
└── GEMINI_DEMO_API_KEY → Professional Mode
    ├── Technical expertise responses
    ├── Professional guidance
    ├── Code examples and best practices
    └── /api/gemini-demo endpoint
```

**Mode Switching Logic:**
- Users can toggle between modes in real-time
- Each mode uses different API endpoints
- Separate system prompts for distinct personalities
- Context preserved when switching modes
- Settings synchronized across devices via Firebase

### **Bestie Mode Characteristics**
```typescript
Personality Traits:
- Uses casual language: "bestie", "wassup", "sup"
- Emotionally supportive and empathetic
- Remembers user's worth during difficult times
- Provides practical life advice
- Uses emojis naturally in conversation
- Acts like a late-night friend who genuinely cares

Response Examples:
- "Hey bestie, that sounds super heavy 💙"
- "I've got your back, that's what best friends are for"
- "You're amazing even when you can't see it"
- "Let's figure this out together, bestie"
```

### **Professional Mode Characteristics**
```typescript
Personality Traits:
- Expert-level technical and career guidance
- Uses professional but approachable language
- Provides code examples and best practices
- Focuses on actionable, specific solutions
- Industry insights and current trends
- Structured, methodical problem-solving

Response Examples:
- "Let's tackle this challenge methodically"
- "Here's a production-ready solution with proper error handling"
- "I recommend following these industry best practices"
- "Let me break down the technical architecture for you"
```

---

## 🔊 Voice System Details

### **Speech Recognition Features**
- **Language**: English (en-US) with high accuracy
- **Continuous Recognition**: Real-time speech processing
- **Auto-Send**: Messages automatically sent when speech ends
- **Error Handling**: Graceful fallbacks for recognition failures
- **Browser Compatibility**: Works across modern browsers

### **Speech Synthesis Features**
- **Voice Selection**: Intelligent voice prioritization
- **Emoji Processing**: Converts 😊 to "happy face" for natural speech
- **Markdown Cleanup**: Removes formatting for clear audio
- **Optimized Settings**: 0.9x rate, 1.1x pitch for clarity
- **Smart Activation**: Auto-enables for voice input, manual for text

### **Voice Priority Order**
1. Microsoft Eva (Premium female voice)
2. Microsoft Hazel (Alternative female voice)  
3. Microsoft Aria (Backup female voice)
4. Google voices (Cross-platform compatibility)
5. Samsung voices (Mobile optimization)
6. Default system voices (Universal fallback)

---

## 🔒 Security & Privacy

### **Data Protection**
- **Local Storage**: Conversations stored only in your browser
- **No AI Training**: Messages never used to train AI models
- **GDPR Compliant**: Respects user data rights
- **Minimal Collection**: Only essential information stored

### **Authentication Security**
- **Firebase OAuth**: Industry-standard Google authentication
- **Secure Tokens**: JWT-based session management
- **HTTPS Encryption**: All data transmission secured
- **Session Management**: Automatic token refresh and expiration

### **Privacy Features**
- **Anonymous Demo**: Try without providing personal information
- **User Control**: Full control over data and conversations
- **No Data Mining**: Zero commercial use of personal conversations
- **Transparent Limits**: Clear usage tracking and limits

---

## 📊 Usage Limits & Plans

### **Free Plan (Authenticated Users)**
```
Monthly Message Limit: 150 messages
Voice Messages: Included in total limit
Text Messages: Included in total limit
Reset Period: 1st of each month
Storage: Firebase user document
Cross-Device Sync: Full synchronization
```

### **Usage Tracking Technology**
- **Local Storage Keys**: User-specific storage with UID
- **Firebase Integration**: Cloud-based limit tracking
- **Real-time Updates**: Live usage counter display
- **Cross-Device Sync**: Limits synchronized across all devices

---

## 🌐 Deployment & Infrastructure

### **Vercel Deployment**
- **Platform**: Vercel with Next.js optimization
- **Domain**: fedupmain.vercel.app
- **CDN**: Global content delivery network
- **SSL**: Automatic HTTPS with certificate management
- **Edge Functions**: Server-side rendering at the edge

### **Performance Optimization**
- **Image Optimization**: Automatic compression and WebP conversion
- **Bundle Splitting**: Code splitting for faster loading
- **Static Generation**: Pre-built pages for speed
- **Caching**: Intelligent caching strategies
- **Analytics**: Built-in performance monitoring

### **Environment Configuration**
```typescript
Production Settings:
- Node.js 18.x runtime
- Automatic deployments from main branch
- Environment variables secured
- Build optimization enabled
- Error tracking integrated
```

---

## 🔧 Development Guidelines

### **Code Structure**
```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Landing page component
│   ├── chat/           # Main chat application
│   ├── api/            # API routes for AI and data
│   └── globals.css     # Global styling
├── components/         # Reusable React components
│   ├── ui/            # Shadcn UI component library
│   ├── MainChat.tsx   # Core chat interface
│   ├── Hero.tsx       # Landing page hero section
│   └── [feature].tsx # Feature-specific components
├── lib/               # Utility libraries and helpers
│   ├── gemini.ts     # AI integration logic
│   ├── firebase.ts   # Authentication setup
│   ├── utils.ts      # General utilities
│   └── web-search.ts # Web search integration
├── hooks/             # Custom React hooks
├── public/           # Static assets and images
└── styles/           # Additional CSS files
```

### **Development Scripts**
```json
{
  "dev": "next dev",              // Development server
  "build": "next build",          // Production build
  "start": "next start",          // Production server
  "lint": "next lint",            // Code linting
  "type-check": "tsc --noEmit"    // TypeScript validation
}
```

### **Code Quality Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Component Architecture**: Modular, reusable components
- **Performance**: Optimized rendering and state management

---

## 🚀 API Endpoints

### **Main Chat API** (`/api/gemini`)
```typescript
POST /api/gemini
Content-Type: application/json

Request Body:
{
  message: string;                // User's message
  conversationHistory: string[];  // Previous conversation context
}

Response:
{
  response: string;              // AI-generated response
}

Features:
- Context awareness with full conversation history
- Automatic web search for current information
- Time zone handling (IST)
- Error handling with fallback responses
- CORS support for cross-origin requests
```

### **Professional Mode API** (`/api/gemini-demo`)
```typescript
POST /api/gemini-demo
Content-Type: application/json

Request Body:
{
  message: string;                // User's message
  conversationHistory: string[];  // Previous conversation context
}

Response:
{
  response: string;              // Professional AI response with code examples
}

Features:
- Technical expertise and coding guidance
- Formatted code blocks with syntax highlighting
- Industry insights and best practices
- Career and business advice
- Web search for technical documentation
```

### **Waitlist API** (`/api/waitlist`)
```typescript
POST /api/waitlist
Content-Type: application/json

Request Body:
{
  email: string;      // User's email address
  name?: string;      // Optional name
  message?: string;   // Optional message
}

Response:
{
  success: boolean;   // Registration status
  message: string;    // Status message
}

Features:
- Email validation and sanitization
- Duplicate prevention
- Firebase Firestore storage
- Admin notification system
```

---

## 🎨 UI/UX Design System

### **Color Palette**
```css
Primary Colors:
- Purple: #7c3aed (Primary brand color)
- Pink: #ec4899 (Accent color)
- Blue: #3b82f6 (Trust and calm)

Background Colors:
- Dark Primary: #111318 (Main background)
- Dark Secondary: #0d1117 (Card backgrounds)
- Glass: rgba(255,255,255,0.1) (Glassmorphism)

Text Colors:
- Primary: #ffffff (Main text)
- Secondary: #gray-300 (Secondary text)
- Muted: #gray-400 (Helper text)
```

### **Typography**
```css
Font Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
Code Font: 'JetBrains Mono', ui-monospace, SFMono-Regular

Heading Scales:
- h1: 3.5rem (56px) - Main logo
- h2: 2rem (32px) - Section headers
- h3: 1.5rem (24px) - Subsection headers
- Body: 1rem (16px) - Regular text
- Small: 0.875rem (14px) - Helper text
```

### **Animation System**
```typescript
Framer Motion Configurations:
- Page Transitions: 0.8s spring animations
- Component Entrance: 0.5s ease-out
- Hover Effects: 0.2s ease-in-out
- Loading States: Infinite rotation/pulse
- Typing Animation: Variable speed (16-32ms per character)
```

---

## 🔮 Future Roadmap

### **🚀 Coming Soon: Android APK Version**
**Expected Release**: Q3 2025
```
Features:
├── Guest Sign-In: Use without Google account
├── Local Device Limits: 50 messages per device
├── Offline Storage: Conversations saved locally
├── Native Android Experience: Optimized for mobile
├── Push Notifications: Reminders and check-ins
└── APK Direct Download: Install without Play Store
```

### **Phase 1: Enhanced AI Capabilities**
- **Memory System**: Long-term conversation memory across sessions
- **Emotional Intelligence**: Advanced mood detection and response adaptation
- **Personalization**: Learning user preferences and communication style
- **Multi-language Support**: Expand beyond English to global languages

### **Phase 2: Mobile Applications**
- **Native iOS App**: App Store distribution with native features
- **Native Android App**: Google Play Store with Android optimizations
- **Push Notifications**: Proactive check-ins and reminders
- **Offline Mode**: Basic functionality without internet connection

### **Phase 3: Premium Features**
- **Unlimited Messages**: Remove usage restrictions for premium users
- **Priority AI**: Faster response times and enhanced models
- **Voice Cloning**: Personalized AI voice that sounds like a friend
- **Advanced Analytics**: Mood tracking and wellness insights over time

### **Phase 4: Professional Tools**
- **Team Collaboration**: Shared workspaces for professional projects
- **Code Repository Integration**: GitHub/GitLab integration for code reviews
- **Career Tracking**: Progress monitoring for professional development
- **Mentor Matching**: Connect with human mentors for specific skills

### **Phase 5: Health & Wellness**
- **Therapist Referrals**: Seamless connection to professional mental health
- **Crisis Intervention**: Advanced detection and emergency resources
- **Wellness Integration**: Connect with fitness and health tracking apps
- **Support Groups**: Community features for peer support

---

## 📞 Support & Community

### **Getting Help**
- **Documentation**: This comprehensive README
- **GitHub Issues**: Bug reports and feature requests
- **Developer Contact**: [Saswata Kumar Dash](https://skds.site)
- **Live Demo**: Try at [fedupmain.vercel.app](https://fedupmain.vercel.app)

### **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Bug Reports**
Please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

---

## 📄 License & Legal

### **License**
This project is proprietary software owned by Saswata Kumar Dash. All rights reserved.

### **Privacy Policy**
- Minimal data collection
- Local storage of conversations
- No AI training on user data
- GDPR compliance
- User control over data

### **Terms of Service**
- Free for personal use
- Commercial use requires permission
- No liability for AI responses
- User responsibility for content

---

## 🙏 Acknowledgments

### **Creator**
**Saswata Kumar Dash**
- Website: [skds.site](https://skds.site)
- GitHub: [@saswatakumardash](https://github.com/saswatakumardash)
- Project: FED UP - AI Emotional Support Companion

### **Technologies Used**
- **Google Gemini 2.0 Flash**: Advanced AI conversation model
- **Firebase**: Authentication and cloud services
- **Vercel**: Deployment and hosting platform
- **Next.js**: React framework for production
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready motion library

### **Special Thanks**
- The mental health community for inspiring authentic support
- Beta testers who provided valuable feedback
- Open source contributors who make projects like this possible

---

## 📊 Project Statistics

- **Total Lines of Code**: 15,000+
- **Components**: 25+ React components
- **API Endpoints**: 4 production endpoints
- **Supported Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Compatibility**: iOS Safari, Chrome Mobile
- **Performance Score**: 95+ Lighthouse score
- **Accessibility**: WCAG 2.1 AA compliant

---

**FED UP - Where authentic friendship meets professional excellence.**

*Built with ❤️ by [Saswata Kumar Dash](https://skds.site)*

---

**Last Updated**: July 26, 2025  
**Version**: 1.1.1  
**License**: Proprietary  
**Status**: Production Ready ✅
