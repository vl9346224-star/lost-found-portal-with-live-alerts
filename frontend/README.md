# Lost & Found — Frontend (Member 1 part)

Auth pages and student shell. React + Vite.

## Run
```
npm install
npm run dev
```
Open http://localhost:5173

`.env` has `VITE_USE_MOCK=true`. Fake auth lives in the browser. Set it to `false` when Member 4's API is ready.

## API contract for Member 4
| Method | Path | Body | Response |
|---|---|---|---|
| POST | /api/auth/register | name, email, rollNumber, phone, password | `{ token, user }` |
| POST | /api/auth/login | email, password | `{ token, user }` |
| GET | /api/auth/me | — (Bearer token) | `{ user }` |
| PUT | /api/auth/me | name, phone | `{ user }` |

`user` = `{ id, name, email, rollNumber, phone, role }` where role is `student` or `admin`.
Errors: `{ message: "..." }` with 400 / 401.

## For Members 2 and 3
- `useAuth()` gives `user`, `isAuthed`, `logout`.
- Import `api` from `src/services/api.js`. Token is added for you.
- Replace `Placeholder` routes in `src/App.jsx` with your pages.
- Wrap admin routes: `<ProtectedRoute adminOnly>`.
