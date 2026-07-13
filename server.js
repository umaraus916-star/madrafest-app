const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'registered_students.json');
const DB_FILE = path.join(__dirname, 'students.json');

// രജിസ്റ്റർ ചെയ്ത കുട്ടികളുടെ ഡാറ്റ എടുക്കാൻ
function getRegisteredStudents() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// മാസ്റ്റർ ഡാറ്റാബേസ് (86 കുട്ടികളുടെ ലിസ്റ്റ്) എടുക്കാൻ
function getDbStudents() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// API: മാസ്റ്റർ ലിസ്റ്റ് ഫോമിലേക്ക് നൽകാൻ
app.get('/api/db-students', (req, res) => {
    res.json(getDbStudents());
});

// API: പുതിയ മത്സരത്തിലേക്ക് കുട്ടിയെ രജിസ്റ്റർ ചെയ്യാൻ
app.post('/api/add-student', (req, res) => {
    const { chestNumber, name, item, team } = req.body;
    let students = getRegisteredStudents();
    
    students.push({ chestNumber, name, item, team, mark: 0 });
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
    
    res.json({ success: true });
});

// API: റിസൾട്ടുകൾ കാണിക്കാൻ
app.get('/api/results', (req, res) => {
    res.json(getRegisteredStudents());
});

// API: ജഡ്ജിമാർക്ക് മാർക്ക് രേഖപ്പെടുത്താൻ
app.post('/api/submit-mark', (req, res) => {
    const { chestNumber, mark } = req.body;
    let students = getRegisteredStudents();
    
    let found = false;
    students = students.map(s => {
        if (s.chestNumber === chestNumber) {
            s.mark = parseInt(mark);
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
