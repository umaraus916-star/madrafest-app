const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'students.json');

const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

app.get('/api/results', (req, res) => {
    res.json(readData());
});

// പുതിയ കുട്ടിയുടെ വിവരങ്ങൾ ചേർക്കാനുള്ള പുതിയ വഴി (API)
app.post('/api/add-student', (req, res) => {
    const { chestNumber, name, item, team } = req.body;
    let students = readData();

    // ഒരേ ചെസ്റ്റ് നമ്പർ മുൻപ് ഉണ്ടോ എന്ന് നോക്കുന്നു
    const exists = students.some(s => s.chestNumber === chestNumber);
    if (exists) {
        return res.status(400).json({ error: "ഈ ചെസ്റ്റ് നമ്പർ നിലവിലുണ്ട്!" });
    }

    // പുതിയ കുട്ടിയെ ലിസ്റ്റിലേക്ക് ചേർക്കുന്നു (തുടക്കത്തിൽ മാർക്ക് 0)
    students.push({ chestNumber, name, item, team, mark: 0 });
    writeData(students);

    res.json({ success: true, message: "Student added successfully!" });
});

app.post('/api/submit-mark', (req, res) => {
    const { chestNumber, mark } = req.body;
    let students = readData();
    
    const student = students.find(s => s.chestNumber === chestNumber);
    if (student) {
        student.mark = Number(mark);
        writeData(students);
        return res.json({ success: true });
    } else {
        return res.status(404).json({ error: "Chest number കണ്ടെത്തിയില്ല!" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
