const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const getJsonPath = () => path.join(__dirname, 'students.json');

// 📋 എല്ലാ പേജുകൾക്കും കുട്ടികളുടെ ലിസ്റ്റ് എടുക്കാനുള്ള പൊതുവായ API
app.get('/api/students', (req, res) => {
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        if (err) return res.status(500).json([]);
        res.json(JSON.parse(data));
    });
});

// ➕ പുതിയ കുട്ടിയെ ആഡ് ചെയ്യാൻ
app.post('/api/students', (req, res) => {
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        let students = err ? [] : JSON.parse(data);
        students.push(req.body);
        fs.writeFile(getJsonPath(), JSON.stringify(students, null, 2), () => {
            res.json({ message: "Success" });
        });
    });
});

// 📝 കുട്ടിയുടെ വിവരങ്ങൾ തിരുത്താൻ
app.put('/api/students/:id', (req, res) => {
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error" });
        let students = JSON.parse(data);
        const index = students.findIndex(s => s.id === req.params.id);
        if (index !== -1) {
            students[index] = { ...students[index], ...req.body };
            fs.writeFile(getJsonPath(), JSON.stringify(students, null, 2), () => {
                res.json({ message: "Updated" });
            });
        } else {
            res.status(404).json({ error: "Not Found" });
        }
    });
});

// ❌ കുട്ടിയെ ഡിലീറ്റ് ചെയ്യാൻ
app.delete('/api/students/:id', (req, res) => {
    fs.readFile(getJsonPath(), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error" });
        let students = JSON.parse(data);
        students = students.filter(s => s.id !== req.params.id);
        fs.writeFile(getJsonPath(), JSON.stringify(students, null, 2), () => {
            res.json({ message: "Deleted" });
        });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
