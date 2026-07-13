const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// 1. പ്രധാന റൂട്ടിൽ നേരിട്ട് add.html (മത്സരങ്ങൾ ചേർക്കുന്ന പേജ്) കാണിക്കുക
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

// 2. ആരെങ്കിലും home.html എന്ന് അടിച്ചാലും നേരിട്ട് add.html വരാൻ
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

app.get('/api/students', (req, res) => {
    fs.readFile(path.join(__dirname, 'students.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        res.json(JSON.parse(data || '[]'));
    });
});

app.post('/api/register-event', (req, res) => {
    const { id, team, gender, category, events } = req.body;

    fs.readFile(path.join(__dirname, 'students.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        
        let students = JSON.parse(data || '[]');
        let studentIndex = students.findIndex(s => s.id === id || s.id === Number(id).toString());

        if (studentIndex !== -1) {
            students[studentIndex].team = team;
            students[studentIndex].gender = gender;
            students[studentIndex].category = category;
            students[studentIndex].events = events;

            fs.writeFile(path.join(__dirname, 'students.json'), JSON.stringify(students, null, 4), (err) => {
                if (err) return res.status(500).send("Error saving data");
                res.json({ success: true, message: "വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!" });
            });
        } else {
            res.status(444).json({ success: false, message: "കുട്ടിയെ കണ്ടെത്താനായില്ല!" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
