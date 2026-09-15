const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'db.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ favorites: [], reviews: [] }, null, 2));
  }
}

function readDb() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    throw new Error('Could not read the database file.');
  }
}

function writeDb(db) {
  ensureDataFile();
  const temp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, DATA_FILE);
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function cleanString(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'mangalore-tourist-guide-api' });
});

app.get('/api/favorites', (req, res) => {
  const db = readDb();
  res.json(db.favorites);
});

app.post('/api/favorites', (req, res) => {
  const place = cleanString(req.body.place, 200);
  if (!place) return res.status(400).json({ error: 'place is required' });

  const db = readDb();
  const exists = db.favorites.find((item) => item.place.toLowerCase() === place.toLowerCase());
  if (exists) return res.status(409).json({ error: 'place is already a favorite', favorite: exists });

  const favorite = {
    id: nextId(db.favorites),
    place,
    createdAt: new Date().toISOString()
  };
  db.favorites.push(favorite);
  writeDb(db);
  res.status(201).json(favorite);
});

app.delete('/api/favorites/:id', (req, res) => {
  const id = Number(req.params.id);
  const db = readDb();
  const before = db.favorites.length;
  db.favorites = db.favorites.filter((item) => Number(item.id) !== id);
  if (db.favorites.length === before) return res.status(404).json({ error: 'favorite not found' });
  writeDb(db);
  res.status(204).end();
});

app.get('/api/reviews', (req, res) => {
  const place = cleanString(req.query.place, 200).toLowerCase();
  const db = readDb();
  const reviews = place ? db.reviews.filter((item) => item.place.toLowerCase() === place) : db.reviews;
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const place = cleanString(req.body.place, 200);
  const author = cleanString(req.body.author, 80);
  const text = cleanString(req.body.text, 1000);
  const rating = Number(req.body.rating);

  if (!place || !author || !text) {
    return res.status(400).json({ error: 'place, author and text are required' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5' });
  }

  const db = readDb();
  const review = {
    id: nextId(db.reviews),
    place,
    author,
    rating,
    text,
    createdAt: new Date().toISOString()
  };
  db.reviews.push(review);
  writeDb(db);
  res.status(201).json(review);
});

app.delete('/api/reviews/:id', (req, res) => {
  const id = Number(req.params.id);
  const db = readDb();
  const before = db.reviews.length;
  db.reviews = db.reviews.filter((item) => Number(item.id) !== id);
  if (db.reviews.length === before) return res.status(404).json({ error: 'review not found' });
  writeDb(db);
  res.status(204).end();
});

app.use(express.static(ROOT));

app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'mangalore-tourist-guide.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Mangaluru Tourist Guide running at http://${HOST}:${PORT}`);
});
