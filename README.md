# SlotWise – Appointment Booking System

## 📌 Overview

SlotWise is a full-stack appointment booking web application built using **Angular**, **TypeScript**, and **Firebase**. It enables administrators to create and manage appointment slots while allowing customers to reserve available slots through a simple, responsive interface.

The application integrates **Firebase Authentication** for secure admin login, **Cloud Firestore** for real-time data storage, and **Firebase Hosting** for deployment. Firestore transactions are used during booking to prevent overbooking and ensure data consistency.

---

## 🚀 Live Demo

**Application URL:**  
https://slotwise-b3ed9.web.app/

---

## 🔐 Admin Login Credentials

> **Email:** `admin@slotwise.com`  
> **Password:** `Password123`

---

## ✨ Features

### 🔐 Admin Authentication

- Secure Email & Password Authentication using Firebase Auth
- Protected admin dashboard with Angular Route Guards
- Admin login and logout functionality

### 📅 Slot Management

- Create appointment slots
- Edit existing slots
- Delete slots
- Configure slot capacity
- View booked and available seats
- Real-time Firestore updates

### 👥 Customer Booking

- Public booking page (no login required)
- View available appointment slots
- Reserve a slot using customer name and contact number
- Prevent overbooking using **Firestore Transactions**
- Automatic booked count update

### 📋 Booking Management

- View all bookings in real time
- Display booking date and time
- Update booking status:
  - Pending
  - Confirmed
  - Cancelled

### ☁ Firebase Integration

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Real-time synchronization across clients

---

## 🛠 Tech Stack

### Frontend

- Angular (Standalone Components)
- TypeScript (Strict Mode)
- HTML5
- CSS3

### Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Firebase CLI

---

## 📂 Project Structure

```text
SlotWise/
├── src/
│   ├── app/
│   │   ├── guards/
│   │   ├── models/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── slots/
│   │   │   ├── book/
│   │   │   └── bookings/
│   │   ├── services/
│   │   └── app.routes.ts
│   ├── firebase.config.ts
│   └── main.ts
├── docs/
├── public/
├── angular.json
├── firebase.json
├── package.json
└── README.md
```

### Directory Description

| Path | Purpose |
|------|---------|
| `src/app/guards/` | Route guards to protect admin routes using Firebase Authentication |
| `src/app/models/` | TypeScript interfaces for Slot and Booking data models |
| `src/app/pages/login/` | Admin login page |
| `src/app/pages/dashboard/` | Admin dashboard after authentication |
| `src/app/pages/slots/` | Create, edit and delete appointment slots |
| `src/app/pages/book/` | Public customer booking page |
| `src/app/pages/bookings/` | View and manage customer bookings |
| `src/app/services/` | Firebase Authentication and Firestore services |
| `src/app/app.routes.ts` | Angular application routing |
| `src/firebase.config.ts` | Firebase project configuration |
| `docs/` | Assignment PDF documents (Part 2, Part 3 and Part 4) |
| `public/` | Static assets |
| `firebase.json` | Firebase Hosting configuration |
| `package.json` | Project dependencies and scripts |
| `README.md` | Project documentation |

## 📄 Assignment Documents

The written components of the assignment are available in the **docs** folder.

- **Part 2:** Written Explanation
- **Part 3:** Site Critique
- **Part 4:** Reflection

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Aashritha-MB/SlotWise.git
```

### 2. Navigate to the Project

```bash
cd SlotWise
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
ng serve
```

Open your browser:

```text
http://localhost:4200
```

---

## 🔥 Firebase Configuration

Create a Firebase project and enable:

- Firebase Authentication (Email & Password)
- Cloud Firestore
- Firebase Hosting

Update your Firebase configuration inside:

```text
src/firebase.config.ts
```

---

## 🚀 Build & Deployment

### Build the Project

```bash
ng build
```

### Deploy to Firebase Hosting

```bash
firebase deploy
```

---

## 👨‍💻 Application Workflow

```text
                 Admin Login
                      │
                      ▼
                 Admin Dashboard
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
Manage Slots     Customer Booking   Manage Bookings
      │               │                │
      │               │                │
 Create Slot      Select Slot      View Bookings
 Edit Slot        Enter Details    Confirm Booking
 Delete Slot      Book Slot        Cancel Booking
      │               │            Pending Booking
      │               │
      │               ▼
      │      Firestore Transaction
      │               │
      │      Check Capacity
      │               │
      │      Increment Booked Count
      │               │
      └──────────────►Save Booking
```

---

## 🔒 Firestore Transaction Safety

To prevent overbooking, SlotWise uses a **Firestore Transaction** during the booking process.

The transaction performs the following steps atomically:

1. Reads the selected slot.
2. Checks whether the slot has available capacity.
3. Stops the booking if the slot is already full.
4. Increments the booked count.
5. Creates the booking document.

This guarantees that multiple users cannot reserve the final available seat simultaneously.

---

## 📈 Future Improvements

- Email confirmation after booking
- SMS notifications
- Export bookings to Excel/PDF
- Analytics dashboard

---

## 📚 Learning Outcomes

This project demonstrates practical experience with:

- Angular Standalone Components
- Angular Routing
- Route Guards
- TypeScript Strict Mode
- Firebase Authentication
- Cloud Firestore CRUD Operations
- Firestore Transactions
- RxJS Observables
- Real-time Data Synchronization
- Firebase Hosting
- Git & GitHub

---


