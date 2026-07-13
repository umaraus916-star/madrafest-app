const express = require('express');
const path = require('path');
const fs = require('fs'); // ഫയൽ കൈകാര്യം ചെയ്യാനുള്ള ലൈബ്രറി
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'students.json');

// ഫയലിൽ നിന്ന് ഡാറ്റ വായിക്കാനുള്ള ഫംഗ്ഷൻ
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// ഫയലിലേക്ക് ഡാറ്റ എഴുതാനുള്ള ഫംഗ്ഷൻ
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// റിസൾട്ടുകൾ നൽകാൻ (ഫയലിൽ നിന്ന് എടുക്കുന്നു)
app.get('/api/results', (req, res) => {
    const students = readData();
    res.json(students);
});

// ജഡ്ജിമാരിൽ നിന്നും മാർക്ക് സ്വീകരിച്ച് ഫയലിലേക്ക് സേവ് ചെയ്യാൻ
app.post('/api/submit-mark', (req, res) => {
    const { chestNumber, mark } = req.body;
    let students = readData();
    
    const student = students.find(s => s.chestNumber === chestNumber);
    
    if (student) {
        student.mark = mark; // മാർക്ക് മാറ്റുന്നു
        writeData(students); // ഫയലിലേക്ക് സ്ഥിരമായി സേവ് ചെയ്യുന്നു
        return res.json({ success: true, message: "Mark saved to database!" });
    } else {
        return res.status(404).json({ error: "Chest number കണ്ടെത്തിയില്ല!" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
