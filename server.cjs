const express = require('express');
const fs = require('fs');
const path = require('path');
const PORT = 3000;
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser')



const app = express()
app.use(cors())
app.use(express.json());


// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'exam_platform'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

app.use(express.static(path.join(__dirname, 'public')));


// Admin route
app.get('/admin/candidates', (req, res) => {
    const sql = `
    SELECT c.name, c.email, m.title AS module, cm.grade
    FROM candidate_module cm
    JOIN candidate c ON cm.candidate_id = c.id
    JOIN module m ON cm.module_id = m.id
  `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Check if student has already submitted
app.get('/candidate/:candidateId/module/:moduleId/check', (req, res) => {
    const { candidateId, moduleId } = req.params;
    const sql = 'SELECT * FROM candidate_module WHERE candidate_id = ? AND module_id = ?';
    db.query(sql, [candidateId, moduleId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ alreadySubmitted: results.length > 0 });
    });
});



// Submit score endpoint
app.post('/submit-score', (req, res) => {
    const { candidateId, moduleId, grade } = req.body;

    if (!candidateId || !moduleId || grade === undefined) {
        return res.status(400).json({ success: false, message: 'Missing data' });
    }
    console.log(req.body);
    const sql = 'INSERT INTO candidate_module (candidate_id, module_id, grade) VALUES (?, ?, ?)';
    db.query(sql, [candidateId.number, moduleId, grade], (err, result) => {
        console.log(err)
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM account WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });

        if (results.length > 0) {
            const user = results[0];  // Get the first matching user
            res.json({ success: true, role: user.role, id: user.id });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});




// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
