# 🕒 Work-Study Timesheet Tracker

A modern, full-stack web application for managing student work-study programs. Built with React, Node.js, Express, and MySQL.

**Theme:** Yellow ⚡ Blue 💙 White

## ✨ Features

### For Students
- 🔐 Secure JWT authentication
- ⏱️ Log clock-in / clock-out shifts with task descriptions
- 📊 Personal dashboard with total hours, weekly progress bar, and 8-week trend chart
- ⚠️ Visual alerts when approaching/exceeding weekly hour limit
- 🗑️ Delete own shifts

### For Admins (Work-Study Advisors)
- 👥 View all students with current-week hours, totals, and assigned stations
- 🎯 Allocate students to work stations and set weekly hour limits
- 🏢 Create, edit, and delete work stations on the fly
- 📈 Overview dashboard with pie chart (hours by station) and weekly bar chart
- 🚨 At-a-glance counts: total students, stations, hours, unallocated students

## 🛠 Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18 + Vite, Tailwind CSS, Recharts, Lucide Icons, React Router, Axios |
| Backend  | Node.js, Express, mysql2, bcrypt, jsonwebtoken, express-rate-limit |
| Database | MySQL 8 |

## 📁 Structure

```
work-study-tracker/
├── database/schema.sql          # Run this first
├── backend/                     # Express API (port 5000)
│   ├── config/db.js
│   ├── middleware/{auth,admin,errorHandler}.js
│   ├── routes/{auth,shifts,stations,departments,admin}.js
│   ├── scripts/seedAdmin.js
│   └── server.js
└── frontend/                    # React app (port 5173)
    └── src/
        ├── api/client.js
        ├── context/AuthContext.jsx
        ├── components/
        └── pages/{Login,Register,Dashboard,Admin}.jsx
```

## 🚀 Setup

### 1. Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env       # then edit DB credentials + JWT_SECRET
npm install
npm run seed:admin         # creates advisor@school.edu / admin123
npm run dev                # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

## 🔑 Default Admin Login
After running `npm run seed:admin`:
- **Email:** `advisor@school.edu`
- **Password:** `admin123`

⚠️ **Change this immediately in production.**

## 🗺 API Endpoints

### Auth
- `POST /api/auth/register` — create student account
- `POST /api/auth/login` — returns JWT
- `GET  /api/auth/me` — current user profile

### Shifts (auth required)
- `GET    /api/shifts` — own shifts + total
- `POST   /api/shifts` — log new shift
- `GET    /api/shifts/weekly` — 8-week breakdown + current week
- `DELETE /api/shifts/:id` — delete own shift

### Stations
- `GET    /api/stations` — list (auth)
- `POST   /api/stations` — create (admin)
- `PUT    /api/stations/:id` — update (admin)
- `DELETE /api/stations/:id` — delete (admin)

### Admin (admin only)
- `GET /api/admin/students` — all students with stats
- `PUT /api/admin/students/:id/allocate` — assign station + limit
- `GET /api/admin/overview` — chart data + counts

### Departments
- `GET /api/departments` — public list

## 🎨 Design Notes
- **Color palette:** Brand blue (#1d4ed8 / #1e3a8a) + Brand yellow (#facc15) on white
- **Typography:** Inter font, extrabold headings
- **Components:** Rounded-2xl cards with soft shadows, gradient buttons, animated transitions
- **Charts:** Recharts with custom blue→yellow gradient bars

## 🔒 Security
- Bcrypt password hashing (10 rounds)
- JWT with configurable expiry
- Rate limiting on auth endpoints (10 req / 15 min)
- Parameterized SQL queries throughout (no string interpolation)
- Role-based middleware (`auth` + `admin`)
- 401 responses auto-clear stored token on frontend

## 🚢 Production Hardening Checklist
- [ ] Strong random `JWT_SECRET` (32+ chars)
- [ ] HTTPS only
- [ ] Tighten CORS origin
- [ ] Move JWT to httpOnly cookies
- [ ] Add request validation (zod / joi)
- [ ] Database backups
- [ ] Logging (winston / pino)
- [ ] Change default admin password
