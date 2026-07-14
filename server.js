const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// 🔐 പാസ്‌വേഡുകൾ മെമ്മറിയിൽ സൂക്ഷിക്കുന്നു
let passwords = {
    admin: "admin123",
    staff: "staff123",
    judge: "judge123"
};

// 1. പ്രവേശന കവാടം
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

// 2. പാസ്‌വേഡ് പരിശോധിക്കാനുള്ള സുരക്ഷിതമായ API
app.post('/api/verify-password', (req, res) => {
    const { role, password } = req.body;
    if (passwords[role] === password) {
        return res.json({ success: true });
    }
    res.json({ success: false });
});

// 3. 🟢 നിങ്ങളുടെ വെബ്‌സൈറ്റിലെ ഡാറ്റ എറർ ഇല്ലാതെ ലോഡ് ചെയ്യാനുള്ള ശരിയായ API
app.get('/api/students', (req, res) => {
    const studentsFile = path.join(__dirname, 'students.json');
    try {
        if (!fs.existsSync(studentsFile)) {
            return res.json([]);
        }
        const data = fs.readFileSync(studentsFile, 'utf8');
        res.json(JSON.parse(data || '[]'));
    } catch (err) {
        res.status(500).json([]);
    }
});

// 4. ഇവന്റ് രജിസ്റ്റർ ചെയ്യാനുള്ള API
app.post('/api/register-event', (req, res) => {
    const { id, team, gender, category, events } = req.body;
    const studentsFile = path.join(__dirname, 'students.json');
    
    try {
        let students = [];
        if (fs.existsSync(studentsFile)) {
            students = JSON.parse(fs.readFileSync(studentsFile, 'utf8') || '[]');
        }
        
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
    } catch (error) {
        res.status(500).send("Error updating file");
    }
});

// 5. പാസ്‌വേഡ് മാറ്റാനുള്ള API
app.post('/api/update-password', (req, res) => {
    const { role, newPassword } = req.body;
    if (!newPassword || newPassword.trim() === "") {
        return res.status(400).json({ success: false, message: "Invalid password" });
    }
    passwords[role] = newPassword;
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

