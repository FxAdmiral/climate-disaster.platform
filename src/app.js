/**
 * backend/src/app.js
 * Main Express entrypoint — mounts routes and starts the server.
 *
 * Run: node src/app.js   (or: npx nodemon src/app.js)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Establishes the pool and logs "Connected to PostgreSQL" on first connection.
require('./database/connection');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/flood', require('./routes/flood'));
app.use('/api/discharge', require('./routes/discharge'));
app.use('/api/risk', require('./routes/risk'));
app.use('/api/predict', require('./routes/prediction'));
app.use('/api/ingest', require('./routes/ingestion'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));