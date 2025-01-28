import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'url_shortener',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create URL
app.post('/api/urls', async (req, res) => {
  try {
    const { id, url } = req.body;
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO urls (id, original_url, user_ip) VALUES (?, ?, ?)',
        [id, url, req.ip]
      );
      res.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating URL:', error);
    res.status(500).json({ error: 'Failed to create URL' });
  }
});

// Get URL by ID
app.get('/api/urls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT original_url FROM urls WHERE id = ?',
        [id]
      );
      const url = rows[0];
      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }
      
      // Update click count
      await connection.execute(
        'UPDATE urls SET clicks = clicks + 1 WHERE id = ?',
        [id]
      );
      
      res.json(url);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({ error: 'Failed to fetch URL' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});