const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

// HTML ഫയലുകൾ നേരിട്ട് റൂട്ട് വഴി നൽകുന്നു
app.get('/admin.html', (req, res) => {
    let adminPath = path.join(__dirname, 'admin.html');
    if (!fs.existsSync(adminPath)) {
        adminPath = path.join(__dirname, 'public', 'admin.html');
    }
    res.sendFile(adminPath);
});

app.get('/home.html', (req, res) => {
    let homePath = path.join(__dirname, 'home.html');
    if (!fs.existsSync(homePath)) {
        homePath = path.join(__dirname, 'public', 'home.html');
    }
    res.sendFile(homePath);
});

// കുട്ടികളുടെ ലിസ്റ്റ് എടുക്കാൻ
app.get('/api/students', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) {
        jsonPath = path.join(__dirname, 'public', 'students.json');
    }
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    res.json(data);
});

// പുതിയ കുട്ടിയെ ആഡ് ചെയ്യാൻ
app.post('/api/students', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) {
        jsonPath = path.join(__dirname, 'public', 'students.json');
    }
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    data.push(req.body);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    res.json({ message: "Student Added Successfully" });
});

// കുട്ടിയെ ഡിലീറ്റ് ചെയ്യാൻ
app.delete('/api/students/:id', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) {
        jsonPath = path.join(__dirname, 'public', 'students.json');
    }
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const studentId = req.params.id;
    data = data.filter(student => student.id !== studentId);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    res.json({ message: "Student Deleted Successfully" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
