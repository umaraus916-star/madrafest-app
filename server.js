const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// 🔐 പാസ്‌വേഡുകൾ മെമ്മറിയിൽ സൂക്ഷിക്കുന്നു (Render-ൽ ഇത് തടസ്സമില്ലാതെ പ്രവർത്തിക്കും)
let passwords = {
    admin: "admin123",
    staff: "staff123",
    judge: "judge123"
};

// 1. പ്രധാന റൂട്ടിൽ നേരിട്ട് add.html പേജ് കാണിക്കുന്നു
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

// 2. ആരെങ്കിലും home.html എന്ന് അടിച്ചു വന്നാലും add.html കാണിക്കുന്നു
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

// 3. പാസ്‌വേഡ് ശരിയാണോ എന്ന് പരിശോധിക്കാനുള്ള സുരക്ഷിതമായ API
app.post('/api/verify-password', (req, res) => {
    const { role, password } = req.body;
    if (passwords[role] === password) {
        return res.json({ success: true });
    }
    res.json({ success: false });
});

// 4. വിദ്യാർത്ഥികളുടെ വിവരങ്ങൾ എടുക്കാനുള്ള API
app.get('/api/students', (req, res) => {
    const studentsFile = path.join(__dirname, 'students.json');
    if (!fs.existsSync(studentsFile)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(studentsFile)));
});

// 5. ഇവന്റ് രജിസ്റ്റർ ചെയ്യാനുള്ള API
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

// 6. 🔴 പാസ്‌വേഡ് മാറ്റാനുള്ള പുതിയ API (മെമ്മറി അപ്‌ഡേറ്റ് മാത്രം - എറർ വരില്ല)
app.post('/api/update-password', (req, res) => {
    const { role, newPassword } = req.body;
    
    if (!newPassword || newPassword.trim() === "") {
        return res.status(400).json({ success: false, message: "Invalid password" });
    }
    
    // മെമ്മറിയിലെ പാസ്‌വേഡ് ലിസ്റ്റിൽ പുതിയത് മാറ്റിച്ചേർക്കുന്നു
    passwords[role] = newPassword;
    res.json({ success: true });
});

// സെർവർ സ്റ്റാർട്ട് ചെയ്യുന്നു
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

