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

// ഒന്നിച്ച് ഒന്നിലധികം മത്സരങ്ങൾ രജിസ്റ്റർ ചെയ്യാനുള്ള പുതിയ API
app.post('/api/add-students-bulk', (req, res) => {
    const { chestNumber, name, items, team } = req.body;
    let students = getRegisteredStudents();
    
    // ലഭിച്ച ഓരോ മത്സരത്തെയും ഓരോ പുതിയ എൻട്രി ആയി പുഷ് ചെയ്യുന്നു
    items.forEach(item => {
        // ഒരേ കുട്ടി ഒരേ മത്സരത്തിന് ഡ്യൂപ്ലിക്കേറ്റ് വരുന്നത് തടയാൻ
        const isDuplicate = students.some(s => s.chestNumber === chestNumber && s.item === item);
        if(!isDuplicate) {
            students.push({ chestNumber, name, item, team, place: "", grade: "", mark: 0 });
        }
    });
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
    res.json({ success: true });
});

app.get('/api/results-all', (req, res) => {
    res.json(getRegisteredStudents());
});

app.get('/api/results', (req, res) => {
    res.json(getRegisteredStudents());
});

app.post('/api/submit-judgement', (req, res) => {
    const { chestNumber, item, place, grade } = req.body;
    let students = getRegisteredStudents();
    
    let found = false;
    students = students.map(s => {
        if (s.chestNumber === chestNumber && s.item === item) {
            s.place = place || "";
            s.grade = grade || "";
            found = true;
        }
        return s;
    });

    if (!found) {
        return res.status(404).json({ success: false, error: "ഈ കുട്ടിയെ ഈ മത്സരത്തിൽ കണ്ടെത്തിയില്ല!" });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
