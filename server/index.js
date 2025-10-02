const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

const dbPath = path.join(__dirname, 'tokens.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([]));

app.post('/api/create-token', upload.single('image'), async (req, res) => {
  const { name, ticker, creator } = req.body;
  const image = req.file;
  try {
    const imageUrl = image ? `/uploads/${image.filename}` : '';
    const mockTxId = 'mock-' + Math.random().toString(36).slice(2);
    const tokens = JSON.parse(fs.readFileSync(dbPath));
    const tokenId = tokens.length + 1;
    tokens.push({ id: tokenId, name, ticker, imageUrl, creator, txId: mockTxId });
    fs.writeFileSync(dbPath, JSON.stringify(tokens));
    res.json({ tokenId, txId: mockTxId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create token' });
  }
});

app.listen(3001, () => console.log('Crapto server on port 3001'));
