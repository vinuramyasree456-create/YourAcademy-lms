# YourAcademy LMS 🚀

YourAcademy is a modern, full-stack Learning Management System (LMS) designed with a minimalist and content-first philosophy. This project lets users register, enroll in coding courses, and track their video viewership progress seamlessly through YouTube api integrations.

## Architecture

This project is separated into a frontend Next.js application and a backend Node/Express API. Ensure both servers are running concurrently for the application to function correctly.

- **Frontend:** Next.js 14, React, Tailwind CSS, Zustand, Axios
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, SQLite (local database)
- **Features:** Secure JWT authentication (HTTP-only refresh cookies), Video progress caching and saving, YouTube video embedding, Sequential video locking logic.

---

## Getting Started

### 1. Backend Setup

Open a terminal in the `backend/` directory:

1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Generate the Prisma Client and migrate the local SQLite database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. Run the database seed to cleanly inject the 10 demo courses and a testing user account:
   ```bash
   npx tsx src/seed.ts
   ```
4. Start the backend development server (will run on `http://localhost:3001`):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

Open a new terminal in the `frontend/` directory (leave backend running!):

1. Install frontend dependencies:
   ```bash
   npm install
   ```
2. Start the frontend Next.js development server (will run on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

### 3. Usage

Once both servers are running properly, verify by opening up your web browser to [http://localhost:3000](http://localhost:3000).

You can log in and browse as a seeded user with:
- **Email:** `demo@youracademy.com`
- **Password:** `password123`

You can also register your own account using the web application!

---

## Note on Video Playback
The actual video content acts via `react-youtube` embeddings. It natively triggers progress interval callbacks so that returning to closed sessions reliably resumes playback right where left off.
