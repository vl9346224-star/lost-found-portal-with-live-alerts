# Lost & Found Portal - Backend

Node.js + Express + MongoDB (Mongoose) + JWT auth + Socket.IO live alerts.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` (set `JWT_SECRET`)
3. Start MongoDB, then `npm run dev`
4. Create an admin: `npm run create-admin -- admin@college.edu Admin@123 "Admin"`
5. Check everything: `npm run test:smoke`

## Shared values
- type: `lost | found`
- status: `pending | verified | recovered | removed`
- category: `id_card, phone, wallet, books, calculator, bag, other`

Protected routes need the header `Authorization: Bearer <token>`.

## Auth  (/api/auth)
| Method | Route | Purpose |
|---|---|---|
| POST | /register | name, email, password, [rollNumber, phone] -> token + user |
| POST | /login | email, password -> token + user |
| GET | /me | current user |
| PUT | /me | update name/phone/rollNumber, or newPassword + currentPassword |

## Items  (/api/items)  - login required, multipart form-data, image field: `image`
| Method | Route | Purpose |
|---|---|---|
| POST | /lost, /found | report item (title, description, category, location, date, contactInfo) |
| GET | /lost, /found | list items |
| GET | /my | my reports |
| GET | /:id | item details |
| PUT | /:id | edit own report |
| DELETE | /:id | delete own report |
| PATCH | /:id/recovered | mark as recovered |

## Search  (/api/search)  - login required
| Method | Route | Purpose |
|---|---|---|
| GET | / | `?q=&type=&category=&status=&location=&from=&to=&sort=&page=&limit=` -> {items,total,page,pages} |
| GET | /recovered | recovered items (same paging) |
| GET | /meta | types, categories, statuses for dropdowns |

## Admin  (/api/admin)  - admin only
| Method | Route | Purpose |
|---|---|---|
| GET | /stats | counts by status/type + users |
| GET | /reports | all reports incl. removed (`status,type,category,q,page,limit`) |
| PATCH | /reports/:id/verify | verify a report |
| PATCH | /reports/:id/status | body `{status}` |
| DELETE | /reports/:id | remove (soft); `?hard=true` deletes permanently; body `{reason}` |
| GET | /users | list users |

## Notifications  (/api/notifications)
| Method | Route | Purpose |
|---|---|---|
| GET | / | my notifications + unread count |
| PATCH | /:id/read | mark one read |
| PATCH | /read-all | mark all read |

## Live alerts (Socket.IO)
Connect: `io("http://localhost:5000", { auth: { token } })` (token optional for public events).
| Event | Who gets it | When |
|---|---|---|
| newItem | everyone | a lost/found report is created |
| itemRecovered | everyone | an item is marked recovered |
| itemStatusChanged | everyone | admin verifies / changes status |
| itemRemoved | everyone | admin removes a report |
| adminNewReport | admins | a new report needs verification |
| notification | the affected user | possible match, verified, status changed, removed |
