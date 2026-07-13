const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const getJsonPath = () => path.join(__dirname, 'students.json');

// 1. മുഴുവൻ കുട്ടികളുടെയും ലിസ്റ്റ് എടുക്കാൻ
app.get('/api/students', (req, res) => {
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "ഡാറ്റ വായിക്കാൻ കഴിഞ്ഞില്ല" });
        res.json(JSON.parse(data));
    });
});

// 2. പുതിയ കുട്ടിയെ ആഡ് ചെയ്യാൻ
app.post('/api/students', (req, res) => {
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        let students = err ? [] : JSON.parse(data);
        students.push(req.body);
        fs.writeFile(getJsonPath(), JSON.stringify(students, null, 2), () => {
            res.json({ message: "Student Added Successfully" });
        });
    });
});

// 3. നിലവിലുള്ള കുട്ടിയുടെ വിവരങ്ങൾ തിരുത്താൻ (Edit/Update)
app.put('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "ഡാറ്റ വായിക്കാൻ കഴിഞ്ഞില്ല" });
        let students = JSON.parse(data);
        const index = students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            students[index] = { ...students[index], ...req.body };
            fs.writeFile(getJsonPath(), JSON.stringify(students, null, 2), () => {
                res.json({ message: "Student Updated Successfully" });
            });
        } else {
            res.status(404).json({ error: "കുട്ടിയെ കണ്ടെത്താനായില്ല" });
        }
    });
});

// 4. കുട്ടിയെ ഡിലീറ്റ് ചെയ്യാൻ
app.delete('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error" });
        let students = JSON.parse(data);
        students = students.filter(s => s.id !== studentId);
        fs.writeFile(getJsonPath(), JSON.stringify(students, null, 2), () => {
            res.json({ message: "Student Deleted" });
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
