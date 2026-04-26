# Mentorria360 — Coaching Institute Management SaaS

A multi-tenant SaaS platform where coaching institutes manage students, fees, classes, and workshops. Built with React + Firebase.

---

## Folder Structure

```
Mentorria360/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthScreen.jsx          # Login + Registration
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      # Stats, pending requests, recent tx
│   │   │   ├── AdminStudents.jsx       # Enrolled student management
│   │   │   ├── AdminRequests.jsx       # Approve / reject join requests
│   │   │   ├── AdminFees.jsx           # Fee records + payment tracking
│   │   │   ├── AdminClasses.jsx        # Class schedule management
│   │   │   └── AdminWorkshops.jsx      # Workshop management
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx    # Student home (pending/approved states)
│   │   │   ├── StudentClasses.jsx      # View class schedule
│   │   │   ├── StudentFees.jsx         # View fee history
│   │   │   └── StudentWorkshops.jsx    # View + enroll in workshops
│   │   ├── superadmin/
│   │   │   └── SuperAdminDashboard.jsx # Platform-level overview
│   │   └── shared/
│   │       ├── Icon.jsx                # Inline SVG icon system
│   │       ├── Modal.jsx               # Reusable modal
│   │       └── Sidebar.jsx             # Role-based navigation sidebar
│   ├── contexts/
│   │   └── AuthContext.jsx             # Firebase Auth + profile state
│   ├── services/
│   │   ├── firebase.js                 # Firebase app initialization
│   │   └── firestoreService.js         # All Firestore operations
│   ├── utils/
│   │   └── helpers.js                  # CSV export, formatters, utilities
│   ├── App.jsx                         # Root routing + role-based layout
│   ├── index.js                        # React entry point
│   └── index.css                       # Global styles + design system
├── .env.example                        # Environment variable template
├── .gitignore
├── firebase.json                       # Firebase hosting config
├── firestore.rules                     # Firestore security rules
├── firestore.indexes.json              # Composite indexes
├── package.json
└── tailwind.config.js
```

---

## Step 1 — Firebase Setup

### 1.1 Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `Mentorria360`
3. Disable Google Analytics (optional) → **Create project**

### 1.2 Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** → Save

### 1.3 Enable Firestore

1. In Firebase Console → **Firestore Database** → **Create database**
2. Select **Start in production mode** (we'll apply our own rules)
3. Choose your region (e.g., `asia-south1` for India)

### 1.4 Get Your Config

1. Firebase Console → **Project Settings** (gear icon) → **Your apps**
2. Click **Web** icon (`</>`) → Register app as `Mentorria360-web`
3. Copy the `firebaseConfig` object — you'll need it in `.env`

---

## Step 2 — Local Development Setup

```bash
# Clone / download the project
cd Mentorria360

# Install dependencies
npm install

# Copy environment file and fill in your Firebase config
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=Mentorria360-xxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=Mentorria360-xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=Mentorria360-xxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

```bash
# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 3 — Create Super Admin Account

The super admin is the platform owner. Create them manually in Firestore:

1. Register via the app UI with any email (e.g., `superadmin@Mentorria360.com`)
2. Go to Firebase Console → **Firestore** → `users` collection
3. Find the document with that email
4. Edit the `role` field from `"student"` to `"superadmin"`
5. Set `status` to `"active"`

Now log in with that account — you'll see the Super Admin dashboard.

---

## Step 4 — Deploy Firestore Security Rules

```bash
# Install Firebase CLI globally (once)
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project)
firebase init firestore

# Deploy rules + indexes
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Step 5 — Deploy to Vercel (Recommended)

### Option A — Vercel (easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. In **Environment Variables**, add all `REACT_APP_*` vars from your `.env`
4. Click **Deploy** ✓

### Option B — Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → Import from Git
3. Build command: `npm run build`
4. Publish directory: `build`
5. In **Site settings → Environment variables**, add all `REACT_APP_*` vars
6. Click **Deploy site** ✓

### Option C — Firebase Hosting

```bash
npm run build
firebase init hosting   # select 'build' as public dir, SPA=yes
firebase deploy --only hosting
```

---

## Firestore Data Structure

```
users/
  {uid}/
    name, email, role, status, coachingId, createdAt

coachings/
  {coachingId}/
    name, city, subject, phone, whatsapp, adminId, students[], createdAt

    joinRequests/
      {requestId}/
        studentId, studentName, studentEmail, status, timestamp

    fees/
      {feeId}/
        studentId, studentName, amount, paid, due, month, status, date

    classes/
      {classId}/
        subject, teacher, day, time, room, createdAt

    workshops/
      {workshopId}/
        title, description, date, time, seats, enrolled, fee, createdAt

    transactions/
      {txId}/
        studentId, studentName, amount, type, note, date, createdAt
```

---

## User Flows

### Coach Admin registers
1. Clicks Register → selects "Coaching Admin"
2. Fills personal info + institute details
3. A new `coachings/{id}` doc is created
4. User profile saved with `role: "admin"`, `coachingId`

### Student registers
1. Clicks Register → selects "Student"
2. Fills personal info → Step 2: searches for a coaching
3. Selects coaching → clicks "Send Join Request"
4. A `joinRequests/{id}` doc is created with `status: "pending"`
5. Student sees "Pending Approval" screen

### Admin approves student
1. Admin sees badge on "Join Requests" nav item
2. Opens requests panel → clicks "Approve"
3. `joinRequests/{id}.status` → `"approved"`
4. `users/{studentId}.coachingId` → set, `.status` → `"approved"`
5. Student's dashboard unlocks automatically

---

## Features by Role

| Feature | Super Admin | Coach Admin | Student |
|---|---|---|---|
| View all institutes | ✅ | ❌ | ❌ |
| Manage own students | ❌ | ✅ | ❌ |
| Approve join requests | ❌ | ✅ | ❌ |
| Add fee records | ❌ | ✅ | ❌ |
| Mark fees paid | ❌ | ✅ | ❌ |
| Manage classes | ❌ | ✅ | ❌ |
| Manage workshops | ❌ | ✅ | ❌ |
| View own fees | ❌ | ❌ | ✅ |
| View classes | ❌ | ❌ | ✅ |
| Enroll in workshops | ❌ | ❌ | ✅ |
| Export CSV | ❌ | ✅ | ❌ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Styling | Tailwind CSS + custom CSS variables |
| Auth | Firebase Authentication (Email/Password) |
| Database | Cloud Firestore |
| Storage | Firebase Storage (ready to use) |
| Hosting | Vercel / Netlify / Firebase Hosting |
| Notifications | react-hot-toast |

---

## Extending the App

**Add SMS notifications** — integrate Twilio or MSG91 via a Firebase Cloud Function triggered on `joinRequests` write.

**Add file uploads** — use `firebase/storage` (already initialized in `firebase.js`) to let admins upload study materials.

**Add payment gateway** — integrate Razorpay or PayU by creating a Cloud Function that generates a payment order and updating the fee record on success.

**Add real-time updates** — replace `getDocs` calls with `onSnapshot` listeners for live dashboard updates without refreshing.

