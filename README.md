# MyStudySpace — Multi-User Study Management SaaS

A **production-ready academic management web application** built with **React, Firebase Authentication, and Firestore** to help college students organize **subjects, assignments, exams, and study resources** in a secure, multi-user environment.

---

# 🚀 Live Purpose

MyStudySpace is designed as a **real SaaS-style student productivity platform**, focusing on:

* **Secure multi-user data isolation**
* **Cloud persistence across devices**
* **Clean production architecture**
* **Interview-ready engineering practices**

This project represents a transition from **basic localStorage apps → real cloud-based production systems**.

---

# ✨ Core Features

## 🔐 Authentication & User Isolation

* Firebase Authentication (email/password)
* Each user has **fully isolated academic data**
* Secure session restore on refresh
* Logout **does not delete cloud data**

---

## 👤 Profile Management

* Store **Name, Branch, Semester**
* Cloud-synced profile per user
* Editable anytime
* Auto-load after login

---

## 📚 Subject Management

* Add, view, and delete subjects
* Optional subject codes
* Cascade deletion for related data
* Firestore-backed persistence

---

## 📝 Assignment Tracker

* Create assignments with:

  * Subject
  * Title
  * Due date
* Status tracking: **Pending → Submitted**
* Visual overdue indicators
* Real-time dashboard reflection

---

## 🗓️ Exam Planner

* Schedule exams per subject
* Sorted by **nearest upcoming date**
* Visual states:

  * Upcoming
  * Completed
* Persistent across refresh & devices

---

## 📊 Dashboard Overview

* Total subjects
* Pending assignments
* Upcoming exams
* Quick navigation actions
* Smart upcoming items preview

---

## 📂 Notes Module (SaaS-Ready Foundation)

* File upload architecture prepared
* Secure user-scoped metadata design
* Storage integration structured for production rollout
  *(Feature staged for future release)*

---

# 🏗️ Production Architecture

## Frontend

* **React (Vite)**
* Context API state management
* Component-driven UI
* Responsive design
* Light white + light green theme

## Backend (Cloud)

* **Firebase Authentication**
* **Firestore Database**
* UID-scoped collections:

```
users/{uid}/
  profile
  subjects/
  assignments/
  exams/
  notes/
```

---

# 🔒 Security Model

* Auth-required database access
* **Per-user Firestore rules**
* No cross-user data visibility
* Refresh-safe state loading
* Production-grade logout behavior

---

# ⚙️ Engineering Highlights

* Context-driven global state
* Async-safe data fetching after auth restore
* No localStorage dependency for core data
* Clean folder architecture
* Error-safe UI handling
* Cloud-persistent CRUD operations
* Production deployment readiness

---

# 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   └── layout/
├── contexts/
│   ├── AuthContext.jsx
│   ├── UserContext.jsx
│   └── AppContext.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Subjects.jsx
│   ├── Assignments.jsx
│   ├── Exams.jsx
│   ├── Notes.jsx
│   └── Profile.jsx
├── services/
│   └── firebase / notes services
├── utils/
└── App.jsx
```

---

# 🧪 Production-Ready Behaviors

✔ Multi-user isolation
✔ Cloud persistence after refresh
✔ Secure logout without data loss
✔ Reliable CRUD synchronization
✔ Mobile-responsive UI
✔ Clean error handling

---

# 🚀 Getting Started (Development)

## Prerequisites

* Node.js 18+
* Firebase project configured

## Installation

```bash
git clone <repo-url>
cd MyStudySpace
npm install
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

# 🔐 Environment Variables

Create `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Never commit `.env` to GitHub.**

---

# 🌐 Deployment

Recommended:

* **Vercel** (frontend hosting)
* **Firebase** (auth + database)

Deployment flow:

```
Push to GitHub → Connect Vercel → Add env vars → Deploy
```

---

# 🧭 Roadmap

## Next Planned Upgrades

* Secure Notes file storage
* Real-time Firestore listeners
* Advanced dashboard analytics
* SaaS feature gating
* Export / backup system

---

# 🎓 Why This Project Matters

Most student projects stop at:

> “CRUD app using localStorage.”

MyStudySpace demonstrates:

* **Cloud architecture**
* **Security-aware engineering**
* **Production data modeling**
* **Real SaaS thinking**

This makes it a **portfolio-grade, interview-ready full-stack system**.

---

# 📄 License

Educational project for learning and portfolio use.

---

# ❤️ Author

Built with focus on **real-world engineering practices**
to bridge the gap between **college projects → production software**.
