const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
// HTML ഫയലുകൾ കാണിക്കാൻ വേണ്ടിയുള്ള വരി:
app.use(express.static(path.join(__dirname)));

// കുട്ടികളുടെ ലിസ്റ്റ് എടുക്കാൻ
app.get('/api/students', (req, res) => {
    const data = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    res.json(data);
});

// പുതിയ കുട്ടിയെ ആഡ് ചെയ്യാൻ
app.post('/api/students', (req, res) => {
    const data = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    data.push(req.body);
    fs.writeFileSync('students.json', JSON.stringify(data, null, 2));
    res.json({ message: "Student Added Successfully" });
});

// കുട്ടിയെ ഡിലീറ്റ് ചെയ്യാൻ
app.delete('/api/students/:id', (req, res) => {
    let data = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    const studentId = req.params.id;
    data = data.filter(student => student.id !== studentId);
    fs.writeFileSync('students.json', JSON.stringify(data, null, 2));
    res.json({ message: "Student Deleted Successfully" });
});

// ഏതെങ്കിലും പേജ് എടുക്കുമ്പോൾ ഹോം പേജിലേക്ക് റീഡയറക്ട് ചെയ്യാൻ
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(3000, () => console.log("Server running on port 3000"));
