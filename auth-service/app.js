const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
// Pas besoin de dotenv ici si les variables sont fournies par l'environnement (Kubernetes/Docker)

const app = express();
// Utiliser process.env.PORT fourni par l'environnement ou 3003 par défaut
const port = process.env.PORT || 3003;

// Middleware
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Pour parser le JSON dans le corps des requêtes

// Configuration de la base de données basée sur la configuration fournie
// Utilise les variables d'environnement (préférable) ou les valeurs par défaut
const dbConfig = {
    host: process.env.DB_HOST || 'mysql-service',
    port: parseInt(process.env.DB_PORT || '3306', 10), // Assurer que le port est un nombre
    database: process.env.DB_NAME || 'bateau',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root', // Fallback à 'root' si non défini
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // Ajout d'un timeout de connexion
};

// Pool de connexions
let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Pool de connexion MySQL créé.');

    // Test de connexion asynchrone pour ne pas bloquer le démarrage si DB pas prête immédiatement
    pool.getConnection()
        .then(connection => {
            console.log('Connexion initiale à la base de données réussie.');
            connection.release();
        })
        .catch(err => {
            // Log l'erreur mais ne pas forcément quitter, le pool réessaiera peut-être
            console.error(`Attention : Erreur lors du test de connexion initial à la DB (${err.code || err.message}). Le service démarre quand même.`);
        });
} catch (error) {
    console.error('Erreur critique lors de la création du pool de connexion MySQL:', error);
    process.exit(1); // Arrêter si le pool ne peut pas être créé du tout
}


// --- Routes ---

// Route d'enregistrement (POST /register)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Renommé 'password' en 'mot_de_passe' pour correspondre à la colonne SQL
    const mot_de_passe = password;

    if (!username || !mot_de_passe) {
        console.log('Échec enregistrement: username ou password manquant.');
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        console.log(`[Register] Tentative d'enregistrement pour : ${username}`);

        // 1. Vérifier si l'utilisateur existe déjà (username est PK)
        const [existingUsers] = await connection.query(
            'SELECT username FROM login WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            console.log(`[Register] Échec : le nom d'utilisateur "${username}" existe déjà.`);
            return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });
        }

        // 2. Insérer le nouvel utilisateur avec 'mot_de_passe'
        const [result] = await connection.query(
            'INSERT INTO login (username, mot_de_passe) VALUES (?, ?)',
            [username, mot_de_passe] // Mot de passe stocké tel quel !
        );

        if (result.affectedRows === 1) {
            console.log(`[Register] Succès : Utilisateur "${username}" enregistré.`);
            res.status(201).json({ message: 'Utilisateur enregistré avec succès.', username: username });
        } else {
             console.error(`[Register] Échec insertion DB pour "${username}", affectedRows: ${result.affectedRows}`);
             res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'utilisateur.' });
        }

    } catch (error) {
        console.error(`[Register] Erreur pour ${username}:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà pris (conflit base de données).' });
        }
        res.status(500).json({ message: 'Erreur interne du serveur lors de l\'enregistrement.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Route de connexion (POST /login)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log('Échec connexion: username ou password manquant.');
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        console.log(`[Login] Tentative de connexion pour : ${username}`);

        // Rechercher l'utilisateur par username et récupérer le mot de passe stocké
        const [users] = await connection.query(
            'SELECT username, mot_de_passe FROM login WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            console.log(`[Login] Échec : utilisateur "${username}" non trouvé.`);
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        const user = users[0];

        // Comparer le mot de passe fourni avec 'mot_de_passe' stocké en CLAIR
        if (password === user.mot_de_passe) {
            console.log(`[Login] Succès : Connexion réussie pour "${username}".`);
            // La réponse contient uniquement le username
            res.status(200).json({
                message: 'Connexion réussie.',
                user: {
                    username: user.username
                }
                // Pas de token généré comme demandé
            });
        } else {
            console.log(`[Login] Échec : Mot de passe incorrect pour "${username}".`);
            res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

    } catch (error) {
        console.error(`[Login] Erreur pour ${username}:`, error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la connexion.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Route simple pour vérifier la santé du service (health check)
app.get('/health', (req, res) => {
    // Pourrait éventuellement vérifier la connexion DB ici aussi
    res.status(200).send('OK');
});


// Route racine pour confirmation de démarrage
app.get('/', (req, res) => {
    res.send('Auth Service (adapté, non sécurisé) is running!');
});

// Middleware de gestion d'erreurs global (attrape les erreurs non gérées dans les routes)
app.use((err, req, res, next) => {
  console.error("Erreur non gérée interceptée:", err.stack);
  res.status(500).json({ message: 'Une erreur inattendue est survenue sur le serveur.'});
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`---------------------------------------------------------------------`);
    console.log(` AUTH SERVICE (NON SÉCURISÉ) DÉMARRÉ SUR LE PORT ${port}`);
    console.log(`---------------------------------------------------------------------`);
    console.log(`Config DB utilisée : host=${dbConfig.host}, port=${dbConfig.port}, database=${dbConfig.database}, user=${dbConfig.user}`);
    console.warn(" Rappel : Les mots de passe sont stockés et vérifiés EN CLAIR.");
    console.warn("           NE PAS UTILISER CETTE CONFIGURATION EN PRODUCTION.");
    console.log(`---------------------------------------------------------------------`);
});