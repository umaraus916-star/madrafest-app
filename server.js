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

app.post('/api/add-students-bulk', (req, res) => {
    const { chestNumber, name, items, team } = req.body;
    let students = getRegisteredStudents();
    
    items.forEach(item => {
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

// അഡ്മിന് ഡാറ്റ ഡിലീറ്റ് ചെയ്യാനുള്ള API
app.post('/api/delete-student', (req, res) => {
    const { index } = req.body;
    let students = getRegisteredStudents();
    
    if (index >= 0 && index < students.length) {
        students.splice(index, 1); // ആ നിർദ്ദിഷ്ട എൻട്രി നീക്കം ചെയ്യുന്നു
        fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
        return res.json({ success: true });
    }
    res.status(400).json({ success: false, error: "Invalid index" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
