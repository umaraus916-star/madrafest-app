const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// വിദ്യാർത്ഥികളുടെ ലിസ്റ്റ് എടുക്കാൻ
app.get('/api/students', (req, res) => {
    fs.readFile(path.join(__dirname, 'students.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        res.json(JSON.parse(data || '[]'));
    });
});

// കുട്ടിയുടെ ഗ്രൂപ്പും മത്സരങ്ങളും ഒരേസമയം അപ്‌ഡേറ്റ് ചെയ്യാനുള്ള പുതിയ API
app.post('/api/register-event', (req, res) => {
    const { id, team, gender, category, events } = req.body;

    fs.readFile(path.join(__dirname, 'students.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        
        let students = JSON.parse(data || '[]');
        let studentIndex = students.findIndex(s => s.id === id || s.id === Number(id).toString());

        if (studentIndex !== -1) {
            // കുട്ടിയുടെ ഗ്രൂപ്പ്, ജെൻഡർ, കാറ്റഗറി, മത്സരങ്ങൾ എന്നിവ ഇവിടെ അപ്‌ഡേറ്റ് ചെയ്യുന്നു
            students[studentIndex].team = team;
            students[studentIndex].gender = gender;
            students[studentIndex].category = category;
            students[studentIndex].events = events; // മത്സരങ്ങളുടെ ലിസ്റ്റ് അറേ ആയി സേവ് ചെയ്യുന്നു

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
