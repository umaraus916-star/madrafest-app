const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// എല്ലാ സ്റ്റാറ്റിക് ഫയലുകളും (HTML, CSS, JS) ഓട്ടോമാറ്റിക് ആയി ലോഡ് ചെയ്യാൻ ഇത് സഹായിക്കും
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// ഫയലുകൾ കൃത്യമായി എടുക്കാനുള്ള ഫങ്ഷൻ
const sendFileIfExists = (fileName, res) => {
    let filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'public', fileName);
    }
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send(`<h3>Error 404: ${fileName} എന്ന ഫയൽ കണ്ടെത്താനായില്ല!</h3><p>നിങ്ങളുടെ ഫോൾഡറിൽ ഈ പേര് കൃത്യമാണോ എന്ന് പരിശോധിക്കുക.</p>`);
    }
};

// 🌐 എല്ലാ പ്രധാന പേജുകളുടെയും റൂട്ടുകൾ താഴെ നൽകുന്നു:

app.get('/', (req, res) => sendFileIfExists('home.html', res));
app.get('/home.html', (req, res) => sendFileIfExists('home.html', res));
app.get('/admin.html', (req, res) => sendFileIfExists('admin.html', res));
app.get('/judge.html', (req, res) => sendFileIfExists('judge.html', res));
app.get('/result.html', (req, res) => sendFileIfExists('result.html', res));

// 📋 കുട്ടികളുടെ ലിസ്റ്റ് എടുക്കാനുള്ള API
app.get('/api/students', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) {
        jsonPath = path.join(__dirname, 'public', 'students.json');
    }
    if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        res.json(data);
    } else {
        res.json([]);
    }
});

// ➕ പുതിയ കുട്ടിയെ ആഡ് ചെയ്യാൻ
app.post('/api/students', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) jsonPath = path.join(__dirname, 'public', 'students.json');
    let data = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : [];
    data.push(req.body);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    res.json({ message: "Student Added Successfully" });
});

// 📝 കുട്ടിയുടെ വിവരങ്ങൾ തിരുത്താൻ
app.put('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) jsonPath = path.join(__dirname, 'public', 'students.json');
    if (fs.existsSync(jsonPath)) {
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const index = data.findIndex(s => s.id === studentId);
        if (index !== -1) {
            data[index] = { ...data[index], ...req.body };
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
            return res.json({ message: "Student Updated" });
        }
    }
    res.status(404).json({ error: "Not Found" });
});

// ❌ കുട്ടിയെ ഡിലീറ്റ് ചെയ്യാൻ
app.delete('/api/students/:id', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) jsonPath = path.join(__dirname, 'public', 'students.json');
    if (fs.existsSync(jsonPath)) {
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        data = data.filter(student => student.id !== req.params.id);
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        res.json({ message: "Student Deleted" });
    } else {
        res.status(404).json({ error: "Not Found" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
