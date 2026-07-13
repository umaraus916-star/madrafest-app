const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// എല്ലാ സ്റ്റാറ്റിക് ഫയലുകളും (HTML, CSS, JS) ഓട്ടോമാറ്റിക് ആയി ലോഡ് ചെയ്യാൻ ഇത് സഹായിക്കും
app.use(express.static(__dirname));

// 🌐 എല്ലാ പ്രധാന പേജുകളുടെയും റൂട്ടുകൾ (Routing) താഴെ നൽകുന്നു:

// 1. ഹോം പേജ് (Home Page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// 2. അഡ്മിൻ പാനൽ (Admin Panel)
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 3. ജഡ്ജിങ് പാനൽ (Judge Panel)
app.get('/judge.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'judge.html'));
});

// 4. റിസൾട്ട് ബോർഡ് (Result Board)
app.get('/result.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'result.html'));
});


// 📋 കുട്ടികളുടെ ലിസ്റ്റ് എടുക്കാനുള്ള API
app.get('/api/students', (req, res) => {
    const jsonPath = path.join(__dirname, 'students.json');
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) return res.json([]);
        res.json(JSON.parse(data));
    });
});

// ➕ പുതിയ കുട്ടിയെ ആഡ് ചെയ്യാൻ
app.post('/api/students', (req, res) => {
    const jsonPath = path.join(__dirname, 'students.json');
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        let students = err ? [] : JSON.parse(data);
        students.push(req.body);
        fs.writeFile(jsonPath, JSON.stringify(students, null, 2), () => {
            res.json({ message: "Success" });
        });
    });
});

// 📝 കുട്ടിയുടെ വിവരങ്ങൾ തിരുത്താൻ
app.put('/api/students/:id', (req, res) => {
    const jsonPath = path.join(__dirname, 'students.json');
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error" });
        let students = JSON.parse(data);
        const index = students.findIndex(s => s.id === req.params.id);
        if (index !== -1) {
            students[index] = { ...students[index], ...req.body };
            fs.writeFile(jsonPath, JSON.stringify(students, null, 2), () => {
                res.json({ message: "Updated" });
            });
        } else {
            res.status(404).json({ error: "Not Found" });
        }
    });
});

// ❌ കുട്ടിയെ ഡിലീറ്റ് ചെയ്യാൻ
app.delete('/api/students/:id', (req, res) => {
    const jsonPath = path.join(__dirname, 'students.json');
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error" });
        let students = JSON.parse(data);
        students = students.filter(s => s.id !== req.params.id);
        fs.writeFile(jsonPath, JSON.stringify(students, null, 2), () => {
            res.json({ message: "Deleted" });
        });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
