# Lost & Found Portal - Backend

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and edit values
3. Make sure MongoDB is running
4. `npm run dev`

## Structure
- config/       DB connection
- models/       Mongoose models (User: M4, Item: M5)
- middleware/   auth (M4), upload (M5)
- controllers/  route logic
- routes/       route definitions

## Shared values (agreed by team)
- type:     lost | found
- status:   pending | verified | recovered | removed
- category: id_card, phone, wallet, books, calculator, bag, other

## Git
Each member works on own branch: feature/<module-name>. Only edit your own files.
