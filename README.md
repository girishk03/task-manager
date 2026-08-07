# Task Management System - Full Stack Assessment

A modern, production-ready caseload and task management system built as part of the technical assessment. 

The project consists of a high-fidelity **Next.js App Router** frontend, a clean **NestJS REST API** backend, and database persistence powered by **Prisma** and **SQLite**.

---

## 🚀 Key Features

1. **Guest Login:** Create temporary sessions with custom or auto-generated user profiles.
2. **Interactive Dashboard:** Displays visual task metrics (To Do, In Progress, Completed counters).
3. **Views:** Toggle dynamically between **Kanban Board** lanes and tabular **List View**.
4. **Task CRUD Operations:** Complete interactive task creation, editing, status transitions, and deletion.
5. **Theme Switching:** Dark & Light modes with automatic `localStorage` persistence.
6. **Input Validation:** Backend validation (`class-validator` DTOs) and validation error banners on the frontend.
7. **Responsive UI:** Adaptive layout structured for mobile, tablet, and desktop viewports.
8. **Error & Loading States:** Built-in loading skeletons, empty state illustrations, and connection retry filters.

---

## 🏗️ Project Architecture

```
task-manager/
├── frontend/                     # Next.js App Router (Tailwind CSS, TypeScript)
├── backend/                      # NestJS REST API (Prisma, SQLite, TypeScript)
└── ablespace_product_analysis.md # Part 2 Product Analysis Report
```

---

## 🛠️ Setup & Local Running

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Backend Setup (NestJS)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Prisma migrations to generate the database schema and SQLite database file:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the server:
   ```bash
   npm run start
   ```
   The backend will boot on **`http://localhost:4000/api`**.

### 2. Frontend Setup (Next.js)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will boot on **`http://localhost:3000`**.

---

## 📡 API Contract

All endpoints are prefixed with `/api` and require a JWT token in the `Authorization` header (`Bearer <token>`), except the login endpoint.

### Authentication
* `POST /auth/guest` - Logs in a guest. Accepts an optional `{ name: string }` body. Returns a JWT token and user info.

### Tasks (Authenticated)
* `GET /tasks` - Retrieve all tasks for the logged-in user (ordered by creation date).
* `POST /tasks` - Create a new task. Requires a body containing:
  ```json
  {
    "title": "Required string",
    "description": "Optional string",
    "status": "TODO | IN_PROGRESS | COMPLETED",
    "priority": "LOW | MEDIUM | HIGH",
    "dueDate": "Optional ISO 8601 Date String"
  }
  ```
* `PUT /tasks/:id` - Update an existing task (attributes are optional but validated).
* `DELETE /tasks/:id` - Delete a task.

---

## ☁️ Production Deployment Guide

To keep the application accessible for the required **45 days**, we recommend the following deployment combination:

### 1. Backend (NestJS + SQLite) on Render
- Register on [Render.com](https://render.com/).
- Create a **Web Service** linked to your public GitHub repository.
- Specify **Build Command**: `cd backend && npm install && npm run build`
- Specify **Start Command**: `cd backend && npx prisma db push && npm run start:prod`
- Set Environment Variables:
  - `JWT_SECRET` = Your secure key
  - `PORT` = `10000`

### 2. Frontend (Next.js) on Vercel
- Register on [Vercel.com](https://vercel.com/).
- Create a project linked to your GitHub repository.
- Configure root directory to **`frontend`**.
- Set Environment Variables:
  - `NEXT_PUBLIC_API_URL` = `https://your-backend-render-url.onrender.com/api`
- Click Deploy.
