# Smart Campus Complaint & Service Management Portal

A premium, full-stack college project for 3rd Year ECE students with student and admin roles, SQLite CRUD, analytics, and modern dashboard UI.

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: SQLite
- Auth: Session-based authentication with protected routes

## Features

### Student Side

- Signup and login
- Raise complaint
- View own complaints with search and filters
- Edit/delete unresolved complaints
- Dashboard stats (total, pending, resolved, high priority)
- Notification/activity area
- Edit profile

### Admin Side

- Admin login
- View all complaints
- Search by title and filter by category/status
- Update complaint status and priority
- Delete complaints
- Analytics cards + monthly chart
- Export complaints as CSV

### UI/UX

- Corporate premium dashboard
- Sidebar, cards, tables, chart
- Glassmorphism accents
- Responsive layout
- Dark mode toggle
- Toast notifications
- Loading spinner and empty states

## Project Structure

```text
campus-portal/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
├── routes/
├── models/
├── database/
│   └── campus.db
├── middleware/
├── app.js
├── package.json
├── README.md
```

## Default Admin Account

- Email: admin@campus.com
- Password: admin123

## Run Locally

```bash
npm install
npm start
```

Application runs at:

- http://localhost:3000

## API Overview

- Auth: `/api/auth/*`
- Student complaints: `/api/complaints/*`
- Admin panel APIs: `/api/admin/*`

## Deployment Guide

### Deploy on Render

1. Push this project to GitHub.
2. Create a new **Web Service** on Render.
3. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variable:
   - `SESSION_SECRET` = any strong random string
5. Deploy.

Note: Render ephemeral file systems can reset local SQLite file on redeploy/restart. For demo and college viva this is fine. For persistent production-grade DB, move to managed DB.

### Deploy on Railway

1. Push project to GitHub.
2. Create a new project in Railway from GitHub repo.
3. Railway auto-detects Node app.
4. Set environment variable:
   - `SESSION_SECRET` = any strong random string
5. Deploy and open generated URL.

Same persistence note applies for SQLite on ephemeral disks.

## Viva Demo Flow

1. Login as student, raise complaints.
2. Show filters and status tracking.
3. Login as admin and update status/priority.
4. Show analytics chart and CSV export.
5. Toggle dark mode for UI polish.

## License

MIT
