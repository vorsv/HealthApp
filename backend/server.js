// HealthVorsv Backend - v3.1 (Resilient Production Server)
// This version includes WAL mode and a busy timeout for the database
// to prevent crashes from concurrent write operations.

const express = require('express');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

// --- Configuration ---
const app = express();
const PORT = 6969;
const DB_FILE = 'evolvefit.db';
const JWT_SECRET = 'a-super-secret-key-that-should-be-in-an-env-file';

// --- Middleware ---
app.use(cors());
app.use(express.json());

const buildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(buildPath));

// --- Database Initialization ---
const initDb = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error("Error opening database", err.message);
                return reject(err);
            }
            
            // <<< NEW: Configure database for resilience >>>
            // Set a timeout to wait for the database if it's busy, instead of crashing.
            db.configure('busyTimeout', 3000); // 3000ms = 3 seconds

            db.serialize(() => {
                // Enable Write-Ahead Logging (WAL) for better concurrency and performance.
                db.run('PRAGMA journal_mode = WAL;', (err) => {
                    if (err) return reject(err);
                });
                // <<< END NEW SECTION >>>

                db.run('PRAGMA foreign_keys = ON;', (err) => {
                    if (err) return reject(err);
                });
                db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, username TEXT, password TEXT NOT NULL, height_cm REAL, calorieGoal INTEGER DEFAULT 2000, proteinGoal INTEGER DEFAULT 120, carbsGoal INTEGER DEFAULT 250, fatsGoal INTEGER DEFAULT 60, waterGoal_ml INTEGER DEFAULT 3000)`, (err) => { if (err) return reject(err); });
                db.run(`CREATE TABLE IF NOT EXISTS foods (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, category TEXT, unit TEXT DEFAULT '100g', calories REAL, proteinG REAL, carbsG REAL, fatsG REAL)`, (err) => { if (err) return reject(err); });
                db.run(`CREATE TABLE IF NOT EXISTS food_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, foodId INTEGER NOT NULL, grams INTEGER NOT NULL, timestamp TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE, FOREIGN KEY (foodId) REFERENCES foods (id) ON DELETE CASCADE)`, (err) => { if (err) return reject(err); });
                db.run(`CREATE TABLE IF NOT EXISTS weight_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, weight_kg REAL NOT NULL, timestamp TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE)`, (err) => { if (err) return reject(err); });
                db.run(`CREATE TABLE IF NOT EXISTS water_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, amount_ml INTEGER NOT NULL, timestamp TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE)`, (err) => { if (err) return reject(err); });
                db.run(`CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, body_part TEXT NOT NULL, description TEXT)`, (err) => { if (err) return reject(err); });
                db.run(`CREATE TABLE IF NOT EXISTS workout_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, workoutId INTEGER NOT NULL, reps INTEGER, weight_kg REAL, duration_sec INTEGER, timestamp TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE, FOREIGN KEY (workoutId) REFERENCES workouts (id) ON DELETE CASCADE)`, (err) => { 
                    if (err) return reject(err);
                    console.log("All HealthVorsv tables checked/created.");
                    resolve(db);
                });
            });
        });
    });
};


// --- Main Application Start ---
const startServer = async () => {
    try {
        const db = await initDb();
        console.log(`Database initialized successfully at ${DB_FILE}`);

        // --- JWT Authentication Middleware ---
        const authenticateToken = (req, res, next) => {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token == null) return res.sendStatus(401);
        
            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user;
                next();
            });
        };

        // --- API Routes ---
        app.get('/api/health', (req, res) => res.json({ status: 'API is running' }));

        // --- AUTH ROUTES ---
        app.post('/api/auth/register', async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
            const hashedPassword = await bcrypt.hash(password, 10);
            const defaultUsername = email.split('@')[0]; 
            db.run('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', [email, hashedPassword, defaultUsername], function (err) {
                if (err) return res.status(409).json({ message: 'Email already in use' });
                res.status(201).json({ message: 'User created successfully' });
            });
        });

        app.post('/api/auth/login', (req, res) => {
            const { email, password } = req.body;
            db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
                if (err || !user || !await bcrypt.compare(password, user.password)) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
                const { password: _, ...userWithoutPassword } = user;
                res.json({ message: "Login successful", token, user: userWithoutPassword });
            });
        });
        
        // --- PROTECTED ROUTES ---
        app.get('/api/dashboard/today', authenticateToken, async (req, res) => {
            try {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayISO = todayStart.toISOString();
                const userId = req.user.id;
        
                const foodLogSql = `SELECT fl.id, fl.grams, fl.timestamp, f.name, f.calories, f.proteinG, f.carbsG, f.fatsG FROM food_logs fl JOIN foods f ON fl.foodId = f.id WHERE fl.userId = ? AND fl.timestamp >= ? ORDER BY fl.timestamp DESC`;
                const waterLogSql = `SELECT SUM(amount_ml) as total_water FROM water_logs WHERE userId = ? AND timestamp >= ?`;
                const weightLogSql = `SELECT weight_kg, timestamp FROM weight_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT 1`;
        
                const [foodLogs, waterLog, latestWeight] = await Promise.all([
                    new Promise((resolve, reject) => db.all(foodLogSql, [userId, todayISO], (err, rows) => err ? reject(err) : resolve(rows))),
                    new Promise((resolve, reject) => db.get(waterLogSql, [userId, todayISO], (err, row) => err ? reject(err) : resolve(row))),
                    new Promise((resolve, reject) => db.get(weightLogSql, [userId], (err, row) => err ? reject(err) : resolve(row)))
                ]);
        
                res.json({
                    foodLogs,
                    totalWater: waterLog?.total_water || 0,
                    latestWeight: latestWeight || null
                });
            } catch (err) {
                console.error("Error in /api/dashboard/today:", err);
                res.status(500).json({ message: 'Database error fetching dashboard data.', error: err.message });
            }
        });
        
        app.get('/api/history', authenticateToken, async (req, res) => {
            const { range } = req.query; 
            let dateLimit = new Date();
            if (range === '7') dateLimit.setDate(dateLimit.getDate() - 7);
            else if (range === '30') dateLimit.setDate(dateLimit.getDate() - 30);
            else dateLimit = new Date(0); 

            try {
                const macroSql = `SELECT fl.grams, f.calories, f.proteinG, f.carbsG, f.fatsG, date(fl.timestamp) as logDate FROM food_logs fl JOIN foods f ON fl.foodId = f.id WHERE fl.userId = ? AND fl.timestamp >= ?`;
                const macroLogs = await new Promise((resolve, reject) => db.all(macroSql, [req.user.id, dateLimit.toISOString()], (err, rows) => err ? reject(err) : resolve(rows)));
                
                const dailyTotals = macroLogs.reduce((acc, log) => {
                    const date = log.logDate;
                    if (!acc[date]) {
                        acc[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
                    }
                    const ratio = log.grams / 100;
                    acc[date].calories += (log.calories || 0) * ratio;
                    acc[date].protein += (log.proteinG || 0) * ratio;
                    acc[date].carbs += (log.carbsG || 0) * ratio;
                    acc[date].fats += (log.fatsG || 0) * ratio;
                    return acc;
                }, {});

                const weightSql = `SELECT weight_kg, timestamp FROM weight_logs WHERE userId = ? AND timestamp >= ? ORDER BY timestamp ASC`;
                const weightHistory = await new Promise((resolve, reject) => db.all(weightSql, [req.user.id, dateLimit.toISOString()], (err, rows) => err ? reject(err) : resolve(rows)));

                res.json({
                    macros: dailyTotals,
                    weights: weightHistory
                });

            } catch (err) {
                 res.status(500).json({ message: 'Database error fetching history data.', error: err.message });
            }
        });

        app.get('/api/user/profile', authenticateToken, (req, res) => {
            const sql = 'SELECT id, email, username, height_cm, calorieGoal, proteinGoal, carbsGoal, fatsGoal, waterGoal_ml FROM users WHERE id = ?';
            db.get(sql, [req.user.id], (err, row) => {
                if (err) return res.status(500).json({ message: 'Database error getting profile.' });
                if (!row) return res.status(404).json({ message: 'User not found.' });
                res.json(row);
            });
        });

        app.put('/api/user/profile', authenticateToken, (req, res) => {
            const { username, height_cm, calorieGoal, proteinGoal, carbsGoal, fatsGoal, waterGoal_ml } = req.body;
            const sql = `UPDATE users SET username = ?, height_cm = ?, calorieGoal = ?, proteinGoal = ?, carbsGoal = ?, fatsGoal = ?, waterGoal_ml = ? WHERE id = ?`;
            const params = [username, height_cm, calorieGoal, proteinGoal, carbsGoal, fatsGoal, waterGoal_ml, req.user.id];
            db.run(sql, params, function(err) {
                if (err) return res.status(500).json({ message: 'Database error updating profile.' });
                res.json({ message: 'Profile updated successfully.' });
            });
        });

        app.delete('/api/food-logs/:logId', authenticateToken, (req, res) => {
            db.run('DELETE FROM food_logs WHERE id = ? AND userId = ?', [req.params.logId, req.user.id], function(err) {
                if (err) return res.status(500).json({ message: 'Database error deleting log.' });
                if (this.changes === 0) return res.status(404).json({ message: 'Log not found or user not authorized.'});
                res.status(200).json({ message: 'Food log deleted successfully.' });
            });
        });

        app.get('/api/foods', authenticateToken, (req, res) => {
            if (!req.query.q) return res.status(400).json({ message: "A search query 'q' is required." });
            db.all("SELECT * FROM foods WHERE name LIKE ? LIMIT 20", [`%${req.query.q}%`], (err, rows) => {
                if (err) return res.status(500).json({ message: 'Database error searching foods.' });
                res.json(rows);
            });
        });
        
        app.post('/api/foods/custom', authenticateToken, (req, res) => {
            const { name, calories, proteinG, carbsG, fatsG } = req.body;
            if(!name || calories === undefined || proteinG === undefined || carbsG === undefined || fatsG === undefined) {
                return res.status(400).json({ message: 'All nutritional fields are required.'});
            }
            const sql = `INSERT INTO foods (name, category, calories, proteinG, carbsG, fatsG) VALUES (?, ?, ?, ?, ?, ?)`;
            const params = [name, 'Custom', calories, proteinG, carbsG, fatsG];
            db.run(sql, params, function(err) {
                if (err) {
                    return res.status(500).json({message: 'Failed to add custom food.'});
                }
                const newFood = { id: this.lastID, name: name, category: 'Custom', calories: calories, proteinG: proteinG, carbsG: carbsG, fatsG: fatsG };
                res.status(201).json(newFood);
            });
        });

        app.post('/api/food-logs', authenticateToken, (req, res) => {
            const { foodId, grams } = req.body;
            if (!foodId || !grams || isNaN(parseInt(grams))) return res.status(400).json({ message: 'Valid foodId and grams are required.' });
            db.run('INSERT INTO food_logs (userId, foodId, grams, timestamp) VALUES (?, ?, ?, ?)', [req.user.id, foodId, grams, new Date().toISOString()], function(err) {
                if (err) return res.status(500).json({ message: 'Database error logging food.' });
                res.status(201).json({ message: 'Food logged successfully.', logId: this.lastID });
            });
        });

        app.post('/api/water-logs', authenticateToken, (req, res) => {
            const { amount_ml } = req.body;
            if (!amount_ml || isNaN(parseInt(amount_ml))) return res.status(400).json({ message: 'Valid amount_ml is required.' });
            db.run('INSERT INTO water_logs (userId, amount_ml, timestamp) VALUES (?, ?, ?)', [req.user.id, parseInt(amount_ml), new Date().toISOString()], function (err) {
                if (err) return res.status(500).json({ message: 'Database error logging water.' });
                res.status(201).json({ message: 'Water logged successfully.', logId: this.lastID });
            });
        });

        app.post('/api/weight-logs', authenticateToken, (req, res) => {
            const { weight_kg } = req.body;
            if (!weight_kg || isNaN(parseFloat(weight_kg))) return res.status(400).json({ message: 'Valid weight_kg is required.' });
            db.run('INSERT INTO weight_logs (userId, weight_kg, timestamp) VALUES (?, ?, ?)', [req.user.id, parseFloat(weight_kg), new Date().toISOString()], function (err) {
                if (err) return res.status(500).json({ message: 'Database error logging weight.' });
                res.status(201).json({ message: 'Weight logged successfully.', logId: this.lastID });
            });
        });

        app.get('*', (req, res) => {
            res.sendFile(path.join(buildPath, 'index.html'));
        });

        // --- Start Server ---
        const server = http.createServer(app);
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
            console.log("HealthVorsv is now a unified application. You can access it directly at the server address.");
        });

    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
