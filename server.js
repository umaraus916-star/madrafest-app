const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// JSON ഡാറ്റ കൈകാര്യം ചെയ്യാൻ
app.use(express.json());

// നിങ്ങളുടെ HTML, CSS, JS ഫയലുകൾ കിടക്കുന്ന ഫോൾഡർ സ്റ്റാറ്റിക് ആയി സെറ്റ് ചെയ്യുന്നു
// (ഫയലുകൾ മെയിൻ ഫോൾഡറിലാണെങ്കിൽ __dirname ഉപയോഗിക്കാം)
app.use(express.static(__dirname));

// വിദ്യാർത്ഥികളുടെ എപിഐ റൂട്ട്
app.get('/api/students', (req, res) => {
    fs.readFile(path.join(__dirname, 'students.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: "ഡാറ്റ വായിക്കാൻ കഴിഞ്ഞില്ല" });
        }
        res.json(JSON.parse(data));
    });
});

// പ്രധാന ഹോം പേജിലേക്ക് പോകാൻ (ഡെഫോൾട്ട് റൂട്ട്)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// സെർവർ സ്റ്റാർട്ട് ചെയ്യുന്നു
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
