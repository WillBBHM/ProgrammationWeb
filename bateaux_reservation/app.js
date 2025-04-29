const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Configuration via variables d'environnement ou valeurs par défaut
const port = process.env.PORT || 3001;
const boatApiUrl = process.env.BOAT_API_URL || 'http://boat-app-service:3000';
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-service',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'bateau',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
};

let pool;
async function connectToDatabase() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('Connecté à la base de données MySQL.');
  } catch (err) {
    console.error('Erreur lors de la connexion à la base de données :', err.message);
    process.exit(1);
  }
}
connectToDatabase();

app.use(express.json());
app.use(cors());

// Middleware pour vérifier si un bateau existe via l'API bateau
async function checkBoatExists(req, res, next) {
  const boatId = req.body.boatId || req.params.boatId;
  if (!boatId) {
    return res.status(400).json({ error: 'L\'ID du bateau est requis.' });
  }

  try {
    console.log(`Vérification du bateau à l'URL : ${boatApiUrl}/boats/${boatId}`);
    const { data } = await axios.get(`${boatApiUrl}/boats/${boatId}`);
    if (data.error || !data.id) {
      return res.status(404).json({ error: `Bateau avec l'ID ${boatId} non trouvé.` });
    }
    next();
  } catch (err) {
    console.error('Erreur lors de la vérification du bateau :', err.message);
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: `Bateau avec l'ID ${boatId} non trouvé.` });
    }
    return res.status(503).json({ error: 'Service bateau indisponible.' });
  }
}

// Middleware pour vérifier les disponibilités du bateau
async function checkBoatAvailability(req, res, next) {
  const { boatId, startDate, endDate } = req.body;
  const reservationId = req.params.id || null; // Récupérer l'ID de la réservation pour un UPDATE

  if (!boatId || !startDate || !endDate) {
    return res.status(400).json({ error: 'ID bateau, date de début et date de fin sont requis.' });
  }

  // Vérifier que la date de début est avant la date de fin
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ error: 'La date de début doit être avant la date de fin.' });
  }

  try {
    let query = `
      SELECT * FROM reservation 
      WHERE boatId = ? 
      AND (
        (startDate <= ? AND endDate >= ?)
        OR (startDate <= ? AND endDate >= ?)
        OR (startDate >= ? AND endDate <= ?)
      )
    `;
    let params = [boatId, startDate, startDate, endDate, endDate, startDate, endDate];

    // Si c'est une mise à jour, exclure la réservation actuelle de la vérification
    if (reservationId) {
      query += ` AND id != ?`;
      params.push(reservationId);
    }

    const [rows] = await pool.execute(query, params);

    if (rows.length > 0) {
      return res.status(409).json({ error: 'Le bateau est déjà réservé pour cette période par une autre réservation.' });
    }
    next();
  } catch (err) {
    console.error('Erreur lors de la vérification des disponibilités du bateau :', err.message);
    res.status(500).json({ error: 'Erreur interne lors de la vérification des disponibilités.' });
  }
}

// Route : Récupère toutes les réservations
app.get('/reservations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservation');
    res.json(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des réservations :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des réservations.' });
  }
});

// Route : Récupère une réservation par ID
app.get('/reservations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM reservation WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération de la réservation :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération de la réservation.' });
  }
});

// Route : Crée une nouvelle réservation
app.post('/reservations', checkBoatExists, checkBoatAvailability, async (req, res) => {
  const { id, fullName, startDate, endDate, boatId, email, phone, totalPrice, status } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO reservation (id, fullName, startDate, endDate, boatId, email, phone, totalPrice, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, fullName, startDate, endDate, boatId, email, phone, totalPrice, status || 'pending']
    );
    res.status(201).json({ id: result.insertId, message: 'Réservation créée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la création de la réservation :', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la réservation.' });
  }
});

// Route : Modifie une réservation existante
app.put('/reservations/:id', checkBoatExists, checkBoatAvailability, async (req, res) => {
  const { id } = req.params;
  const { fullName, startDate, endDate, boatId, email, phone, totalPrice, status } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE reservation 
       SET fullName = ?, startDate = ?, endDate = ?, boatId = ?, email = ?, phone = ?, totalPrice = ?, status = ? 
       WHERE id = ?`,
      [fullName, startDate, endDate, boatId, email, phone, totalPrice, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }

    res.json({ message: 'Réservation mise à jour avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la réservation :', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réservation.' });
  }
});

// Route : Supprime une réservation par ID
app.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM reservation WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }

    res.json({ message: 'Réservation supprimée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la réservation :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réservation.' });
  }
});

// Route de santé
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', message: 'Service opérationnel.' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', message: 'Erreur dans le service.' });
  }
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`Service de réservation démarré sur http://localhost:${port}`);
});
