const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// പാസ്‌വേഡ് സൂക്ഷിക്കുന്ന ഫയലിന്റെ സ്ഥാനം
const PASS_FILE = path.join(__dirname, 'passwords.json');

// ഈ ഫയൽ നിലവിൽ ഇല്ലെങ്കിൽ സെർവർ തന്നെ പുതിയ ഫയൽ ഉണ്ടാക്കും (ക്രാഷ് ആകുന്നത് തടയാൻ)
if (!fs.existsSync(PASS_FILE)) {
    fs.writeFileSync(PASS_FILE, JSON.stringify({
        admin: "admin123",
        staff: "staff123",
        judge: "judge123"
    }, null, 4));
}

// 1. പ്രധാന റൂട്ടിൽ നേരിട്ട് add.html പേജ് കാണിക്കുന്നു
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

// 2. ആരെങ്കിലും home.html എന്ന് അടിച്ചു വന്നാലും add.html കാണിക്കുന്നു
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

// 3. വിദ്യാർത്ഥികളുടെ വിവരങ്ങൾ എടുക്കാനുള്ള API
app.get('/api/students', (req, res) => {
    const studentsFile = path.join(__dirname, 'students.json');
    if (!fs.existsSync(studentsFile)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(studentsFile)));
});

// 4. ഇവന്റ് രജിസ്റ്റർ ചെയ്യാനുള്ള API
app.post('/api/register-event', (req, res) => {
    const { id, team, gender, category, events } = req.body;
    const studentsFile = path.join(__dirname, 'students.json');
    
    if (!fs.existsSync(studentsFile)) {
        return res.status(500).send("Error reading file");
    }
    
    let students = JSON.parse(fs.readFileSync(studentsFile));
    let studentIndex = students.findIndex(s => s.id == id);
    
    if (studentIndex !== -1) {
        students[studentIndex].team = team;
        students[studentIndex].gender = gender;
        students[studentIndex].category = category;
        students[studentIndex].events = events;
        
        fs.writeFileSync(studentsFile, JSON.stringify(students, null, 4));
        res.json({ success: true, message: "വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു" });
    } else {
        res.status(444).json({ success: false, message: "Student not found" });
    }
});

// 5. 🔴 നമ്മൾ പുതുതായി ചേർത്ത പാസ്‌വേഡ് മാറ്റാനുള്ള സുരക്ഷിതമായ API
app.post('/api/update-password', (req, res) => {
    const { role, newPassword } = req.body;
    
    if (!newPassword || newPassword.trim() === "") {
        return res.status(400).json({ success: false, message: "Invalid password" });
    }
    
    try {
        let passwords = JSON.parse(fs.readFileSync(PASS_FILE));
        
        // പുതിയ പാസ്‌വേഡ് നൽകുന്നു
        passwords[role] = newPassword;
        
        // ഫയലിലേക്ക് സേവ് ചെയ്യുന്നു
        fs.writeFileSync(PASS_FILE, JSON.stringify(passwords, null, 4));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error writing password" });
    }
});

// സെർവർ റൺ ചെയ്യുന്ന ഭാഗം
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

