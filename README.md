# Mangaluru Tourist Guide — Full Stack

This package keeps the original `mangalore-tourist-guide.html` unchanged and adds a small Node.js/Express backend.

## Run in VS Code

1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. Open the VS Code terminal.
4. Run:

```bash
npm install
npm start
```

5. Open:

```text
http://127.0.0.1:3000/
```

## Backend API

- `GET /api/health` — server health check
- `GET /api/favorites` — list favorites
- `POST /api/favorites` — add a favorite
- `DELETE /api/favorites/:id` — remove a favorite
- `GET /api/reviews` — list all reviews
- `GET /api/reviews?place=Panambur%20Beach` — reviews for a place
- `POST /api/reviews` — add a review
- `DELETE /api/reviews/:id` — remove a review

Data is persisted locally in `data/db.json`.

## Notes

The original frontend file is included without code changes. The current UI remains visually/functionally the same; the backend is provided as a separate API layer for future features such as favorites, reviews, accounts, admin tools, or a database.
