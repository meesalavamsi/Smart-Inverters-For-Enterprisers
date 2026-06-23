# Smart Inverter Business Platform

Enterprise-grade platform for Smart Inverter's business in Ravulapalem, Andhra Pradesh.

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

Backend runs at: http://localhost:5000
API Docs: http://localhost:5000/api/docs

**Admin Login:**
- Email: admin@smartinverters.in
- Password: Admin@123

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Features

- **Customer Website** — 15 fully functional pages
- **Admin Portal** — Dashboard, Products, Orders, Bookings, Issues, Feedback, Analytics
- **Authentication** — JWT, OTP verification, account lockout
- **Product Management** — Add/edit/delete products, instant website updates
- **Order Management** — Place orders, track status
- **Service Booking** — Book installation, repair, maintenance, emergency
- **Issue Reporting** — Photo upload, priority system, real-time admin notifications
- **Feedback System** — Star ratings, approve/display on homepage
- **WhatsApp Integration** — Floating button on every page
- **YouTube Videos** — Learning center with modal player
- **Multilingual** — English + Telugu toggle
- **Analytics Dashboard** — Revenue charts, customer stats, order trends

## Business Info

- **Name:** Smart Inverter's
- **Phone/WhatsApp:** 7207762577
- **Address:** Indira Colony (Near Community Hall), Daggara, Ravulapalem
- **Website:** http://localhost:3000

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| State | Zustand |
| Forms | React Hook Form + Zod |
| i18n | next-intl (English + Telugu) |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | SQLite (via Prisma) → easily switch to MySQL |
| Auth | JWT + OTP email verification |
| Files | Multer (local) → switch to Cloudinary for production |
| Email | Nodemailer |
| Docs | Swagger UI |

## Switching to Production (MySQL + Cloudinary)

1. Update `backend/.env`:
   ```
   DATABASE_URL="mysql://user:password@host/dbname"
   ```
2. Run: `npx prisma migrate dev`
3. Update upload logic to use Cloudinary SDK
4. Deploy frontend to Vercel, backend to Railway/AWS
