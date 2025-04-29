const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

// Configuration via variables d'environnement (avec valeurs par défaut)
const port = process.env.PORT || 3000;
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-service', // Nom du service MySQL sur Kubernetes
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'bateau',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  connectionLimit: 10 // Limite de connexions dans le pool
};

// Fonction pour tenter de se connecter à la base de données avec rétentatives
let pool;
async function connectToDatabase(retries = 5, delay = 2000) {
  for (let attempts = 1; attempts <= retries; attempts++) {
    try {
      pool = await mysql.createPool(dbConfig);
      const connection = await pool.getConnection();
      console.log('Connecté à la base de données MySQL sur Kubernetes.');
      connection.release();
      return pool;
    } catch (err) {
      console.error(`Erreur lors de la connexion à la base de données (tentative ${attempts}/${retries}) :`, err.message);
      if (attempts === retries) {
        throw new Error('Impossible de se connecter à la base de données après plusieurs tentatives.');
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Initialisation de la connexion à la base de données
connectToDatabase()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

// Middleware pour parser les requêtes JSON
app.use(express.json());
app.use(cors());

// Route pour afficher la liste de tous les bateaux
app.get('/boats', async (req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'Base de données non disponible. Réessayez plus tard.' });
    return;
  }
  try {
    const [rows] = await pool.query('SELECT * FROM bateau_liste');
    res.json(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des bateaux :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des bateaux.' });
  }
});

// Route pour afficher les informations d'un bateau spécifique par ID
app.get('/boats/:id', async (req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'Base de données non disponible. Réessayez plus tard.' });
    return;
  }
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM bateau_liste WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Bateau non trouvé.' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération du bateau :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du bateau.' });
  }
});

// Route pour vérifier la disponibilité d'un bateau
app.get('/boats/:id/availability', async (req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'Base de données non disponible. Réessayez plus tard.' });
    return;
  }
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT disponibilite FROM bateau_liste WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Bateau non trouvé.' });
      return;
    }
    res.json({ id: id, disponibilite: rows[0].disponibilite });
  } catch (err) {
    console.error('Erreur lors de la vérification de la disponibilité :', err.message);
    res.status(500).json({ error: 'Erreur lors de la vérification de la disponibilité.' });
  }
});

// Route pour créer une réservation
app.post('/reservations', async (req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'Base de données non disponible. Réessayez plus tard.' });
    return;
  }
  const { nom_personne, date_debut, date_fin, id_bateau } = req.body;
  if (!nom_personne || !date_debut || !date_fin || !id_bateau) {
    res.status(400).json({ error: 'Tous les champs (nom_personne, date_debut, date_fin, id_bateau) sont requis.' });
    return;
  }
  try {
    // Vérifier la disponibilité du bateau
    const [boatRows] = await pool.query('SELECT disponibilite FROM bateau_liste WHERE id = ?', [id_bateau]);
    if (boatRows.length === 0) {
      res.status(404).json({ error: 'Bateau non trouvé.' });
      return;
    }
    if (!boatRows[0].disponibilite) {
      res.status(409).json({ error: 'Bateau non disponible pour la réservation.' });
      return;
    }
    // Insérer la réservation
    const [result] = await pool.query(
      'INSERT INTO reservation (nom_personne, date_debut, date_fin, id_bateau) VALUES (?, ?, ?, ?)',
      [nom_personne, date_debut, date_fin, id_bateau]
    );
    // Mettre à jour la disponibilité du bateau
    await pool.query('UPDATE bateau_liste SET disponibilite = FALSE WHERE id = ?', [id_bateau]);
    res.status(201).json({ id: result.insertId, message: 'Réservation créée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la création de la réservation :', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la réservation.' });
  }
});

// Route pour authentification (login)
app.post('/login', async (req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'Base de données non disponible. Réessayez plus tard.' });
    return;
  }
  const { username, mot_de_passe } = req.body;
  if (!username || !mot_de_passe) {
    res.status(400).json({ error: 'Nom d’utilisateur et mot de passe requis.' });
    return;
  }
  try {
    const [rows] = await pool.query('SELECT * FROM login WHERE username = ? AND mot_de_passe = ?', [username, mot_de_passe]);
    if (rows.length === 0) {
      res.status(401).json({ error: 'Nom d’utilisateur ou mot de passe incorrect.' });
      return;
    }
    res.json({ message: 'Authentification réussie.', username: username });
  } catch (err) {
    console.error('Erreur lors de l’authentification :', err.message);
    res.status(500).json({ error: 'Erreur lors de l’authentification.' });
  }
});

// Route de santé pour vérifier si le service est opérationnel
app.get('/health', async (req, res) => {
  if (!pool) {
    res.status(503).json({ status: 'unhealthy', message: 'Base de données non connectée.' });
    return;
  }
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', message: 'Service opérationnel.' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', message: 'Base de données non accessible.' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

// Gestion de la fermeture de la base de données lors de l'arrêt du serveur
process.on('SIGINT', async () => {
  if (pool) {
    await pool.end();
    console.log('Connexion au pool de base de données MySQL fermée.');
  }
  process.exit(0);
});
