const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// static ഫയലുകൾ രണ്ട് ഫോൾഡറുകളിൽ നിന്നും ലോഡ് ചെയ്യാൻ അനുവദിക്കുന്നു
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// ഫയലുകൾ എവിടെയാണെങ്കിലും കണ്ടെത്തി അയക്കാനുള്ള ഫങ്ഷൻ
const sendHtmlFile = (fileName, res) => {
    let filePath = path.join(__dirname, fileName);
    // മെയിൻ ഫോൾഡറിൽ ഇല്ലെങ്കിൽ public ഫോൾഡറിൽ നോക്കും
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'public', fileName);
    }
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send(`<h3>Error 404: ${fileName} കണ്ടെത്തിയില്ല!</h3><p>നിങ്ങളുടെ ഫോൾഡറിൽ ഫയലിന്റെ പേര് കൃത്യമാണോ എന്ന് പരിശോധിക്കുക.</p>`);
    }
};

// 🌐 റൂട്ടുകൾ
app.get('/', (req, res) => sendHtmlFile('home.html', res));
app.get('/home.html', (req, res) => sendHtmlFile('home.html', res));
app.get('/admin.html', (req, res) => sendHtmlFile('admin.html', res));
app.get('/judge.html', (req, res) => sendHtmlFile('judge.html', res));
app.get('/result.html', (req, res) => sendHtmlFile('result.html', res));

// 📋 API
app.get('/api/students', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) jsonPath = path.join(__dirname, 'public', 'students.json');
    
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) return res.json([]);
        res.json(JSON.parse(data));
    });
});

app.post('/api/students', (req, res) => {
    let jsonPath = path.join(__dirname, 'students.json');
    if (!fs.existsSync(jsonPath)) jsonPath = path.join(__dirname, 'public', 'students.json');
    
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        let students = err ? [] : JSON.parse(data);
        students.push(req.body);
        fs.writeFile(jsonPath, JSON.stringify(students, null, 2), () => res.json({ message: "Success" }));
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
