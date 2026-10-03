# lost-found-portal-with-live-alerts

The Lost \& Found Portal is a web application that helps students report lost or found items on campus. Users can search and filter items, view details, contact owners, track personal reports, and mark items as recovered. Admins can verify reports, remove inappropriate content, update statuses, and send live alerts.

\## Setup (run both servers at the same time)



\*\*Requirements:\*\* Node.js and MongoDB running locally.



\### Backend (port 5000)

```

cd backend

npm install

copy .env.example .env      # then set JWT\_SECRET to any long random text

npm run dev

```

Create an admin: `npm run create-admin -- admin@college.edu Admin@123 "Admin"`



\### Frontend (port 5173)

```

cd frontend

npm install

npm run dev

```

Open http://localhost:5173



\### Common problems

\- `EADDRINUSE ... 5000`: an old backend is still running. Find it with `netstat -ano | findstr :5000`, then `taskkill /PID <pid> /F`.

\- "Cannot reach server": the backend is not running.



\### Shared values

\- type: `lost | found`

\- status: `pending | verified | recovered | removed`

\- category: `id\_card, phone, wallet, books, calculator, bag, other`

\- item fields: `title, description, category, location, date, contactInfo, imageUrl, reportedBy`

\- Upload field name for photos: `image`

