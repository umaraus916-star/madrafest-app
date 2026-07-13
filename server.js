const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'registered_students.json');
const DB_FILE = path.join(__dirname, 'students.json');

function getRegisteredStudents() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function getDbStudents() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

app.get('/api/db-students', (req, res) => {
    res.json(getDbStudents());
});

app.post('/api/add-student', (req, res) => {
    const { chestNumber, name, item, team } = req.body;
    let students = getRegisteredStudents();
    
    students.push({ chestNumber, name, item, team, place: "", grade: "", mark: 0 });
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
    
    res.json({ success: true });
});

app.get('/api/results-all', (req, res) => {
    res.json(getRegisteredStudents());
});

app.get('/api/results', (req, res) => {
    res.json(getRegisteredStudents());
});

// ജഡ്ജിമാരുടെ പുതിയ റിസൾട്ട് സബ്മിഷൻ API
app.post('/api/submit-judgement', (req, res) => {
    const { chestNumber, place, grade } = req.body;
    let students = getRegisteredStudents();
    
    let found = false;
    students = students.map(s => {
        if (s.chestNumber === chestNumber) {
            s.place = place || "";
            s.grade = grade || "";
            found = true;
        }
        return s;
    });

    if (!found) {
        return res.status(404).json({ success: false, error: "ഈ കുട്ടി മത്സരത്തിൽ രജിസ്റ്റർ ചെയ്തിട്ടില്ല!" });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
