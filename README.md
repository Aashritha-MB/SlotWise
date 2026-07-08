# SlotWise – Appointment Booking System

## 📌 Overview

SlotWise is a full-stack appointment booking web application built using **Angular** and **Firebase**. It allows administrators to create and manage appointment slots while enabling customers to book available slots through a simple and responsive interface.

The application uses **Firebase Authentication** for secure admin login, **Cloud Firestore** for real-time database operations, and **Firebase Hosting** for deployment.

---

## 🚀 Live Demo

**Application URL:**
https://slotwise-b3ed9.web.app/

---

## Login Credentials
Email: admin@slotwise.com

Password: Password123

## ✨ Features

### 🔐 Admin Authentication

* Secure Firebase Email & Password Authentication
* Protected dashboard using Angular Route Guards
* Admin login and logout functionality

### 📅 Slot Management

* Create new appointment slots
* Edit existing slots
* Delete slots
* View slot capacity and booked count
* Real-time updates using Cloud Firestore

### 👥 Customer Booking

* Public booking page (no login required)
* View available appointment slots
* Book a slot using customer name and contact number
* Prevent overbooking using Firestore Transactions

### 📋 Booking Management

* View all customer bookings
* Display appointment date and time
* Update booking status:

  * Pending
  * Confirmed
  * Cancelled
* Real-time booking updates

### ☁ Firebase Integration

* Firebase Authentication
* Cloud Firestore Database
* Firebase Hosting
* Real-time synchronization

---

# 🛠 Tech Stack

## Frontend

* Angular
* TypeScript
* HTML5
* CSS3

## Backend

* Firebase Authentication
* Cloud Firestore
* Firebase Hosting

## Tools

* Visual Studio Code
* Git
* GitHub
* Firebase CLI

---

# 📂 Project Structure

```
src/
│
├── app/
│   ├── guards/
│   ├── models/
│   ├── pages/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── slots/
│   │   ├── book/
│   │   └── bookings/
│   │
│   ├── services/
│   └── app.routes.ts
│
├── firebase.config.ts
└── main.ts
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Aashritha-MB/SlotWise.git
```

## 2. Move into the Project

```bash
cd SlotWise
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Run the Application

```bash
ng serve
```

# 🔥 Firebase Configuration

Create a Firebase project and enable:

* Authentication (Email/Password)
* Cloud Firestore
* Firebase Hosting

Update your Firebase configuration inside:

```
src/firebase.config.ts
```

---

# 🚀 Build for Production

```bash
ng build
```

---

# 🌐 Deploy to Firebase

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
      │                   └── Book Appointment
      │
      └──────────────► Manage Bookings
                          │
                          ├── View Bookings
                          ├── Confirm Booking
                          ├── Cancel Booking
                          └── Mark as Pending
```


# 📈 Future Improvements

* Email confirmation for bookings
* Customer booking cancellation


# 📚 Learning Outcomes

This project demonstrates knowledge of:

* Angular Standalone Components
* Angular Routing
* Angular Route Guards
* TypeScript
* Firebase Authentication
* Cloud Firestore
* Firestore Transactions
* CRUD Operations
* Real-time Data Synchronization
* Firebase Hosting
* Git & GitHub

