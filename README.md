# Podcast Notes App

A full-stack podcast player that lets you subscribe to podcasts via RSS, listen across episodes, and take timestamped notes — all in one place.
Built as a mobile-friendly Progressive Web App with a global mini-player and persistent playback.

---

## Features

- Subscribe to podcasts via RSS feed
- Global mini-player (plays across views)
- Timestamped episode notes
- Podcast-wide notes
- Search across all notes
- Recent episodes view
- Progressive Web App (installable on mobile)
- Deployed frontend and backend

---

## Architecture

### Frontend

- React + Vite
- Tailwind CSS
- PWA support (service worker + manifest)
- Deployed on Vercel

### Backend

- Node.js + Express
- RSS parsing via rss-parser
- Prisma ORM
- PostgreSQL database
- Deployed on Render

### Database

- PostgreSQL
- Managed via Prisma migrations

---

## Project Structure

```
/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── views/     # App views (Library, Podcast, Notes, etc.)
│   │   ├── components/# Reusable components (MiniPlayer, etc.)
│   │   ├── api.js     # API fetch helper
│   │   └── main.jsx
│   └── public/
│       ├── manifest.json
│       └── sw.js
│
├── routes/            # Express routes
├── controllers/       # HTTP controllers
├── services/          # Business logic
├── prisma/            # Prisma schema & migrations
├── server.js          # Backend entrypoint
└── README.md
```

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/dykflint/podcast-notes-app.git
cd podcast-notes-app
```

---

### 2. Backend setup

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/podcast_notes
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
node server.js
```

Backend runs at:

```
http://localhost:3000
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Deployment

### Frontend (Vercel)

- Build command: `npm run build`
- Output directory: `frontend/dist`
- Environment variable:
  ```env
  VITE_API_BASE_URL=https://your-render-backend.onrender.com
  ```

### Backend (Render)

- Node service
- Start command:
  ```bash
  node server.js
  ```
- Environment variables:
  ```env
  DATABASE_URL=...
  ```

---

## Progressive Web App

- Installable on mobile via browser
- Offline-ready application shell
- Persistent mini-player across views

---

## Roadmap

- Episode bookmarks
- Tags for notes
- Podcast discovery and search
- User accounts and sync
- Advanced playback controls
- AI-assisted note summaries

---

## Author

Built by DykFlint.

---

## License

MIT
