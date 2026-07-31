# HomeDrive

A lightweight self-hosted cloud storage platform. Node.js + Express + PostgreSQL API, React (Vite + Tailwind) frontend.

## Installation

```bash
npm install
cp .env.example .env   # fill in your DB credentials and a JWT secret
npm run build           # installs client deps and builds the React app into client/dist
```

### Database setup

```bash
createdb homedrive
psql -d homedrive -f database/schema.sql
psql -d homedrive -f database/seed.sql   # optional demo user
```

Demo login (from seed.sql): `demo@homedrive.local` / `password123`

### Run

```bash
npm start          # serves the API + the built React app on one port
```

Visit `http://localhost:3000`.

### Frontend development

For live-reloading the UI while working on it, run the API and the Vite dev server side by side:

```bash
npm run dev              # terminal 1: Express API on :3000
npm run dev --prefix client   # terminal 2: Vite dev server on :5173, proxies /api to :3000
```

Then work against `http://localhost:5173`. When done, `npm run build` regenerates `client/dist` for production.

## Folder Structure

```
HomeDrive/
  server/
    controllers/   # request/response logic only
    routes/         # endpoint definitions (JSON API)
    models/         # SQL queries
    middleware/     # auth, upload, error handling
    utils/          # logger, sanitizer, storage paths
    config/         # db connection
    app.js
    server.js
  client/           # React (Vite + Tailwind) frontend
    src/
      pages/        # Auth.jsx, Dashboard.jsx
      components/   # Cards.jsx, Modals.jsx
      api.js         # fetch wrapper for the JSON API
    dist/            # built output, served by Express
  storage/
    users/<id>/     # each user's files
    trash/          # soft-deleted files
    temp/
  database/
    schema.sql
    seed.sql
  logs/
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in, sets JWT cookie |
| POST | /api/auth/logout | Clear session |
| GET | /api/auth/me | Current logged-in user (used by the React app on load) |

### Folders
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/folders?parentId= | List folders |
| POST | /api/folders | Create folder |
| PUT | /api/folders/:id/rename | Rename |
| PUT | /api/folders/:id/move | Move |
| DELETE | /api/folders/:id | Delete |

### Files
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/files?folderId= | List files in a folder |
| GET | /api/files/recent | 8 most recently added files |
| GET | /api/files/search?q= | Search by name |
| GET | /api/files/storage | Total bytes used |
| GET | /api/files/trash | List trashed files |
| GET | /api/files/favorites | List favorites |
| POST | /api/files/upload | Upload (multipart, field `file`) |
| GET | /api/files/:id/download | Force download |
| GET | /api/files/:id/preview | Stream inline for in-browser preview |
| PUT | /api/files/:id/rename | Rename |
| PUT | /api/files/:id/move | Move to another folder |
| POST | /api/files/:id/trash | Soft delete |
| POST | /api/files/:id/restore | Restore from trash |
| DELETE | /api/files/:id | Permanently delete |
| POST/DELETE | /api/files/:id/favorite | Add/remove favorite |

## Database Schema

See `database/schema.sql`. Tables: `users`, `folders`, `files`, `favorites`, `trash`, `shared_links`. Files are never stored in Postgres — only metadata and a relative path into `storage/users/<id>/`.

## Deployment

1. Provision a PostgreSQL instance and run `schema.sql`.
2. Set real values in `.env` (especially `JWT_SECRET` and `NODE_ENV=production`).
3. Run `npm run build` to produce `client/dist`.
4. Put the app behind a reverse proxy (Nginx/Caddy) that terminates TLS.
5. Run with a process manager, e.g. `pm2 start server/server.js --name homedrive`.
6. Make sure `storage/` and `logs/` are on persistent, backed-up disk.

## Screenshots

_placeholder — add screenshots of the login page and dashboard here._

## Future Improvements

- Public shareable links (table already exists: `shared_links`)
- Drag-and-drop upload and a folder picker for "move" (currently a simple ID prompt)
- Thumbnail generation for images/videos
- Per-user storage quotas
- Two-factor authentication

