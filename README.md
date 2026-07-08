Here is your complete, polished README file with the duplication removed, formatting cleaned up, and technical depth added to highlight your use of Firestore Transactions.

Replace the entire contents of your current `README.md` file with this text:

```markdown
# SlotWise – Appointment Booking System

## 📌 Overview

SlotWise is a full-stack appointment booking web application built using **Angular** and **Firebase**. It allows administrators to create and manage appointment slots while enabling customers to book available slots through a simple and responsive interface.

The application uses **Firebase Authentication** for secure admin login, **Cloud Firestore** for real-time database operations, and **Firebase Hosting** for deployment.

---

## 🚀 Live Demo

**Application URL:** 
https://slotwise-b3ed9.web.app/

---

## 🔐 Login Credentials

* **Email:** `admin@slotwise.com`
* **Password:** `Password123`

---

## ✨ Features

### 🔐 Admin Authentication
* Secure Firebase Email & Password Authentication
* Protected dashboard using Angular Route Guards
* Admin login and logout functionality

### 📅 Slot Management
* Create new appointment slots (Date, Time, Capacity)
* Edit existing slots
* Delete slots
* View slot capacity and booked count in real time
* Real-time updates using Cloud Firestore snapshot listeners

### 👥 Customer Booking
* Public booking page (no authentication required)
* View available appointment slots
* Book a slot using customer name and contact number
* **Overbooking Prevention:** Uses atomicity via Firestore Transactions to safely verify available capacity and increment the booked count before committing a booking document.

### 📋 Booking Management
* View all customer bookings on an administrative dashboard
* Display appointment date and time details
* Update booking status in real time:
  * Pending
  * Confirmed
  * Cancelled

### ☁ Firebase Integration
* Firebase Authentication
* Cloud Firestore Database
* Firebase Hosting
* Real-time data synchronization across all clients

---

# 🛠 Tech Stack

## Frontend
* Angular (Strict Mode enabled)
* TypeScript
* HTML5 / CSS3

## Backend
* Firebase Authentication
* Cloud Firestore
* Firebase Hosting

## Tools
* Visual Studio Code
* Git & GitHub
* Firebase CLI

---

# 📂 Project Structure


```

src/
│
├── app/
│   ├── guards/       # Route guards for admin dashboard authorization
│   ├── models/       # TypeScript interfaces for Slots and Bookings
│   ├── pages/
│   │   ├── login/      # Admin authentication page
│   │   ├── dashboard/  # Admin main entry panel
│   │   ├── slots/      # Slot creation & management workspace
│   │   ├── book/       # Public facing client reservation view
│   │   └── bookings/   # Admin list and management of client bookings
│   │
│   ├── services/     # Firebase Auth and Firestore data access layers
│   └── app.routes.ts # Application routing configuration
│
├── firebase.config.ts
└── main.ts

```
## 📄 Assignment Documents

The written components of this assignment are available in the `docs` folder.

- **Part 2:** `docs/Part2_Written_Explanation.pdf`
- **Part 3:** `docs/Part3_Site_Critique.pdf`
- **Part 4:** `docs/Part4_Reflection.pdf`
---

# ⚙️ Installation & Setup

## 1. Clone the Repository
```bash
git clone [https://github.com/Aashritha-MB/SlotWise.git](https://github.com/Aashritha-MB/SlotWise.git)

```

## 2. Move into the Project

```bash
cd SlotWise

```

## 3. Install Dependencies

```bash
npm install

```

## 4. Run the Application Locally

```bash
ng serve

```

Navigate to `http://localhost:4200/` in your browser.

---

# 🔥 Firebase Configuration

To configure your own backend environment, create a Firebase project in the Firebase Console and enable:

* Authentication (Email/Password provider)
* Cloud Firestore
* Firebase Hosting

Update the environment settings inside your local configuration file:

```
src/firebase.config.ts

```

---

# 🚀 Build & Deployment

## Build for Production

```bash
ng build

```

## Deploy to Firebase

```bash
firebase deploy

```

---

# 👨‍💻 User Flow

```
Admin Login
     │
     ▼
Dashboard
     │
     ├──────────────► Manage Slots
     │                   │
     │                   ├── Create Slot
     │                   ├── Edit Slot
     │                   └── Delete Slot
     │
     ├──────────────► Customer Booking
     │                   │
     │                   ├── View Available Slots
     │                   ├── Select Slot
     │                   └── Book Appointment (Atomic Transaction Check)
     │
     └──────────────► Manage Bookings
                         │
                         ├── View Bookings
                         ├── Confirm Booking
                         ├── Cancel Booking
                         └── Mark as Pending

```

---

# 📈 Future Improvements

* Automated email/SMS confirmations for customers upon status changes.
* Customer-side cancellation links inside confirmation notifications.
* Paginated queries and server-side data infinite scrolling for handling high booking volumes.

---

# 📚 Learning Outcomes

This project demonstrates core competencies across the modern full-stack web ecosystem:

* **Angular Standalone Architecture:** Designing modular components without boilerplate NgModules.
* **Strict TypeScript Type Safety:** Guaranteeing interface structure and zero implicitly-typed `any` elements.
* **NoSQL Transactional Integrity:** Handling race conditions and data mutations using atomicity via Firestore Transactions.
* **Real-time Synchronization:** Building asynchronous, reactive UI elements tied to continuous database document updates using RxJS streams.

```

```